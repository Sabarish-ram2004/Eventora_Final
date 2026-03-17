package com.eventora.service;

import com.eventora.exception.EventoraException;
import com.eventora.model.User;
import com.eventora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final SendGridEmailService sendGridEmailService;
    private final UserRepository userRepository;

    @Value("${OTP_LENGTH}")
    private int otpLength;

    @Value("${OTP_EXPIRY_MINUTES}")
    private int expiry;

    private static final String OTP_PREFIX = "eventora:otp:";

    public void sendOtp(String email, String type) {

        String otp = generateOtp();
        String key = OTP_PREFIX + type + ":" + email;

        redisTemplate.opsForValue()
                .set(key, otp, 
                    expiry, TimeUnit.MINUTES);

        sendGridEmailService.sendOtpMail(email, otp, type);

        log.info("OTP sent {}", email);
    }

    public void verifyOtp(String email, String otp, String type) {

        String key = OTP_PREFIX + type + ":" + email;

        String storedOtp = (String) redisTemplate.opsForValue().get(key);

        if (storedOtp == null)
            throw EventoraException.badRequest("OTP expired");

        if (!storedOtp.equals(otp))
            throw EventoraException.badRequest("Invalid OTP");

        if (type.equalsIgnoreCase("REGISTRATION")) {

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> EventoraException.notFound("User not found"));

            user.setIsEmailVerified(true);
            userRepository.save(user);
        }

        redisTemplate.delete(key);

        log.info("OTP verified {}", email);
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        StringBuilder otp = new StringBuilder();

        for (int i = 0; i < otpLength; i++)
            otp.append(random.nextInt(10));

        return otp.toString();
    }
}