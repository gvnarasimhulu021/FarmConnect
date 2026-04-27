package com.farmconnect.productservice.dto;

import java.math.BigDecimal;

public class ProductResponse {

    private final Long id;
    private final String name;
    private final BigDecimal price;
    private final Integer quantity;
    private final String description;
    private final Long farmerId;
    private final String imageUrl;

    public ProductResponse(
            Long id,
            String name,
            BigDecimal price,
            Integer quantity,
            String description,
            Long farmerId,
            String imageUrl
    ) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
        this.description = description;
        this.farmerId = farmerId;
        this.imageUrl = imageUrl;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public String getDescription() {
        return description;
    }

    public Long getFarmerId() {
        return farmerId;
    }

    public String getImageUrl() {
        return imageUrl;
    }
}
