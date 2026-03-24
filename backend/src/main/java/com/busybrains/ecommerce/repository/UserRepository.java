package com.busybrains.ecommerce.repository;

import com.busybrains.ecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for User entity providing standard CRUD operations
 * plus custom finder methods for authentication.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    /** Used during OAuth2 login to find an existing SSO-linked user. */
    Optional<User> findByOauthProviderAndOauthId(String oauthProvider, String oauthId);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
