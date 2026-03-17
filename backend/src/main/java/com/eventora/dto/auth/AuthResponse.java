package com.eventora.dto.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;
    private String refreshToken;

    @Builder.Default
    private String tokenType = "Bearer";

    private String userId;   // ⭐ FIXED
    private String username;
    private String email;
    private String role;
    private String fullName;
    private String profileImage;
    private boolean emailVerified;
    private String vendorId; // ⭐ also safer
}