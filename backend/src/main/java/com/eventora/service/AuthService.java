package com.eventora.service;

import com.eventora.dto.auth.AuthResponse;
import com.eventora.dto.auth.RegisterRequest;
import com.eventora.dto.common.ApiResponse;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final OtpService otpService;

    // ⭐ REGISTER
    @Transactional
    public ApiResponse<String> register(RegisterRequest request) {

        log.info("Register request for email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail()))
            throw EventoraException.conflict("Email already registered");

        if (userRepository.existsByUsername(request.getUsername()))
            throw EventoraException.conflict("Username already taken");

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(User.UserRole.valueOf(request.getRole().toUpperCase()))   // role already validated in DTO
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .isEmailVerified(false)
                .isActive(true)
                .build();

        userRepository.save(user);

        otpService.sendOtp(user.getEmail(), "REGISTRATION");

        return ApiResponse.success(
                "Registration successful. OTP sent to " + user.getEmail()
        );
    }

    // ⭐ VERIFY EMAIL
    @Transactional
    public ApiResponse<String> verifyEmail(String email, String otp) {

        otpService.verifyOtp(email, otp, "REGISTRATION");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> EventoraException.notFound("User not found"));

        user.setIsEmailVerified(true);
        userRepository.save(user);

        return ApiResponse.success("Email verified successfully. You can now login.");
    }

    // ⭐ LOGIN
    public ApiResponse<AuthResponse> login(String emailOrUsername, String password) {

        log.info("Login attempt: {}", emailOrUsername);

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(emailOrUsername, password)
            );
        } catch (Exception e) {
            log.error("Authentication failed for {}", emailOrUsername);
            throw EventoraException.unauthorized("Invalid credentials");
        }

        User user = userRepository
                .findByEmailOrUsername(emailOrUsername, emailOrUsername)
                .orElseThrow(() -> EventoraException.notFound("User not found"));

        if (!Boolean.TRUE.equals(user.getIsActive()))
            throw EventoraException.forbidden("Account suspended");

        if (!Boolean.TRUE.equals(user.getIsEmailVerified()))
            throw EventoraException.forbidden("Please verify your email first");

        var authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );

        var userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPasswordHash(),
                authorities
        );

        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        AuthResponse response = AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId().toString())   // ⭐ ensure DTO uses String
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .emailVerified(Boolean.TRUE.equals(user.getIsEmailVerified()))
                .build();

        return ApiResponse.success("Login successful", response);
    }

    // ⭐ FORGOT PASSWORD
    public ApiResponse<String> forgotPassword(String email) {

        userRepository.findByEmail(email)
                .orElseThrow(() -> EventoraException.notFound("No account found with this email"));

        otpService.sendOtp(email, "RESET");

        return ApiResponse.success("Password reset OTP sent to " + email);
    }

    // ⭐ RESET PASSWORD
    @Transactional
    public ApiResponse<String> resetPassword(String email, String otp, String newPassword) {

        otpService.verifyOtp(email, otp, "RESET");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> EventoraException.notFound("User not found"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ApiResponse.success("Password reset successful");
    }
}