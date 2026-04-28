package com.farmconnect.userservice.security;

public record RequestContext(Long userId, String role, String email) {

    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(role);
    }
}
