package com.busybrains.ecommerce.service;

import com.busybrains.ecommerce.dto.*;
import com.busybrains.ecommerce.model.Role;
import com.busybrains.ecommerce.model.User;
import com.busybrains.ecommerce.repository.UserRepository;
import com.busybrains.ecommerce.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service handling user registration and login (JWT-based authentication).
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    /**
     * Register a new user.
     *
     * @param request registration data
     * @return AuthResponse containing JWT and user info
     * @throws IllegalArgumentException if username or email is already taken
     */
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username '" + request.getUsername() + "' is already taken");
        }
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email '" + request.getEmail() + "' is already registered");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .fullName(request.getFullName())
                .role(Role.ROLE_USER)
                .build();

        userRepository.save(user);

        String token = jwtUtils.generateToken(user);
        return buildAuthResponse(user, token);
    }

    /**
     * Authenticate an existing user with username + password.
     *
     * @param request login credentials
     * @return AuthResponse containing JWT and user info
     */
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = (User) authentication.getPrincipal();
        String token = jwtUtils.generateToken(user);
        return buildAuthResponse(user, token);
    }

    // -------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole().name())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .build();
    }
}
