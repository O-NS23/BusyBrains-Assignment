package com.busybrains.ecommerce.service;

import com.busybrains.ecommerce.dto.ChangePasswordRequest;
import com.busybrains.ecommerce.dto.ProfileUpdateRequest;
import com.busybrains.ecommerce.model.User;
import com.busybrains.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service for managing user profile operations:
 * - Get current profile
 * - Update name / email / phone
 * - Change password
 */
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Retrieve the authenticated user's profile.
     */
    public User getProfile(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Update the user's profile fields (fullName, email, phone).
     *
     * @param username the current user's username (from JWT)
     * @param request  update payload
     * @return the updated User entity
     */
    public User updateProfile(String username, ProfileUpdateRequest request) {
        User user = getProfile(username);

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            // Check if email is already used by another account
            userRepository.findByEmail(request.getEmail()).ifPresent(existing -> {
                if (!existing.getUsername().equals(username)) {
                    throw new IllegalArgumentException("Email already in use by another account");
                }
            });
            user.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        return userRepository.save(user);
    }

    /**
     * Change the authenticated user's password.
     *
     * @param username the current user's username (from JWT)
     * @param request  contains currentPassword and newPassword
     */
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = getProfile(username);

        // OAuth2 users may not have a local password
        if (user.getPassword() == null) {
            throw new IllegalStateException("Cannot change password for SSO-only accounts");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
