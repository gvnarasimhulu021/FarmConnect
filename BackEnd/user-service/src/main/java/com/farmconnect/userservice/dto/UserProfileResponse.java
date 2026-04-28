package com.farmconnect.userservice.dto;

public class UserProfileResponse {

    private final Long id;
    private final String name;
    private final String email;
    private final String phone;
    private final String address;
    private final String profileImageUrl;

    public UserProfileResponse(Long id, String name, String email, String phone, String address, String profileImageUrl) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.profileImageUrl = profileImageUrl;
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

    public String getAddress() {
        return address;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }
}
