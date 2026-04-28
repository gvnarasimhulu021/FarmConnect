package com.farmconnect.farmerservice.dto;

import java.math.BigDecimal;
import java.util.List;

public class FarmerProfileResponse {

    private final Long id;
    private final String name;
    private final String email;
    private final String phone;
    private final String farmName;
    private final String location;
    private final String specialty;
    private final String profileImageUrl;
    private final List<String> products;
    private final Integer totalOrders;
    private final BigDecimal totalEarnings;

    public FarmerProfileResponse(
            Long id,
            String name,
            String email,
            String phone,
            String farmName,
            String location,
            String specialty,
            String profileImageUrl,
            List<String> products,
            Integer totalOrders,
            BigDecimal totalEarnings
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.farmName = farmName;
        this.location = location;
        this.specialty = specialty;
        this.profileImageUrl = profileImageUrl;
        this.products = products;
        this.totalOrders = totalOrders;
        this.totalEarnings = totalEarnings;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getFarmName() {
        return farmName;
    }

    public String getLocation() {
        return location;
    }

    public String getSpecialty() {
        return specialty;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public List<String> getProducts() {
        return products;
    }

    public Integer getTotalOrders() {
        return totalOrders;
    }

    public BigDecimal getTotalEarnings() {
        return totalEarnings;
    }
}
