package com.eventora.dto.auth;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be 3–50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_.-]+$", message = "Username contains invalid characters")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 120, message = "Email is too long")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 120, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "First name is required")
    @Size(max = 60)
    private String firstName;

    @Size(max = 60)
    private String lastName;

    @Pattern(regexp = "^[0-9]{7,15}$", message = "Phone must be numeric (7–15 digits)")
    private String phone;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "CUSTOMER|VENDOR|ADMIN", message = "Role must be CUSTOMER or VENDOR or ADMIN")
    private String role;
}