package com.farmconnect.orderservice.dto;

import jakarta.validation.constraints.NotNull;

public class CreateRazorpayOrderRequest {

    @NotNull
    private Long orderId;

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }
}
