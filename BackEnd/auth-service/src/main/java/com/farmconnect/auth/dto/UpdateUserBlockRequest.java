package com.farmconnect.auth.dto;

import jakarta.validation.constraints.NotNull;

public class UpdateUserBlockRequest {

    @NotNull
    private Boolean blocked;

    public Boolean getBlocked() {
        return blocked;
    }

    public void setBlocked(Boolean blocked) {
        this.blocked = blocked;
    }
}
