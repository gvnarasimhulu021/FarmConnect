package com.farmconnect.auth.dto;

public class AuthStatsResponse {

    private final long totalUsers;
    private final long totalFarmers;
    private final long totalConsumers;
    private final long totalAdmins;

    public AuthStatsResponse(long totalUsers, long totalFarmers, long totalConsumers, long totalAdmins) {
        this.totalUsers = totalUsers;
        this.totalFarmers = totalFarmers;
        this.totalConsumers = totalConsumers;
        this.totalAdmins = totalAdmins;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public long getTotalFarmers() {
        return totalFarmers;
    }

    public long getTotalConsumers() {
        return totalConsumers;
    }

    public long getTotalAdmins() {
        return totalAdmins;
    }
}
