package com.eventora.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    public void sendOtpMail(String toEmail, String otp, String type) {

        toEmail = toEmail.trim().toLowerCase();

        try {

            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Eventora – OTP Verification");

            String html = "<div style='font-family:Arial;padding:20px'>"
                    + "<h2 style='color:#333'>Eventora Email Verification</h2>"
                    + "<p>Your OTP for <b>" + type + "</b> is:</p>"
                    + "<h1 style='color:#4CAF50;letter-spacing:3px'>" + otp + "</h1>"
                    + "<p>This OTP will expire in few minutes.</p>"
                    + "<hr/>"
                    + "<small>If you didn’t request this, ignore this email.</small>"
                    + "</div>";

            helper.setText(html, true);

            mailSender.send(message);

            log.info("OTP email sent {}", toEmail);

        } catch (MessagingException e) {

            log.error("SMTP email failed", e);

            throw new RuntimeException("OTP email sending failed");
        }
    }

}
