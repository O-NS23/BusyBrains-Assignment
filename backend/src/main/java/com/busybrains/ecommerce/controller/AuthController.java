package com.busybrains.ecommerce.controller;

import com.busybrains.ecommerce.dto.AuthResponse;
import com.busybrains.ecommerce.dto.LoginRequest;
import com.busybrains.ecommerce.dto.RegisterRequest;
import com.busybrains.ecommerce.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 * All routes under /api/auth are publicly accessible.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register and login endpoints")
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/register
     * Register a new user account (role: USER by default).
     */
    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/login
     * Authenticate an existing user and receive a JWT token.
     */
    @PostMapping("/login")
    @Operation(summary = "Log in with username and password")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
