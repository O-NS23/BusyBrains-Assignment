package com.busybrains.ecommerce.controller;

import com.busybrains.ecommerce.model.Product;
import com.busybrains.ecommerce.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Product management.
 *
 * <p>Access Control:
 * <ul>
 *   <li>GET  /api/products/**        → Public (any authenticated or anonymous user)</li>
 *   <li>POST /api/products           → ADMIN only</li>
 *   <li>PUT  /api/products/{id}      → ADMIN only</li>
 *   <li>DELETE /api/products/{id}    → ADMIN only</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Product catalog management")
public class ProductController {

    private final ProductService productService;

    // -------------------------------------------------------
    // Public read endpoints
    // -------------------------------------------------------

    @GetMapping
    @Operation(summary = "Get all products")
    public ResponseEntity<List<Product>> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search
    ) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(productService.search(search));
        }
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(productService.getByCategory(category));
        }
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single product by ID")
    public ResponseEntity<Product> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    // -------------------------------------------------------
    // Admin-only write endpoints
    // -------------------------------------------------------

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new product (Admin only)",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Product> create(@Valid @RequestBody Product product) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(product));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a product (Admin only)",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Product> update(
            @PathVariable Long id,
            @Valid @RequestBody Product product
    ) {
        return ResponseEntity.ok(productService.update(id, product));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a product (Admin only)",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
