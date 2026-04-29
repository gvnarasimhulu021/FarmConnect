package com.farmconnect.orderservice.controller;

import com.farmconnect.orderservice.dto.AdminPayoutPayRequest;
import com.farmconnect.orderservice.dto.CreateOrderRequest;
import com.farmconnect.orderservice.dto.OrderResponse;
import com.farmconnect.orderservice.dto.PagedResponse;
import com.farmconnect.orderservice.dto.PaymentConfirmRequest;
import com.farmconnect.orderservice.dto.UpdateOrderStatusRequest;
import com.farmconnect.orderservice.service.OrderService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/api/orders")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse placeOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @RequestHeader("X-Authenticated-User-Id") String userId,
            @RequestHeader("X-Authenticated-Role") String role,
            @RequestHeader(value = "X-Authenticated-User", required = false) String email
    ) {
        return orderService.placeOrder(request, userId, role, email);
    }

    @PostMapping("/api/orders/checkout/{userId}")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse checkout(
            @PathVariable Long userId,
            @RequestHeader("X-Authenticated-User-Id") String authenticatedUserId,
            @RequestHeader("X-Authenticated-Role") String role,
            @RequestHeader(value = "X-Authenticated-User", required = false) String email
    ) {
        return orderService.checkoutFromCart(userId, authenticatedUserId, role, email);
    }

    @GetMapping("/api/orders")
    public PagedResponse<OrderResponse> getOrdersForCurrentUser(
            @RequestHeader("X-Authenticated-User-Id") String userId,
            @RequestHeader("X-Authenticated-Role") String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "X-Authenticated-User", required = false) String email
    ) {
        return orderService.getOrdersForCurrentUser(userId, role, page, size, email);
    }

    @GetMapping("/api/orders/{id}")
    public OrderResponse getOrderById(
            @PathVariable Long id,
            @RequestHeader("X-Authenticated-User-Id") String userId,
            @RequestHeader("X-Authenticated-Role") String role,
            @RequestHeader(value = "X-Authenticated-User", required = false) String email
    ) {
        return orderService.getOrderById(id, userId, role, email);
    }

    @PutMapping("/api/orders/{id}/status")
    public OrderResponse updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            @RequestHeader("X-Authenticated-User-Id") String userId,
            @RequestHeader("X-Authenticated-Role") String role,
            @RequestHeader(value = "X-Authenticated-User", required = false) String email
    ) {
        return orderService.updateOrderStatus(id, request, userId, role, email);
    }

    @PostMapping("/api/payment/confirm")
    public OrderResponse confirmPayment(
            @Valid @RequestBody PaymentConfirmRequest request,
            @RequestHeader("X-Authenticated-User-Id") String userId,
            @RequestHeader("X-Authenticated-Role") String role,
            @RequestHeader(value = "X-Authenticated-User", required = false) String email
    ) {
        return orderService.confirmPayment(request, userId, role, email);
    }

    @PostMapping("/api/payment/session/{orderId}")
    public OrderResponse preparePaymentSession(
            @PathVariable Long orderId,
            @RequestHeader("X-Authenticated-User-Id") String userId,
            @RequestHeader("X-Authenticated-Role") String role,
            @RequestHeader(value = "X-Authenticated-User", required = false) String email
    ) {
        return orderService.prepareOnlinePayment(orderId, userId, role, email);
    }

    @PostMapping("/api/admin/payout/pay")
    public Map<String, String> payFarmer(
            @Valid @RequestBody AdminPayoutPayRequest request,
            @RequestHeader("X-Authenticated-User-Id") String userId,
            @RequestHeader("X-Authenticated-Role") String role,
            @RequestHeader(value = "X-Authenticated-User", required = false) String email
    ) {
        orderService.completePayout(request.getOrderId(), userId, role, email);
        return Map.of("message", "Farmer payout marked as PAID and notification sent.");
    }

    @PostMapping("/api/orders/{id}/payout/complete")
    public Map<String, String> completePayout(
            @PathVariable Long id,
            @RequestHeader("X-Authenticated-User-Id") String userId,
            @RequestHeader("X-Authenticated-Role") String role,
            @RequestHeader(value = "X-Authenticated-User", required = false) String email
    ) {
        orderService.completePayout(id, userId, role, email);
        return Map.of("message", "Payout completed and farmer notified.");
    }
}
