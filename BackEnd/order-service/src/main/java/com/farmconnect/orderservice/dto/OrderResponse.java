package com.farmconnect.orderservice.dto;

import com.farmconnect.orderservice.entity.OrderStatus;
import com.farmconnect.orderservice.entity.FarmerPaymentStatus;
import com.farmconnect.orderservice.entity.PaymentMethod;
import com.farmconnect.orderservice.entity.PaymentStatus;
import java.math.BigDecimal;
import java.util.List;

public class OrderResponse {

    private final Long id;
    private final Long userId;
    private final BigDecimal totalAmount;
    private final OrderStatus status;
    private final PaymentMethod paymentMethod;
    private final PaymentStatus paymentStatus;
    private final FarmerPaymentStatus farmerPaymentStatus;
    private final String paymentLink;
    private final boolean payoutCompleted;
    private final List<OrderItemResponse> items;

    public OrderResponse(
            Long id,
            Long userId,
            BigDecimal totalAmount,
            OrderStatus status,
            PaymentMethod paymentMethod,
            PaymentStatus paymentStatus,
            FarmerPaymentStatus farmerPaymentStatus,
            String paymentLink,
            boolean payoutCompleted,
            List<OrderItemResponse> items
    ) {
        this.id = id;
        this.userId = userId;
        this.totalAmount = totalAmount;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.farmerPaymentStatus = farmerPaymentStatus;
        this.paymentLink = paymentLink;
        this.payoutCompleted = payoutCompleted;
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

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public PaymentMethod getPaymentMode() {
        return paymentMethod;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public FarmerPaymentStatus getFarmerPaymentStatus() {
        return farmerPaymentStatus;
    }

    public String getPaymentLink() {
        return paymentLink;
    }

    public boolean isPayoutCompleted() {
        return payoutCompleted;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }
}
