package com.farmconnect.cartservice.dto;

import java.util.List;

public class CartResponse {

    private final Long id;
    private final Long userId;
    private final List<CartItemResponse> items;

    public CartResponse(Long id, Long userId, List<CartItemResponse> items) {
        this.id = id;
        this.userId = userId;
        this.items = items;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public List<CartItemResponse> getItems() {
        return items;
    }
}
