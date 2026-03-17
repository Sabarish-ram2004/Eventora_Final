package com.eventora.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    @NotBlank(message = "Email or Username is required")
    @Size(max = 100, message = "Email or Username is too long")
    private String emailOrUsername;

    @NotBlank(message = "Password is required")
    @Size(max = 120, message = "Password is too long")
    private String password;
}