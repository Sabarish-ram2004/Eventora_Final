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
    @Size(min = 3, max = 30, message = "Username must be 3–30 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_.-]+$", message = "Username contains invalid characters")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 120, message = "Email is too long")
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,120}$", message = "Password must contain uppercase, lowercase and number")
    private String password;

    @NotBlank(message = "First name is required")
    @Size(max = 60)
    private String firstName;

    @Size(max = 60)
    private String lastName;

    @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "Invalid phone number")
    private String phone;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "USER|VENDOR|ADMIN", message = "Role must be USER or VENDOR or ADMIN")
    private String role;

}
