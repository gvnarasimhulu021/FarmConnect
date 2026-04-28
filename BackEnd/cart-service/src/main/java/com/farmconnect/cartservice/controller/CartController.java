package com.farmconnect.cartservice.controller;

import com.farmconnect.cartservice.dto.AddToCartRequest;
import com.farmconnect.cartservice.dto.CartResponse;
import com.farmconnect.cartservice.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/add")
    @ResponseStatus(HttpStatus.CREATED)
    public CartResponse addToCart(
            @Valid @RequestBody AddToCartRequest request,
            @RequestHeader("X-Authenticated-User-Id") String userId,
            @RequestHeader("X-Authenticated-Role") String role,
            @RequestHeader(value = "X-Authenticated-User", required = false) String email
    ) {
        return cartService.addToCart(request, userId, role, email);
    }

    @GetMapping("/{userId}")
    public CartResponse getCart(
            @PathVariable Long userId,
            @RequestHeader("X-Authenticated-User-Id") String authenticatedUserId,
            @RequestHeader("X-Authenticated-Role") String role,
            @RequestHeader(value = "X-Authenticated-User", required = false) String email
    ) {
        return cartService.getCartForUser(userId, authenticatedUserId, role, email);
    }

    @DeleteMapping("/remove/{cartItemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeCartItem(
            @PathVariable Long cartItemId,
            @RequestHeader("X-Authenticated-User-Id") String userId,
            @RequestHeader("X-Authenticated-Role") String role,
            @RequestHeader(value = "X-Authenticated-User", required = false) String email
    ) {
        cartService.removeItem(cartItemId, userId, role, email);
    }

    @DeleteMapping("/clear/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clearCart(
            @PathVariable Long userId,
            @RequestHeader("X-Authenticated-User-Id") String authenticatedUserId,
            @RequestHeader("X-Authenticated-Role") String role,
            @RequestHeader(value = "X-Authenticated-User", required = false) String email
    ) {
        cartService.clearCart(userId, authenticatedUserId, role, email);
    }
}
