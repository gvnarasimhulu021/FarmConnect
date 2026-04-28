package com.farmconnect.orderservice.service;

import com.farmconnect.orderservice.dto.CartItemSnapshot;
import com.farmconnect.orderservice.dto.CartSnapshot;
import com.farmconnect.orderservice.dto.CreateOrderItemRequest;
import com.farmconnect.orderservice.dto.CreateOrderRequest;
import com.farmconnect.orderservice.dto.OrderItemResponse;
import com.farmconnect.orderservice.dto.OrderResponse;
import com.farmconnect.orderservice.dto.ProductSnapshot;
import com.farmconnect.orderservice.dto.RecordFarmerOrderRequest;
import com.farmconnect.orderservice.dto.UpdateOrderStatusRequest;
import com.farmconnect.orderservice.entity.Order;
import com.farmconnect.orderservice.entity.OrderItem;
import com.farmconnect.orderservice.entity.OrderStatus;
import com.farmconnect.orderservice.exception.OrderNotFoundException;
import com.farmconnect.orderservice.exception.UnauthorizedActionException;
import com.farmconnect.orderservice.repository.OrderRepository;
import com.farmconnect.orderservice.security.RequestContext;
import com.farmconnect.orderservice.security.RequestContextFactory;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final RequestContextFactory requestContextFactory;
    private final RestClient.Builder restClientBuilder;

    public OrderService(
            OrderRepository orderRepository,
            RequestContextFactory requestContextFactory,
            RestClient.Builder restClientBuilder
    ) {
        this.orderRepository = orderRepository;
        this.requestContextFactory = requestContextFactory;
        this.restClientBuilder = restClientBuilder;
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

        return createOrderFromItems(requestContext.userId(), request.getItems());
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

        OrderResponse response = createOrderFromItems(requestContext.userId(), orderItems);
        clearCartAfterCheckout(requestContext.userId());
        return response;
    }

    public List<OrderResponse> getOrdersForCurrentUser(String userId, String role, String email) {
        RequestContext requestContext = requestContextFactory.create(userId, role, email);
        if (requestContext.userId() == null) {
            throw new UnauthorizedActionException("Missing authenticated user id");
        }

        if (requestContext.isAdmin()) {
            return orderRepository.findAllByOrderByIdDesc().stream().map(this::toResponse).toList();
        }

        if (requestContext.isFarmer()) {
            return orderRepository.findDistinctByOrderItemsFarmerIdOrderByIdDesc(requestContext.userId()).stream()
                    .map(this::toResponse)
                    .toList();
        }

        return orderRepository.findByUserIdOrderByIdDesc(requestContext.userId()).stream()
                .map(this::toResponse)
                .toList();
    }

    public OrderResponse getOrderById(Long id, String userId, String role, String email) {
        RequestContext requestContext = requestContextFactory.create(userId, role, email);
        Order order = findOrder(id);
        validateCanViewOrder(order, requestContext);
        return toResponse(order);
    }

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

        Order savedOrder = orderRepository.save(order);
        return toResponse(savedOrder);
    }

    private Order findOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
    }

    private OrderResponse createOrderFromItems(Long userId, List<CreateOrderItemRequest> itemRequests) {
        Order order = new Order();
        order.setUserId(userId);
        order.setStatus(OrderStatus.PLACED);

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        Map<Long, BigDecimal> earningsByFarmer = new LinkedHashMap<>();

        for (CreateOrderItemRequest itemRequest : itemRequests) {
            ProductSnapshot product = fetchProduct(itemRequest.getProductId());
            validateAvailableQuantity(product, itemRequest.getQuantity());
            reserveProduct(product.getId(), itemRequest.getQuantity());

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(product.getId());
            orderItem.setFarmerId(product.getFarmerId());
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(product.getPrice());
            orderItems.add(orderItem);

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
            earningsByFarmer.merge(product.getFarmerId(), itemTotal, BigDecimal::add);
        }

        order.setOrderItems(orderItems);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);
        earningsByFarmer.forEach(this::recordFarmerOrder);
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

    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (newStatus.ordinal() < currentStatus.ordinal()) {
            throw new IllegalArgumentException("Order status cannot move backwards");
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

        return new OrderResponse(
                order.getId(),
                order.getUserId(),
                order.getTotalAmount(),
                order.getStatus(),
                items
        );
    }
}
