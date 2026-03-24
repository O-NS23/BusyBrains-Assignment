package com.busybrains.ecommerce.service;

import com.busybrains.ecommerce.model.Product;
import com.busybrains.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for product CRUD operations.
 * Access control is enforced at the controller level via @PreAuthorize.
 */
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    /** Return all products. */
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    /** Return products filtered by category. */
    public List<Product> getByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    /** Search products by keyword in name. */
    public List<Product> search(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword);
    }

    /** Get a single product by ID. */
    public Product getById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    /** Create a new product. */
    public Product create(Product product) {
        return productRepository.save(product);
    }

    /** Update an existing product. */
    public Product update(Long id, Product details) {
        Product product = getById(id);
        product.setName(details.getName());
        product.setDescription(details.getDescription());
        product.setPrice(details.getPrice());
        product.setImageUrl(details.getImageUrl());
        product.setCategory(details.getCategory());
        product.setStock(details.getStock());
        product.setRating(details.getRating());
        return productRepository.save(product);
    }

    /** Delete a product by ID. */
    public void delete(Long id) {
        productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        productRepository.deleteById(id);
    }
}
