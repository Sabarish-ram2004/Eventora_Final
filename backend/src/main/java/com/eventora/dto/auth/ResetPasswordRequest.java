package com.eventora.dto.auth;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResetPasswordRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 120, message = "Email is too long")
    private String email;

    @NotBlank(message = "OTP is required")
    @Pattern(regexp = "^[0-9]{4,8}$", message = "OTP must be numeric and 4–8 digits")
    private String otp;

    @NotBlank(message = "New password is required")
    @Size(min = 8, max = 120, message = "Password must be 8–120 characters")
    private String newPassword;
}