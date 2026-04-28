package com.farmconnect.cartservice.dto;

public class CartItemResponse {

    private final Long id;
    private final Long productId;
    private final Integer quantity;

    public CartItemResponse(Long id, Long productId, Integer quantity) {
        this.id = id;
        this.productId = productId;
        this.quantity = quantity;
    }

    public Long getId() {
        return id;
    }

    public Long getProductId() {
        return productId;
    }

    public Integer getQuantity() {
        return quantity;
    }
}
