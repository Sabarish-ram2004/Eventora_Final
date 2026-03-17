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

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Eventora OTP Verification");

            String html = "<div style='font-family:Arial'>"
                    + "<h2>Eventora OTP Verification</h2>"
                    + "<p>Your OTP for <b>" + type + "</b> is:</p>"
                    + "<h1 style='color:#4CAF50'>" + otp + "</h1>"
                    + "<p>This OTP will expire soon.</p>"
                    + "</div>";

            helper.setText(html, true);

            mailSender.send(message);

            log.info("OTP email sent to {}", toEmail);

        } catch (MessagingException e) {
            log.error("Failed to send OTP mail", e);
            throw new RuntimeException("Failed to send email");
        }
    }

}
