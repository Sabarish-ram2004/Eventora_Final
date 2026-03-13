package com.eventora.service;

import com.eventora.exception.EventoraException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;
import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {
    private final RedisTemplate<String, Object> redisTemplate;
    private final JavaMailSender mailSender;

    @Value("${app.otp.expiry-minutes}") private int otpExpiryMinutes;
    @Value("${app.otp.max-attempts}") private int maxAttempts;
    @Value("${app.otp.length}") private int otpLength;
    @Value("${spring.mail.username}") private String fromEmail;

    private static final String OTP_PREFIX = "eventora:otp:";
    private static final String ATTEMPT_PREFIX = "eventora:otp:attempt:";

    public void sendOtp(String email, String type) {
        String otp = generateOtp();
        String key = OTP_PREFIX + type + ":" + email;
        String attemptKey = ATTEMPT_PREFIX + type + ":" + email;

        redisTemplate.opsForValue().set(key, otp, otpExpiryMinutes, TimeUnit.MINUTES);
        redisTemplate.opsForValue().set(attemptKey, "0", otpExpiryMinutes, TimeUnit.MINUTES);

        sendOtpEmail(email, otp, type);
        log.info("OTP sent to {} for type {}", email, type);
    }

    public void verifyOtp(String email, String otp, String type) {
        String key = OTP_PREFIX + type + ":" + email;
        String attemptKey = ATTEMPT_PREFIX + type + ":" + email;

        String storedOtp = (String) redisTemplate.opsForValue().get(key);
        if (storedOtp == null) {
            throw EventoraException.badRequest("OTP expired or not found. Please request a new one.");
        }

        String attempts = (String) redisTemplate.opsForValue().get(attemptKey);
        int currentAttempts = attempts != null ? Integer.parseInt(attempts) : 0;

        if (currentAttempts >= maxAttempts) {
            redisTemplate.delete(key);
            throw EventoraException.badRequest("Maximum OTP attempts exceeded. Please request a new OTP.");
        }

        if (!storedOtp.equals(otp)) {
            redisTemplate.opsForValue().increment(attemptKey);
            int remaining = maxAttempts - currentAttempts - 1;
            throw EventoraException.badRequest("Invalid OTP. " + remaining + " attempts remaining.");
        }

        redisTemplate.delete(key);
        redisTemplate.delete(attemptKey);
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < otpLength; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    @Async
    void sendOtpEmail(String toEmail, String otp, String type) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(getOtpSubject(type));
            helper.setText(buildOtpEmailHtml(otp, type), true);
            mailSender.send(message);
            log.info("OTP email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email: {}", e.getMessage());
        }
    }

    private String getOtpSubject(String type) {
        return switch (type.toUpperCase()) {
            case "REGISTRATION" -> "🎉 Welcome to Eventora - Verify Your Email";
            case "RESET" -> "🔐 Eventora - Password Reset OTP";
            default -> "Eventora - Your OTP Code";
        };
    }

    private String buildOtpEmailHtml(String otp, String type) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;background:#0a0a1a;">
              <div style="max-width:600px;margin:40px auto;background:linear-gradient(135deg,#1a1a3e,#2d1b69);border-radius:20px;overflow:hidden;">
                <div style="background:linear-gradient(135deg,#1a1a3e,#6b21a8);padding:40px;text-align:center;">
                  <h1 style="color:#fbbf24;font-size:32px;margin:0;letter-spacing:2px;">EVENTORA</h1>
                  <p style="color:#c4b5fd;margin:8px 0 0;">AI-Powered Event Management</p>
                </div>
                <div style="padding:40px;text-align:center;">
                  <h2 style="color:#f9fafb;margin:0 0 16px;">Your Verification Code</h2>
                  <p style="color:#9ca3af;margin:0 0 32px;">Use this OTP to %s. Valid for %d minutes.</p>
                  <div style="background:rgba(251,191,36,0.1);border:2px solid #fbbf24;border-radius:16px;padding:24px;display:inline-block;margin:0 0 32px;">
                    <span style="font-size:48px;font-weight:800;letter-spacing:12px;color:#fbbf24;">%s</span>
                  </div>
                  <p style="color:#6b7280;font-size:14px;">Never share this code with anyone. Eventora will never ask for your OTP.</p>
                </div>
                <div style="padding:24px;text-align:center;background:rgba(0,0,0,0.3);">
                  <p style="color:#4b5563;font-size:12px;margin:0;">© 2024 Eventora. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(type.equalsIgnoreCase("RESET") ? "reset your password" : "complete registration", otpExpiryMinutes, otp);
    }
}
