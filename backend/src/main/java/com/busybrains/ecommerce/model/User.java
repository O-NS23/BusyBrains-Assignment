package com.busybrains.ecommerce.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * User entity that implements Spring Security's UserDetails interface.
 * Supports both local JWT login and OAuth2 SSO logins.
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    @NotBlank(message = "Username is required")
    private String username;

    /** Nullable for OAuth2 SSO users who never set a local password. */
    private String password;

    @Column(unique = true)
    @Email(message = "Email must be valid")
    private String email;

    @Column(name = "full_name")
    private String fullName;

    /** Phone number for profile management. */
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.ROLE_USER;

    /**
     * OAuth2 provider identifier (e.g., "google").
     * Null for locally registered users.
     */
    @Column(name = "oauth_provider")
    private String oauthProvider;

    /**
     * Subject identifier from the OAuth2 provider.
     * Used to match returning SSO users.
     */
    @Column(name = "oauth_id")
    private String oauthId;

    // =========================================================
    // Spring Security UserDetails implementation
    // =========================================================

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
