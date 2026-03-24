package com.busybrains.ecommerce.controller;

import com.busybrains.ecommerce.dto.ChangePasswordRequest;
import com.busybrains.ecommerce.dto.ProfileUpdateRequest;
import com.busybrains.ecommerce.model.User;
import com.busybrains.ecommerce.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for user profile management.
 * All endpoints require a valid JWT (authenticated user).
 */
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Tag(name = "Profile", description = "View and update user profile")
@SecurityRequirement(name = "bearerAuth")
public class ProfileController {

    private final ProfileService profileService;

    /**
     * GET /api/profile
     * Returns the currently authenticated user's profile.
     */
    @GetMapping
    @Operation(summary = "Get current user profile")
    public ResponseEntity<User> getProfile(Authentication auth) {
        User user = profileService.getProfile(auth.getName());
        // Clear sensitive fields before returning
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    /**
     * PUT /api/profile
     * Update profile fields (fullName, email, phone).
     */
    @PutMapping
    @Operation(summary = "Update user profile")
    public ResponseEntity<User> updateProfile(
            Authentication auth,
            @RequestBody ProfileUpdateRequest request
    ) {
        User updated = profileService.updateProfile(auth.getName(), request);
        updated.setPassword(null);
        return ResponseEntity.ok(updated);
    }

    /**
     * PUT /api/profile/change-password
     * Change the user's password (requires current password confirmation).
     */
    @PutMapping("/change-password")
    @Operation(summary = "Change user password")
    public ResponseEntity<Map<String, String>> changePassword(
            Authentication auth,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        profileService.changePassword(auth.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}
