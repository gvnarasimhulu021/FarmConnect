package com.farmconnect.productservice.controller;

import com.farmconnect.productservice.dto.ProductResponse;
import com.farmconnect.productservice.service.ProductService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/products")
public class InternalProductController {

    private final ProductService productService;

    public InternalProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/{id}")
    public ProductResponse getProduct(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @PutMapping("/{id}/reserve")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reserveProduct(@PathVariable Long id, @RequestParam Integer quantity) {
        productService.reserveInventory(id, quantity);
    }

    @DeleteMapping("/farmers/{farmerId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProductsByFarmer(@PathVariable Long farmerId) {
        productService.deleteProductsByFarmerId(farmerId);
    }
}
