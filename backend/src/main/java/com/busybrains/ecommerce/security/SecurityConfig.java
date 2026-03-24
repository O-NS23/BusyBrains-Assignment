package com.busybrains.ecommerce.security;

import com.busybrains.ecommerce.model.Role;
import com.busybrains.ecommerce.model.User;
import com.busybrains.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Central Spring Security configuration.
 *
 * <p>Provides:
 * <ul>
 *   <li>JWT authentication for REST APIs</li>
 *   <li>OAuth2 / OpenID Connect login that auto-links local users</li>
 *   <li>RBAC so only admins can manage products</li>
 *   <li>CORS for the React frontend</li>
 * </ul>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .collect(Collectors.toList()));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // OAuth2 login needs short-lived server-side state while the handshake completes.
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/health").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/api-docs/**").permitAll()
                        .requestMatchers("/login/oauth2/**", "/oauth2/**", "/error").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers("/api/profile/**").authenticated()
                        .anyRequest().authenticated()
                )
                .headers(h -> h.frameOptions(f -> f.disable()))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .oauth2Login(oauth2 -> oauth2
                        .successHandler((request, response, authentication) -> {
                            OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
                            OAuth2User oauthUser = oauthToken.getPrincipal();
                            String provider = oauthToken.getAuthorizedClientRegistrationId();
                            String oauthId = extractSubject(oauthUser);
                            String email = firstNonBlank(
                                    oauthUser.getAttribute("email"),
                                    oauthUser.getAttribute("preferred_username")
                            );
                            String name = firstNonBlank(
                                    oauthUser.getAttribute("name"),
                                    oauthUser.getAttribute("given_name"),
                                    email,
                                    provider + " user"
                            );

                            User user = upsertOAuthUser(provider, oauthId, email, name);
                            String token = jwtUtils.generateToken(user);
                            response.sendRedirect(buildFrontendUrl("/oauth-callback")
                                    + "?token=" + token);
                        })
                        .failureHandler((request, response, exception) ->
                                response.sendRedirect(buildFrontendUrl("/login") + "?error=sso"))
                )
                .authenticationProvider(authenticationProvider());

        return http.build();
    }

    private User upsertOAuthUser(String provider, String oauthId, String email, String name) {
        return userRepository.findByOauthProviderAndOauthId(provider, oauthId)
                .or(() -> email == null ? Optional.empty() : userRepository.findByEmail(email))
                .map(existingUser -> {
                    existingUser.setOauthProvider(provider);
                    existingUser.setOauthId(oauthId);
                    if (existingUser.getEmail() == null && email != null) {
                        existingUser.setEmail(email);
                    }
                    if (existingUser.getFullName() == null || existingUser.getFullName().isBlank()) {
                        existingUser.setFullName(name);
                    }
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> userRepository.save(User.builder()
                        .username(generateUsername(email, name, provider))
                        .email(email)
                        .fullName(name)
                        .role(Role.ROLE_USER)
                        .oauthProvider(provider)
                        .oauthId(oauthId)
                        .build()));
    }

    private String extractSubject(OAuth2User oauthUser) {
        String subject = firstNonBlank(
                oauthUser.getAttribute("sub"),
                oauthUser.getAttribute("id"),
                oauthUser.getAttribute("oid")
        );
        if (subject == null) {
            throw new IllegalStateException("OAuth2 provider did not return a usable subject identifier");
        }
        return subject;
    }

    private String generateUsername(String email, String name, String provider) {
        String seed = firstNonBlank(email, name, provider + "_user");
        String baseUsername = seed.split("@")[0].replaceAll("[^a-zA-Z0-9]", "_");

        if (baseUsername.isBlank()) {
            baseUsername = provider + "_user";
        }

        String candidate = baseUsername;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = baseUsername + suffix++;
        }
        return candidate;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private String buildFrontendUrl(String targetPath) {
        URI baseUri = URI.create(frontendBaseUrl);
        String normalizedPath = Optional.ofNullable(baseUri.getPath())
                .filter(path -> !path.isBlank() && !"/".equals(path))
                .map(path -> path.endsWith("/login") ? path.substring(0, path.length() - "/login".length()) : path)
                .orElse("");

        return UriComponentsBuilder.newInstance()
                .scheme(baseUri.getScheme())
                .host(baseUri.getHost())
                .port(baseUri.getPort())
                .path(normalizedPath)
                .path(targetPath)
                .build()
                .toUriString();
    }
}
