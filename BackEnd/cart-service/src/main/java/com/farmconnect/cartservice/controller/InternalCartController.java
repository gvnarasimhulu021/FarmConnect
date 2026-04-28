package com.farmconnect.cartservice.controller;

import com.farmconnect.cartservice.dto.CartResponse;
import com.farmconnect.cartservice.service.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/carts")
public class InternalCartController {

    private final CartService cartService;

    public InternalCartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/{userId}")
    public CartResponse getCartForCheckout(@PathVariable Long userId) {
        return cartService.getCartForUserInternal(userId);
    }

    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clearCartAfterCheckout(@PathVariable Long userId) {
        cartService.clearCartInternal(userId);
    }
}
