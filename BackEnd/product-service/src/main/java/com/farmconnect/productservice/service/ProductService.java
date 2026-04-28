package com.farmconnect.productservice.service;

import com.farmconnect.productservice.dto.CreateProductRequest;
import com.farmconnect.productservice.dto.ProductResponse;
import com.farmconnect.productservice.dto.SyncFarmerProductsRequest;
import com.farmconnect.productservice.dto.UpdateProductRequest;
import com.farmconnect.productservice.entity.Product;
import com.farmconnect.productservice.exception.ProductNotFoundException;
import com.farmconnect.productservice.exception.UnauthorizedActionException;
import com.farmconnect.productservice.repository.ProductRepository;
import com.farmconnect.productservice.security.RequestContext;
import com.farmconnect.productservice.security.RequestContextFactory;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final RequestContextFactory requestContextFactory;
    private final RestClient.Builder restClientBuilder;

    public ProductService(
            ProductRepository productRepository,
            RequestContextFactory requestContextFactory,
            RestClient.Builder restClientBuilder
    ) {
        this.productRepository = productRepository;
        this.requestContextFactory = requestContextFactory;
        this.restClientBuilder = restClientBuilder;
    }

    public ProductResponse createProduct(CreateProductRequest request, String userId, String role, String email) {
        RequestContext requestContext = requestContextFactory.create(userId, role, email);
        validateFarmerAccess(requestContext);

        Product product = new Product();
        applyProductChanges(
                product,
                request.getName(),
                request.getPrice(),
                request.getQuantity(),
                request.getDescription(),
                resolveFarmerId(request.getFarmerId(), requestContext),
                request.getImageUrl()
        );

        Product savedProduct = productRepository.save(product);
        syncFarmerProducts(savedProduct.getFarmerId());
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

    public ProductResponse updateProduct(Long id, UpdateProductRequest request, String userId, String role, String email) {
        RequestContext requestContext = requestContextFactory.create(userId, role, email);
        validateFarmerAccess(requestContext);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
        validateOwnership(product, requestContext);

        applyProductChanges(
                product,
                request.getName(),
                request.getPrice(),
                request.getQuantity(),
                request.getDescription(),
                resolveFarmerId(request.getFarmerId(), requestContext),
                request.getImageUrl()
        );

        Product savedProduct = productRepository.save(product);
        syncFarmerProducts(savedProduct.getFarmerId());
        return toResponse(savedProduct);
    }

    public void deleteProduct(Long id, String userId, String role, String email) {
        RequestContext requestContext = requestContextFactory.create(userId, role, email);
        validateFarmerAccess(requestContext);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
        validateOwnership(product, requestContext);
        Long farmerId = product.getFarmerId();
        productRepository.delete(product);
        syncFarmerProducts(farmerId);
    }

    @Transactional
    public void reserveInventory(Long id, Integer quantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Reservation quantity must be greater than zero");
        }

        if (product.getQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient stock for product " + product.getName());
        }

        product.setQuantity(product.getQuantity() - quantity);
    }

    @Transactional
    public void deleteProductsByFarmerId(Long farmerId) {
        if (farmerId == null) {
            throw new IllegalArgumentException("Farmer id is required");
        }
        productRepository.deleteByFarmerId(farmerId);
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

    private void validateFarmerAccess(RequestContext requestContext) {
        if (!requestContext.isAdmin() && !requestContext.isFarmer()) {
            throw new UnauthorizedActionException("Only farmers and admins can manage products");
        }
    }

    private Long resolveFarmerId(Long requestedFarmerId, RequestContext requestContext) {
        if (requestContext.isAdmin()) {
            if (requestedFarmerId == null) {
                throw new IllegalArgumentException("farmerId is required for admin product operations");
            }
            return requestedFarmerId;
        }

        if (requestContext.userId() == null) {
            throw new UnauthorizedActionException("Missing authenticated farmer id");
        }

        if (requestedFarmerId != null && !requestedFarmerId.equals(requestContext.userId())) {
            throw new UnauthorizedActionException("Farmers can only manage their own products");
        }
        return requestContext.userId();
    }

    private void validateOwnership(Product product, RequestContext requestContext) {
        if (requestContext.isAdmin()) {
            return;
        }

        if (!product.getFarmerId().equals(requestContext.userId())) {
            throw new UnauthorizedActionException("You do not own this product");
        }
    }

    private void syncFarmerProducts(Long farmerId) {
        List<String> productNames = productRepository.findByFarmerId(farmerId).stream()
                .map(Product::getName)
                .sorted(String::compareToIgnoreCase)
                .toList();

        restClientBuilder.build()
                .put()
                .uri("http://FARMER-SERVICE/internal/farmers/{id}/products", farmerId)
                .body(new SyncFarmerProductsRequest(productNames))
                .retrieve()
                .toBodilessEntity();
    }
}
