package com.busybrains.ecommerce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the BusyBrains E-Commerce Spring Boot application.
 * Provides JWT authentication, Google SSO, and RBAC (Admin / User roles).
 */
@SpringBootApplication
public class EcommerceApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcommerceApplication.class, args);
    }
}
