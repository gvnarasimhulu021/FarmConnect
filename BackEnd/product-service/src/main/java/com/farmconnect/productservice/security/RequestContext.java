package com.farmconnect.productservice.security;

public record RequestContext(Long userId, String role, String email) {

    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(role);
    }

    public boolean isFarmer() {
        return "FARMER".equalsIgnoreCase(role);
    }
}
