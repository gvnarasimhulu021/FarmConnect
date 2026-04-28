package com.farmconnect.orderservice.dto;

import java.math.BigDecimal;

public class RecordFarmerOrderRequest {

    private BigDecimal amount;

    public RecordFarmerOrderRequest() {
    }

    public RecordFarmerOrderRequest(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
