package com.farmconnect.orderservice.dto;

import java.util.List;

public class CartSnapshot {

    private Long id;
    private Long userId;
    private List<CartItemSnapshot> items;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public List<CartItemSnapshot> getItems() {
        return items;
    }

    public void setItems(List<CartItemSnapshot> items) {
        this.items = items;
    }
}
