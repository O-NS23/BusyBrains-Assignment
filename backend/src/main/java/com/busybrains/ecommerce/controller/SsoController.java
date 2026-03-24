package com.busybrains.ecommerce.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Small helper endpoint so the frontend can tell whether Google SSO is
 * configured locally before redirecting the user into the OAuth flow.
 */
@RestController
@RequestMapping("/api/auth/sso")
public class SsoController {

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        boolean configured = googleClientId != null
                && !googleClientId.isBlank()
                && !"YOUR_GOOGLE_CLIENT_ID".equals(googleClientId);

        return ResponseEntity.ok(Map.of(
                "provider", "google",
                "configured", configured
        ));
    }
}
