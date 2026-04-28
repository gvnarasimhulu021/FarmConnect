package com.farmconnect.orderservice.dto;

import java.math.BigDecimal;

public class OrderItemResponse {

    private final Long productId;
    private final Long farmerId;
    private final Integer quantity;
    private final BigDecimal price;

    public OrderItemResponse(Long productId, Long farmerId, Integer quantity, BigDecimal price) {
        this.productId = productId;
        this.farmerId = farmerId;
        this.quantity = quantity;
        this.price = price;
    }

    public Long getProductId() {
        return productId;
    }

    public Long getFarmerId() {
        return farmerId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }
}
