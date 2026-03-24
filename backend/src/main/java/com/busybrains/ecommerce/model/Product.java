package com.busybrains.ecommerce.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Product entity representing items in the e-commerce catalog.
 * Admins can perform full CRUD; Users can only view.
 */
@Entity
@Table(name = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Product name is required")
    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    /** URL or path to the product image. */
    @Column(name = "image_url")
    private String imageUrl;

    /** Product category (e.g., Electronics, Clothing). */
    private String category;

    /** Stock quantity. */
    @Builder.Default
    private Integer stock = 0;

    /** Average rating out of 5. */
    @Builder.Default
    private Double rating = 0.0;
}
