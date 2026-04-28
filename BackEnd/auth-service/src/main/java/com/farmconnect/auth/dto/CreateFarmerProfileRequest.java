package com.farmconnect.auth.dto;

public class CreateFarmerProfileRequest {

    private Long id;
    private String name;
    private String email;
    private String farmName;

    public CreateFarmerProfileRequest() {
    }

    public CreateFarmerProfileRequest(Long id, String name, String email, String farmName) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.farmName = farmName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFarmName() {
        return farmName;
    }

    public void setFarmName(String farmName) {
        this.farmName = farmName;
    }
}
