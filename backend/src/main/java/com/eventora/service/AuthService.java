package com.eventora.service;

import com.eventora.exception.EventoraException;
import com.eventora.model.User;
import com.eventora.repository.UserRepository;
import com.eventora.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final OtpService otpService;

    @Transactional
    public Map<String, Object> register(String username, String email, String password, String role,
                                         String firstName, String lastName, String phone) {
        if (userRepository.existsByEmail(email)) throw EventoraException.conflict("Email already registered");
        if (userRepository.existsByUsername(username)) throw EventoraException.conflict("Username already taken");

        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(User.UserRole.valueOf(role.toUpperCase()))
                .firstName(firstName)
                .lastName(lastName)
                .phone(phone)
                .isEmailVerified(false)
                .isActive(true)
                .build();

        userRepository.save(user);
        otpService.sendOtp(email, "REGISTRATION");
        return Map.of("message", "Registration successful. OTP sent to " + email, "email", email);
    }

    @Transactional
    public Map<String, String> verifyEmail(String email, String otp) {
        otpService.verifyOtp(email, otp, "REGISTRATION");
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> EventoraException.notFound("User not found"));
        user.setIsEmailVerified(true);
        userRepository.save(user);
        return Map.of("message", "Email verified successfully. You can now login.");
    }

    public Map<String, Object> login(String emailOrUsername, String password) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(emailOrUsername, password));

        User user = userRepository.findByEmailOrUsername(emailOrUsername, emailOrUsername)
                .orElseThrow(() -> EventoraException.notFound("User not found"));

        if (!user.getIsEmailVerified()) {
            throw EventoraException.forbidden("Please verify your email before logging in");
        }
        if (!user.getIsActive()) {
            throw EventoraException.forbidden("Account suspended. Contact support.");
        }

        var userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPasswordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));

        String token = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        return Map.of(
                "token", token,
                "refreshToken", refreshToken,
                "user", Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "role", user.getRole(),
                        "firstName", user.getFirstName() != null ? user.getFirstName() : "",
                        "lastName", user.getLastName() != null ? user.getLastName() : ""
                )
        );
    }

    public Map<String, String> forgotPassword(String email) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> EventoraException.notFound("No account found with this email"));
        otpService.sendOtp(email, "RESET");
        return Map.of("message", "Password reset OTP sent to " + email);
    }

    @Transactional
    public Map<String, String> resetPassword(String email, String otp, String newPassword) {
        otpService.verifyOtp(email, otp, "RESET");
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> EventoraException.notFound("User not found"));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return Map.of("message", "Password reset successfully");
    }
}
