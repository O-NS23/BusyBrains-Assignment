package com.busybrains.ecommerce.security;

import com.busybrains.ecommerce.model.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * Utility class for generating and validating JWT tokens.
 * Tokens include the username and role as claims.
 */
@Slf4j
@Component
public class JwtUtils {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    /**
     * Generate a signed JWT token for an authenticated user.
     *
     * @param user the authenticated user
     * @return signed JWT string
     */
    public String generateToken(User user) {
        return Jwts.builder()
                .subject(user.getUsername())
                .claim("role", user.getRole().name())
                .claim("email", user.getEmail())
                .claim("fullName", user.getFullName())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSignKey())
                .compact();
    }

    /**
     * Extract the username (subject) from a JWT token.
     *
     * @param token JWT string
     * @return username
     */
    public String getUsernameFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Validate a JWT token for correct signature and expiry.
     *
     * @param token JWT string
     * @return true if valid, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    // -------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(
                java.util.Base64.getEncoder().encodeToString(jwtSecret.getBytes())
        );
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
