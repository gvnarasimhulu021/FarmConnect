package com.farmconnect.orderservice.dto;

import com.farmconnect.orderservice.entity.OrderStatus;
import java.math.BigDecimal;
import java.util.List;

public class OrderResponse {

    private final Long id;
    private final Long userId;
    private final BigDecimal totalAmount;
    private final OrderStatus status;
    private final List<OrderItemResponse> items;

    public OrderResponse(Long id, Long userId, BigDecimal totalAmount, OrderStatus status, List<OrderItemResponse> items) {
        this.id = id;
        this.userId = userId;
        this.totalAmount = totalAmount;
        this.status = status;
        this.items = items;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }
}
