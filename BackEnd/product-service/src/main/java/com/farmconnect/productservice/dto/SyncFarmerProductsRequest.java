package com.farmconnect.productservice.dto;

import java.util.List;

public class SyncFarmerProductsRequest {

    private List<String> products;

    public SyncFarmerProductsRequest() {
    }

    public SyncFarmerProductsRequest(List<String> products) {
        this.products = products;
    }

    public List<String> getProducts() {
        return products;
    }

    public void setProducts(List<String> products) {
        this.products = products;
    }
}
