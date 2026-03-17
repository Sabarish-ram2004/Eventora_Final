package com.eventora.service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;

import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SendGridEmailService {

    @Value("${sendgrid.api.key}")
    private String apiKey;

    public void sendOtpMail(String toEmail, String otp, String type) {

        try {

            Email from = new Email("syncoraevents@gmail.com");
            String subject = getSubject(type);

            Email to = new Email(toEmail);

            Content content = new Content(
                    "text/html",
                    buildOtpHtml(otp)
            );

            Mail mail = new Mail(from, subject, to, content);

            SendGrid sg = new SendGrid(apiKey);
            Request request = new Request();

            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sg.api(request);

            log.info("SendGrid status {}", response.getStatusCode());

        } catch (Exception e) {
            log.error("SendGrid mail error {}", e.getMessage());
        }
    }

    private String getSubject(String type) {
        return switch (type.toUpperCase()) {
            case "REGISTRATION" -> "Eventora Email Verification OTP";
            case "RESET" -> "Eventora Password Reset OTP";
            default -> "Eventora OTP";
        };
    }

    private String buildOtpHtml(String otp) {
        return """
                <div style='font-family:Arial;padding:20px'>
                <h2>Welcome to Eventora</h2>
                <p>Your OTP is:</p>
                <h1 style='color:#fbbf24'>%s</h1>
                <p>This OTP is valid for few minutes.</p>
                </div>
                """.formatted(otp);
    }
}