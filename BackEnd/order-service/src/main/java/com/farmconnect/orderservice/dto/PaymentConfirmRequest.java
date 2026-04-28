package com.farmconnect.orderservice.dto;

import jakarta.validation.constraints.NotNull;

public class PaymentConfirmRequest {

    @NotNull
    private Long orderId;

    private String transactionId;

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }
}
