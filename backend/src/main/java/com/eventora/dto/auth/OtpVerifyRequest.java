package com.eventora.dto.auth;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class OtpVerifyRequest {
    @NotBlank @Email
    private String email;
    @NotBlank
    private String otp;
}
