package com.farmconnect.productservice.service;

import com.farmconnect.productservice.dto.CreateProductRequest;
import com.farmconnect.productservice.dto.ProductResponse;
import com.farmconnect.productservice.dto.UpdateProductRequest;
import com.farmconnect.productservice.entity.Product;
import com.farmconnect.productservice.exception.ProductNotFoundException;
import com.farmconnect.productservice.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public ProductResponse createProduct(CreateProductRequest request) {
        Product product = new Product();
        applyProductChanges(product, request.getName(), request.getPrice(), request.getQuantity(), request.getDescription(),
                request.getFarmerId(), request.getImageUrl());
        Product savedProduct = productRepository.save(product);
        return toResponse(savedProduct);
    }

    public List<ProductResponse> getAllProducts(String name, Long farmerId, BigDecimal minPrice, BigDecimal maxPrice) {
        List<Product> products;
        boolean hasName = name != null && !name.isBlank();
        boolean hasFarmerId = farmerId != null;
        boolean hasPriceRange = minPrice != null && maxPrice != null;

        if (hasPriceRange && minPrice.compareTo(maxPrice) > 0) {
            throw new IllegalArgumentException("minPrice cannot be greater than maxPrice");
        }

        if (hasName && hasFarmerId && hasPriceRange) {
            products = productRepository.findByNameContainingIgnoreCaseAndFarmerIdAndPriceBetween(
                    name, farmerId, minPrice, maxPrice);
        } else if (hasName && hasFarmerId) {
            products = productRepository.findByNameContainingIgnoreCaseAndFarmerId(name, farmerId);
        } else if (hasName && hasPriceRange) {
            products = productRepository.findByNameContainingIgnoreCaseAndPriceBetween(name, minPrice, maxPrice);
        } else if (hasFarmerId && hasPriceRange) {
            products = productRepository.findByFarmerIdAndPriceBetween(farmerId, minPrice, maxPrice);
        } else if (hasName) {
            products = productRepository.findByNameContainingIgnoreCase(name);
        } else if (hasFarmerId) {
            products = productRepository.findByFarmerId(farmerId);
        } else if (hasPriceRange) {
            products = productRepository.findByPriceBetween(minPrice, maxPrice);
        } else {
            products = productRepository.findAll();
        }

        return products.stream().map(this::toResponse).toList();
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
        return toResponse(product);
    }

    public ProductResponse updateProduct(Long id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        applyProductChanges(product, request.getName(), request.getPrice(), request.getQuantity(), request.getDescription(),
                request.getFarmerId(), request.getImageUrl());

        Product savedProduct = productRepository.save(product);
        return toResponse(savedProduct);
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
        productRepository.delete(product);
    }

    private void applyProductChanges(
            Product product,
            String name,
            BigDecimal price,
            Integer quantity,
            String description,
            Long farmerId,
            String imageUrl
    ) {
        product.setName(name);
        product.setPrice(price);
        product.setQuantity(quantity);
        product.setDescription(description);
        product.setFarmerId(farmerId);
        product.setImageUrl(imageUrl);
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getQuantity(),
                product.getDescription(),
                product.getFarmerId(),
                product.getImageUrl()
        );
    }
}
