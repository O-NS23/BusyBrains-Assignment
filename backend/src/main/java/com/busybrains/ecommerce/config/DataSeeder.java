package com.busybrains.ecommerce.config;

import com.busybrains.ecommerce.model.Product;
import com.busybrains.ecommerce.model.Role;
import com.busybrains.ecommerce.model.User;
import com.busybrains.ecommerce.repository.ProductRepository;
import com.busybrains.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Seeds the database with predefined users and sample products on startup.
 *
 * <p>Predefined users:
 * <ul>
 *   <li>admin / password  → ROLE_ADMIN</li>
 *   <li>user  / password  → ROLE_USER</li>
 * </ul>
 *
 * <p>Passwords are BCrypt-encoded as per security requirements.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedProducts();
    }

    // -------------------------------------------------------
    // Users
    // -------------------------------------------------------

    private void seedUsers() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("password"))
                    .email("admin@busybrains.com")
                    .fullName("Admin User")
                    .role(Role.ROLE_ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Seeded admin user");
        }

        if (!userRepository.existsByUsername("user")) {
            User user = User.builder()
                    .username("user")
                    .password(passwordEncoder.encode("password"))
                    .email("user@busybrains.com")
                    .fullName("Regular User")
                    .role(Role.ROLE_USER)
                    .build();
            userRepository.save(user);
            log.info("Seeded regular user");
        }
    }

    // -------------------------------------------------------
    // Products
    // -------------------------------------------------------

    private void seedProducts() {
        if (productRepository.count() > 0) return;

        productRepository.save(Product.builder()
                .name("Apple iPhone 15 Pro")
                .description("Latest iPhone with A17 Pro chip, titanium design, 48MP camera system, and USB-C connectivity.")
                .price(new BigDecimal("134900"))
                .imageUrl("https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400")
                .category("Electronics")
                .stock(50)
                .rating(4.8)
                .build());

        productRepository.save(Product.builder()
                .name("Samsung Galaxy S24 Ultra")
                .description("200MP camera, S Pen included, Snapdragon 8 Gen 3, 5000mAh battery.")
                .price(new BigDecimal("129999"))
                .imageUrl("https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=400")
                .category("Electronics")
                .stock(35)
                .rating(4.7)
                .build());

        productRepository.save(Product.builder()
                .name("Sony WH-1000XM5 Headphones")
                .description("Industry-leading noise cancellation, 30-hour battery, premium sound quality.")
                .price(new BigDecimal("29990"))
                .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400")
                .category("Electronics")
                .stock(100)
                .rating(4.9)
                .build());

        productRepository.save(Product.builder()
                .name("Nike Air Max 270")
                .description("Lifestyle shoe with Max Air unit for all-day cushioning and style.")
                .price(new BigDecimal("12995"))
                .imageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400")
                .category("Footwear")
                .stock(200)
                .rating(4.5)
                .build());

        productRepository.save(Product.builder()
                .name("Levi's 501 Original Jeans")
                .description("The original straight-leg jeans. Button fly, iconic style since 1873.")
                .price(new BigDecimal("3999"))
                .imageUrl("https://images.unsplash.com/photo-1542272604-787c3835535d?w=400")
                .category("Clothing")
                .stock(150)
                .rating(4.4)
                .build());

        productRepository.save(Product.builder()
                .name("MacBook Pro 14\" M3")
                .description("Apple M3 chip, 18-hour battery, Liquid Retina XDR display, 16GB RAM.")
                .price(new BigDecimal("199900"))
                .imageUrl("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400")
                .category("Electronics")
                .stock(25)
                .rating(4.9)
                .build());

        productRepository.save(Product.builder()
                .name("Fitbit Charge 6")
                .description("Advanced health tracker with built-in GPS, heart rate monitoring, and 7-day battery.")
                .price(new BigDecimal("14999"))
                .imageUrl("https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400")
                .category("Electronics")
                .stock(80)
                .rating(4.3)
                .build());

        productRepository.save(Product.builder()
                .name("Instant Pot Duo 7-in-1")
                .description("Pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, and warmer.")
                .price(new BigDecimal("8499"))
                .imageUrl("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400")
                .category("Home & Kitchen")
                .stock(60)
                .rating(4.6)
                .build());

        productRepository.save(Product.builder()
                .name("The Lean Startup - Eric Ries")
                .description("How today's entrepreneurs use continuous innovation to create radically successful businesses.")
                .price(new BigDecimal("499"))
                .imageUrl("https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400")
                .category("Books")
                .stock(300)
                .rating(4.7)
                .build());

        productRepository.save(Product.builder()
                .name("Adidas Ultraboost 23")
                .description("Running shoe with Continental rubber outsole, Primeknit+ upper, and BOOST midsole.")
                .price(new BigDecimal("17999"))
                .imageUrl("https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400")
                .category("Footwear")
                .stock(90)
                .rating(4.6)
                .build());

        log.info("Seeded {} sample products", productRepository.count());
    }
}
