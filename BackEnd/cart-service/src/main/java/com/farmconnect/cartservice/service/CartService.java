package com.farmconnect.cartservice.service;

import com.farmconnect.cartservice.dto.AddToCartRequest;
import com.farmconnect.cartservice.dto.CartItemResponse;
import com.farmconnect.cartservice.dto.CartResponse;
import com.farmconnect.cartservice.dto.ProductSnapshot;
import com.farmconnect.cartservice.entity.Cart;
import com.farmconnect.cartservice.entity.CartItem;
import com.farmconnect.cartservice.exception.CartItemNotFoundException;
import com.farmconnect.cartservice.exception.UnauthorizedActionException;
import com.farmconnect.cartservice.repository.CartItemRepository;
import com.farmconnect.cartservice.repository.CartRepository;
import com.farmconnect.cartservice.security.RequestContext;
import com.farmconnect.cartservice.security.RequestContextFactory;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final RequestContextFactory requestContextFactory;
    private final RestClient.Builder restClientBuilder;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            RequestContextFactory requestContextFactory,
            RestClient.Builder restClientBuilder
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.requestContextFactory = requestContextFactory;
        this.restClientBuilder = restClientBuilder;
    }

    @Transactional
    public CartResponse addToCart(AddToCartRequest request, String userId, String role, String email) {
        RequestContext requestContext = requestContextFactory.create(userId, role, email);
        Long authenticatedUserId = requireUserAccess(requestContext);
        validateRequestedUser(request.getUserId(), authenticatedUserId);
        fetchProduct(request.getProductId());

        Cart cart = cartRepository.findByUserId(authenticatedUserId)
                .orElseGet(() -> createNewCart(authenticatedUserId));

        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(request.getProductId()))
                .findFirst()
                .orElse(null);

        if (cartItem == null) {
            cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProductId(request.getProductId());
            cartItem.setQuantity(request.getQuantity());
            cart.getItems().add(cartItem);
        } else {
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
        }

        Cart savedCart = cartRepository.save(cart);
        return toResponse(savedCart);
    }

    public CartResponse getCartForUser(Long requestedUserId, String userId, String role, String email) {
        RequestContext requestContext = requestContextFactory.create(userId, role, email);
        Long authenticatedUserId = requireUserAccess(requestContext);
        validateRequestedUser(requestedUserId, authenticatedUserId);
        return getCartForUserInternal(authenticatedUserId);
    }

    @Transactional
    public void removeItem(Long cartItemId, String userId, String role, String email) {
        RequestContext requestContext = requestContextFactory.create(userId, role, email);
        Long authenticatedUserId = requireUserAccess(requestContext);

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new CartItemNotFoundException(cartItemId));

        if (!cartItem.getCart().getUserId().equals(authenticatedUserId)) {
            throw new UnauthorizedActionException("You cannot remove items from another user's cart");
        }

        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void clearCart(Long requestedUserId, String userId, String role, String email) {
        RequestContext requestContext = requestContextFactory.create(userId, role, email);
        Long authenticatedUserId = requireUserAccess(requestContext);
        validateRequestedUser(requestedUserId, authenticatedUserId);
        clearCartInternal(authenticatedUserId);
    }

    public CartResponse getCartForUserInternal(Long userId) {
        return cartRepository.findByUserId(userId)
                .map(this::toResponse)
                .orElse(new CartResponse(null, userId, List.of()));
    }

    @Transactional
    public void clearCartInternal(Long userId) {
        cartRepository.findByUserId(userId).ifPresent(cart -> cart.getItems().clear());
    }

    private Long requireUserAccess(RequestContext requestContext) {
        if (!requestContext.isUser()) {
            throw new UnauthorizedActionException("Only users can access cart APIs");
        }
        if (requestContext.userId() == null) {
            throw new UnauthorizedActionException("Missing authenticated user id");
        }
        return requestContext.userId();
    }

    private void validateRequestedUser(Long requestedUserId, Long authenticatedUserId) {
        if (requestedUserId != null && !requestedUserId.equals(authenticatedUserId)) {
            throw new UnauthorizedActionException("You can only access your own cart");
        }
    }

    private Cart createNewCart(Long userId) {
        Cart cart = new Cart();
        cart.setUserId(userId);
        return cart;
    }

    private ProductSnapshot fetchProduct(Long productId) {
        try {
            ProductSnapshot product = restClientBuilder.build()
                    .get()
                    .uri("http://PRODUCT-SERVICE/internal/products/{id}", productId)
                    .retrieve()
                    .body(ProductSnapshot.class);

            if (product == null) {
                throw new IllegalArgumentException("Product " + productId + " could not be loaded");
            }
            return product;
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode().value() == 404) {
                throw new IllegalArgumentException("Product not found with id: " + productId);
            }
            throw new IllegalArgumentException("Product validation failed for id: " + productId);
        }
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .sorted(Comparator.comparing(item -> item.getId() == null ? Long.MAX_VALUE : item.getId()))
                .map(item -> new CartItemResponse(item.getId(), item.getProductId(), item.getQuantity()))
                .toList();

        return new CartResponse(cart.getId(), cart.getUserId(), items);
    }
}
