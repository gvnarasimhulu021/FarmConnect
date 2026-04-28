package com.farmconnect.auth.dto;

public class UserEmailResponse {

    private final Long userId;
    private final String email;

    public UserEmailResponse(Long userId, String email) {
        this.userId = userId;
        this.email = email;
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }
}
