package com.farmconnect.orderservice.service;

import com.farmconnect.orderservice.dto.CartItemSnapshot;
import com.farmconnect.orderservice.dto.CartSnapshot;
import com.farmconnect.orderservice.dto.CreateOrderItemRequest;
import com.farmconnect.orderservice.dto.CreateOrderRequest;
import com.farmconnect.orderservice.dto.PaymentConfirmRequest;
import com.farmconnect.orderservice.dto.OrderItemResponse;
import com.farmconnect.orderservice.dto.OrderResponse;
import com.farmconnect.orderservice.dto.PagedResponse;
import com.farmconnect.orderservice.dto.ProductSnapshot;
import com.farmconnect.orderservice.dto.RecordFarmerOrderRequest;
import com.farmconnect.orderservice.dto.UpdateOrderStatusRequest;
import com.farmconnect.orderservice.dto.UserEmailSnapshot;
import com.farmconnect.orderservice.entity.FarmerPaymentStatus;
import com.farmconnect.orderservice.entity.Order;
import com.farmconnect.orderservice.entity.OrderItem;
import com.farmconnect.orderservice.entity.OrderStatus;
import com.farmconnect.orderservice.entity.PaymentMethod;
import com.farmconnect.orderservice.entity.PaymentStatus;
import com.farmconnect.orderservice.exception.OrderNotFoundException;
import com.farmconnect.orderservice.exception.UnauthorizedActionException;
import com.farmconnect.orderservice.repository.OrderRepository;
import com.farmconnect.orderservice.security.RequestContext;
import com.farmconnect.orderservice.security.RequestContextFactory;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final RequestContextFactory requestContextFactory;
    private final RestClient.Builder restClientBuilder;
    private final EmailService emailService;
    private final String adminEmail;
    private final String razorpayPaymentLink;

    public OrderService(
            OrderRepository orderRepository,
            RequestContextFactory requestContextFactory,
            RestClient.Builder restClientBuilder,
            EmailService emailService,
            @Value("${farmconnect.notifications.admin-email:farmconnect4you@gmail.com}") String adminEmail,
            @Value("${farmconnect.payment.razorpay-link:https://razorpay.me/@gunduvenkatanarasimhulu}") String razorpayPaymentLink
    ) {
        this.orderRepository = orderRepository;
        this.requestContextFactory = requestContextFactory;
        this.restClientBuilder = restClientBuilder;
        this.emailService = emailService;
        this.adminEmail = adminEmail;
        this.razorpayPaymentLink = razorpayPaymentLink;
    }

    @Transactional
    public OrderResponse placeOrder(CreateOrderRequest request, String userId, String role, String email) {
        RequestContext requestContext = requestContextFactory.create(userId, role, email);
        if (!requestContext.isUser() && !requestContext.isAdmin()) {
            throw new UnauthorizedActionException("Only customers and admins can place orders");
        }
        if (requestContext.userId() == null) {
            throw new UnauthorizedActionException("Missing authenticated user id");
        }

        PaymentMethod paymentMethod = request.getPaymentMethod() == null ? PaymentMethod.COD : request.getPaymentMethod();
        String userEmail = resolveUserEmail(requestContext.userId(), requestContext.email());
        return createOrderFromItems(requestContext.userId(), userEmail, request.getItems(), paymentMethod);
    }

    @Transactional
    public OrderResponse checkoutFromCart(Long requestedUserId, String userId, String role, String email) {
        RequestContext requestContext = requestContextFactory.create(userId, role, email);
        if (!requestContext.isUser()) {
            throw new UnauthorizedActionException("Only users can checkout carts");
        }
        if (requestContext.userId() == null) {
            throw new UnauthorizedActionException("Missing authenticated user id");
        }
        if (!requestContext.userId().equals(requestedUserId)) {
            throw new UnauthorizedActionException("You can only checkout your own cart");
        }

        CartSnapshot cart = fetchCart(requestContext.userId());
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        List<CreateOrderItemRequest> orderItems = cart.getItems().stream()
                .map(this::toCreateOrderItemRequest)
                .toList();

        String userEmail = resolveUserEmail(requestContext.userId(), requestContext.email());
        OrderResponse response = createOrderFromItems(requestContext.userId(), userEmail, orderItems, PaymentMethod.COD);
        clearCartAfterCheckout(requestContext.userId());
        return response;
    }

    public PagedResponse<OrderResponse> getOrdersForCurrentUser(String userId, String role, int page, int size, String email) {
        RequestContext requestContext = requestContextFactory.create(userId, role, email);
        if (requestContext.userId() == null) {
            throw new UnauthorizedActionException("Missing authenticated user id");
        }
        if (page < 0) {
            throw new IllegalArgumentException("Page index must be 0 or greater");
        }
        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("Page size must be between 1 and 100");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<Order> orderPage;
        if (requestContext.isAdmin()) {
            orderPage = orderRepository.findAllByStatusNotOrderByIdDesc(OrderStatus.CREATED, pageable);
        } else if (requestContext.isFarmer()) {
            orderPage = orderRepository.findDistinctByOrderItemsFarmerIdAndStatusNotOrderByIdDesc(
                    requestContext.userId(),
                    OrderStatus.CREATED,
                    pageable
            );
        } else {
            orderPage = orderRepository.findByUserIdOrderByIdDesc(requestContext.userId(), pageable);
        }

        return new PagedResponse<>(
                orderPage.getContent().stream().map(this::toResponse).toList(),
                page,
                size,
                orderPage.getTotalElements(),
                orderPage.getTotalPages()
        );
    }

    public OrderResponse getOrderById(Long id, String userId, String role, String email) {
        RequestContext requestContext = requestContextFactory.create(userId, role, email);
        Order order = findOrder(id);
        validateCanViewOrder(order, requestContext);
        return toResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(
            Long id,
            UpdateOrderStatusRequest request,
            String userId,
            String role,
            String email
    ) {
        RequestContext requestContext = requestContextFactory.create(userId, role, email);
        Order order = findOrder(id);
        validateCanManageOrder(order, requestContext);
        validateStatusTransition(order.getStatus(), request.getStatus());
        order.setStatus(request.getStatus());

        if (request.getStatus() == OrderStatus.DELIVERED && order.getPaymentMethod() == PaymentMethod.COD) {
            order.setPaymentStatus(PaymentStatus.SUCCESS);
            if (order.getPaidAt() == null) {
                order.setPaidAt(Instant.now());
            }
        }

        Order savedOrder = orderRepository.save(order);
        notifyUserOrderEvent(savedOrder, request.getStatus());
        if (request.getStatus() == OrderStatus.DELIVERED) {
            notifyAdminDelivered(savedOrder);
        }
        return toResponse(savedOrder);
    }

    @Transactional
    public OrderResponse confirmPayment(
            PaymentConfirmRequest request,
            String userId,
            String role,
            String email
    ) {
        RequestContext requestContext = requestContextFactory.create(userId, role, email);
        if (request.getOrderId() == null) {
            throw new IllegalArgumentException("orderId is required");
        }

        Order order = findOrder(request.getOrderId());
        validateCanConfirmPayment(order, requestContext);

        if (!isOnlinePayment(order.getPaymentMethod())) {
            throw new IllegalArgumentException("Payment confirmation is allowed only for online payments");
        }

        if (order.getPaymentStatus() == PaymentStatus.SUCCESS && order.getStatus() == OrderStatus.PLACED) {
            return toResponse(order);
        }
        if (order.getStatus() != OrderStatus.CREATED) {
            throw new IllegalArgumentException("Only CREATED online orders can be confirmed");
        }

        reserveInventoryForOrder(order);
        recordFarmerEarningsForOrder(order);

        order.setPaymentStatus(PaymentStatus.SUCCESS);
        if (order.getPaidAt() == null) {
            order.setPaidAt(Instant.now());
        }
        order.setStatus(OrderStatus.PLACED);

        if (request.getTransactionId() != null && !request.getTransactionId().isBlank()) {
            order.setTransactionId(request.getTransactionId().trim());
        }

        Order savedOrder = orderRepository.save(order);
        if (savedOrder.getStatus() == OrderStatus.PLACED) {
            notifyUserOrderEvent(savedOrder, OrderStatus.PLACED);
        }
        return toResponse(savedOrder);
    }

    @Transactional
    public void completePayout(Long id, String userId, String role, String email) {
        RequestContext requestContext = requestContextFactory.create(userId, role, email);
        if (!requestContext.isAdmin()) {
            throw new UnauthorizedActionException("Only admins can complete farmer payouts");
        }

        Order order = findOrder(id);
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new IllegalArgumentException("Payout can be completed only after delivery");
        }
        if (order.getPaymentStatus() != PaymentStatus.SUCCESS) {
            throw new IllegalArgumentException("Payout is allowed only after payment is marked SUCCESS");
        }
        if (order.getFarmerPaymentStatus() == FarmerPaymentStatus.PAID || order.isPayoutCompleted()) {
            throw new IllegalArgumentException("Payout already completed for this order");
        }

        order.setFarmerPaymentStatus(FarmerPaymentStatus.PAID);
        order.setPayoutCompleted(true);
        order.setPayoutCompletedAt(Instant.now());
        Order savedOrder = orderRepository.save(order);
        notifyFarmersPayoutCompleted(savedOrder);
    }

    private Order findOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
    }

    private OrderResponse createOrderFromItems(
            Long userId,
            String userEmail,
            List<CreateOrderItemRequest> itemRequests,
            PaymentMethod paymentMethod
    ) {
        PaymentMethod resolvedPaymentMethod = toStoredPaymentMethod(paymentMethod);

        Order order = new Order();
        order.setUserId(userId);
        order.setUserEmail(userEmail);
        order.setStatus(isOnlinePayment(resolvedPaymentMethod) ? OrderStatus.CREATED : OrderStatus.PLACED);
        order.setPaymentMethod(resolvedPaymentMethod);
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setFarmerPaymentStatus(FarmerPaymentStatus.PENDING);

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        Map<Long, BigDecimal> earningsByFarmer = new LinkedHashMap<>();
        boolean onlinePayment = isOnlinePayment(resolvedPaymentMethod);

        for (CreateOrderItemRequest itemRequest : itemRequests) {
            ProductSnapshot product = fetchProduct(itemRequest.getProductId());
            validateAvailableQuantity(product, itemRequest.getQuantity());
            if (!onlinePayment) {
                reserveProduct(product.getId(), itemRequest.getQuantity());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(product.getId());
            orderItem.setFarmerId(product.getFarmerId());
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(product.getPrice());
            orderItems.add(orderItem);

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
            if (!onlinePayment) {
                earningsByFarmer.merge(product.getFarmerId(), itemTotal, BigDecimal::add);
            }
        }

        order.setOrderItems(orderItems);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);
        if (!onlinePayment) {
            earningsByFarmer.forEach(this::recordFarmerOrder);
        }
        if (savedOrder.getStatus() == OrderStatus.PLACED) {
            notifyUserOrderEvent(savedOrder, OrderStatus.PLACED);
        }
        return toResponse(savedOrder);
    }

    private ProductSnapshot fetchProduct(Long productId) {
        ProductSnapshot product = restClientBuilder.build()
                .get()
                .uri("http://PRODUCT-SERVICE/internal/products/{id}", productId)
                .retrieve()
                .body(ProductSnapshot.class);

        if (product == null) {
            throw new IllegalArgumentException("Product " + productId + " could not be loaded");
        }
        return product;
    }

    private void reserveProduct(Long productId, Integer quantity) {
        restClientBuilder.build()
                .put()
                .uri("http://PRODUCT-SERVICE/internal/products/{id}/reserve?quantity={quantity}", productId, quantity)
                .retrieve()
                .toBodilessEntity();
    }

    private void recordFarmerOrder(Long farmerId, BigDecimal amount) {
        restClientBuilder.build()
                .put()
                .uri("http://FARMER-SERVICE/internal/farmers/{id}/orders", farmerId)
                .body(new RecordFarmerOrderRequest(amount))
                .retrieve()
                .toBodilessEntity();
    }

    private void reserveInventoryForOrder(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            reserveProduct(item.getProductId(), item.getQuantity());
        }
    }

    private void recordFarmerEarningsForOrder(Order order) {
        Map<Long, BigDecimal> earningsByFarmer = new LinkedHashMap<>();
        for (OrderItem item : order.getOrderItems()) {
            BigDecimal itemTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            earningsByFarmer.merge(item.getFarmerId(), itemTotal, BigDecimal::add);
        }
        earningsByFarmer.forEach(this::recordFarmerOrder);
    }

    private CartSnapshot fetchCart(Long userId) {
        return restClientBuilder.build()
                .get()
                .uri("http://CART-SERVICE/internal/carts/{userId}", userId)
                .retrieve()
                .body(CartSnapshot.class);
    }

    private void clearCartAfterCheckout(Long userId) {
        restClientBuilder.build()
                .delete()
                .uri("http://CART-SERVICE/internal/carts/{userId}", userId)
                .retrieve()
                .toBodilessEntity();
    }

    private CreateOrderItemRequest toCreateOrderItemRequest(CartItemSnapshot cartItem) {
        CreateOrderItemRequest item = new CreateOrderItemRequest();
        item.setProductId(cartItem.getProductId());
        item.setQuantity(cartItem.getQuantity());
        return item;
    }

    private void validateAvailableQuantity(ProductSnapshot product, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Order quantity must be greater than zero");
        }
        if (product.getQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient stock for product " + product.getName());
        }
    }

    private void validateCanViewOrder(Order order, RequestContext requestContext) {
        if (requestContext.isAdmin()) {
            return;
        }
        if (requestContext.isUser() && order.getUserId().equals(requestContext.userId())) {
            return;
        }
        if (requestContext.isFarmer() && order.getOrderItems().stream()
                .anyMatch(item -> item.getFarmerId().equals(requestContext.userId()))) {
            return;
        }
        throw new UnauthorizedActionException("You do not have access to this order");
    }

    private void validateCanManageOrder(Order order, RequestContext requestContext) {
        if (requestContext.isAdmin()) {
            return;
        }
        if (requestContext.isFarmer() && order.getOrderItems().stream()
                .anyMatch(item -> item.getFarmerId().equals(requestContext.userId()))) {
            return;
        }
        throw new UnauthorizedActionException("Only the owning farmer or an admin can update this order");
    }

    private void validateCanConfirmPayment(Order order, RequestContext requestContext) {
        if (requestContext.isAdmin()) {
            return;
        }

        if (requestContext.isUser() && requestContext.userId() != null && order.getUserId().equals(requestContext.userId())) {
            return;
        }

        throw new UnauthorizedActionException("Only the order owner or an admin can confirm payment");
    }

    private PaymentMethod toStoredPaymentMethod(PaymentMethod paymentMethod) {
        if (paymentMethod == null) {
            return PaymentMethod.COD;
        }
        return paymentMethod == PaymentMethod.ONLINE ? PaymentMethod.RAZORPAY : paymentMethod;
    }

    private PaymentMethod toApiPaymentMethod(PaymentMethod paymentMethod) {
        PaymentMethod storedPaymentMethod = toStoredPaymentMethod(paymentMethod);
        return storedPaymentMethod == PaymentMethod.RAZORPAY ? PaymentMethod.ONLINE : storedPaymentMethod;
    }

    private boolean isOnlinePayment(PaymentMethod paymentMethod) {
        PaymentMethod storedPaymentMethod = toStoredPaymentMethod(paymentMethod);
        return storedPaymentMethod == PaymentMethod.RAZORPAY;
    }

    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (currentStatus == newStatus) {
            return;
        }

        boolean valid = switch (currentStatus) {
            case CREATED -> newStatus == OrderStatus.PLACED;
            case PLACED -> newStatus == OrderStatus.CONFIRMED;
            case CONFIRMED -> newStatus == OrderStatus.SHIPPED;
            case SHIPPED -> newStatus == OrderStatus.OUT_FOR_DELIVERY;
            case OUT_FOR_DELIVERY -> newStatus == OrderStatus.DELIVERED;
            case DELIVERED -> false;
        };

        if (!valid) {
            throw new IllegalArgumentException(
                    "Invalid order status transition from " + currentStatus + " to " + newStatus
            );
        }
    }

    private void notifyUserOrderEvent(Order order, OrderStatus status) {
        String recipient = order.getUserEmail();
        if (recipient == null || recipient.isBlank()) {
            recipient = fetchUserEmail(order.getUserId());
        }
        if (recipient == null || recipient.isBlank()) {
            return;
        }

        String message = switch (status) {
            case CREATED -> "Payment initiated. Complete payment to place your order";
            case PLACED -> "Your order has been placed";
            case CONFIRMED -> "Order confirmed by farmer";
            case SHIPPED -> "Order shipped";
            case OUT_FOR_DELIVERY -> "Order is out for delivery";
            case DELIVERED -> "Order delivered successfully";
        };
        safeSendMail(recipient, "Order Update #" + order.getId(), message + " (Order #" + order.getId() + ")");
    }

    private void notifyAdminDelivered(Order order) {
        safeSendMail(
                adminEmail,
                "Order Delivered #" + order.getId(),
                "Order delivered. Ready to pay farmer. Order #" + order.getId()
        );
    }

    private void notifyFarmersPayoutCompleted(Order order) {
        Set<Long> farmerIds = new LinkedHashSet<>();
        for (OrderItem item : order.getOrderItems()) {
            farmerIds.add(item.getFarmerId());
        }

        for (Long farmerId : farmerIds) {
            String farmerEmail = fetchUserEmail(farmerId);
            safeSendMail(
                    farmerEmail,
                    "Farmer Payout Completed",
                    "You have received payment for your order #" + order.getId()
            );
        }
    }

    private void safeSendMail(String to, String subject, String body) {
        try {
            emailService.sendMail(to, subject, body);
        } catch (RuntimeException ex) {
            // Notification failures should not block order flow.
        }
    }

    private String resolveUserEmail(Long userId, String emailHeader) {
        if (emailHeader != null && !emailHeader.isBlank()) {
            return emailHeader;
        }

        String fetchedEmail = fetchUserEmail(userId);
        if (fetchedEmail == null || fetchedEmail.isBlank()) {
            throw new IllegalArgumentException("User email not found for notifications");
        }
        return fetchedEmail;
    }

    private String fetchUserEmail(Long userId) {
        try {
            UserEmailSnapshot response = restClientBuilder.build()
                    .get()
                    .uri("http://AUTH-SERVICE/internal/users/{id}/email", userId)
                    .retrieve()
                    .body(UserEmailSnapshot.class);
            return response == null ? null : response.getEmail();
        } catch (RestClientException ex) {
            return null;
        }
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getOrderItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getProductId(),
                        item.getFarmerId(),
                        item.getQuantity(),
                        item.getPrice()
                ))
                .toList();
        PaymentMethod resolvedPaymentMethod = toApiPaymentMethod(order.getPaymentMethod());
        String paymentLink = isOnlinePayment(order.getPaymentMethod()) ? razorpayPaymentLink : null;

        return new OrderResponse(
                order.getId(),
                order.getUserId(),
                order.getTotalAmount(),
                order.getStatus(),
                resolvedPaymentMethod,
                order.getPaymentStatus(),
                order.getFarmerPaymentStatus(),
                paymentLink,
                order.isPayoutCompleted(),
                items
        );
    }

}
