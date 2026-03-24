package com.busybrains.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO returned after a successful authentication (login/register).
 * Contains the JWT token and basic user info.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private String role;
    private String email;
    private String fullName;
}
