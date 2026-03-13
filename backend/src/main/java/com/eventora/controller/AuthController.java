package com.eventora.controller;

import com.eventora.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> body) {
        var result = authService.register(
                (String) body.get("username"),
                (String) body.get("email"),
                (String) body.get("password"),
                (String) body.getOrDefault("role", "USER"),
                (String) body.get("firstName"),
                (String) body.get("lastName"),
                (String) body.get("phone")
        );
        return ResponseEntity.ok(result);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.verifyEmail(body.get("email"), body.get("otp")));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.login(body.get("emailOrUsername"), body.get("password")));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.forgotPassword(body.get("email")));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.resetPassword(
                body.get("email"), body.get("otp"), body.get("newPassword")));
    }
}
