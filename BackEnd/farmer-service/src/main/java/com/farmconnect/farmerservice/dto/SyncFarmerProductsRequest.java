package com.farmconnect.farmerservice.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public class SyncFarmerProductsRequest {

    @NotNull
    private List<String> products;

    public List<String> getProducts() {
        return products;
    }

    public void setProducts(List<String> products) {
        this.products = products;
    }
}
