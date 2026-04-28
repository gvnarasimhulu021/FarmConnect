package com.farmconnect.productservice.repository;

import com.farmconnect.productservice.entity.Product;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByNameContainingIgnoreCase(String name);

    List<Product> findByFarmerId(Long farmerId);

    List<Product> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);

    List<Product> findByNameContainingIgnoreCaseAndFarmerId(String name, Long farmerId);

    List<Product> findByNameContainingIgnoreCaseAndPriceBetween(String name, BigDecimal minPrice, BigDecimal maxPrice);

    List<Product> findByFarmerIdAndPriceBetween(Long farmerId, BigDecimal minPrice, BigDecimal maxPrice);

    List<Product> findByNameContainingIgnoreCaseAndFarmerIdAndPriceBetween(
            String name,
            Long farmerId,
            BigDecimal minPrice,
            BigDecimal maxPrice
    );

    long deleteByFarmerId(Long farmerId);
}
