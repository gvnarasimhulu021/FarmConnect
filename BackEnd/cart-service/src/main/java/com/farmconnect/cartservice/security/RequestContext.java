package com.farmconnect.cartservice.security;

public record RequestContext(Long userId, String role, String email) {

    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(role);
    }

    public boolean isFarmer() {
        return "FARMER".equalsIgnoreCase(role);
    }

    public boolean isUser() {
        return "USER".equalsIgnoreCase(role);
    }
}
