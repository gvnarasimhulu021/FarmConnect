package com.farmconnect.auth.dto;

import com.farmconnect.auth.entity.Role;

public class UserResponse {

    private final Long id;
    private final String name;
    private final String email;
    private final Role role;
    private final boolean blocked;
    private final boolean enabled;

    public UserResponse(Long id, String name, String email, Role role, boolean blocked, boolean enabled) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.blocked = blocked;
        this.enabled = enabled;
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

    public Role getRole() {
        return role;
    }

    public boolean isBlocked() {
        return blocked;
    }

    public boolean isEnabled() {
        return enabled;
    }
}
