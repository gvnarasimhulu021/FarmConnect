package com.farmconnect.orderservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CreateRazorpayOrderResponse {

    @JsonProperty("order_id")
    private final String orderId;

    private final long amount;

    private final String currency;

    public CreateRazorpayOrderResponse(String orderId, long amount, String currency) {
        this.orderId = orderId;
        this.amount = amount;
        this.currency = currency;
    }

    public String getOrderId() {
        return orderId;
    }

    public long getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
    }
}
