package com.farmconnect.farmerservice.controller;

import com.farmconnect.farmerservice.dto.CreateFarmerProfileRequest;
import com.farmconnect.farmerservice.dto.FarmerProfileResponse;
import com.farmconnect.farmerservice.dto.RecordOrderRequest;
import com.farmconnect.farmerservice.dto.SyncFarmerProductsRequest;
import com.farmconnect.farmerservice.dto.UpdateFarmerProfileRequest;
import com.farmconnect.farmerservice.service.FarmerProfileService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FarmerProfileController {

    private final FarmerProfileService farmerProfileService;

    public FarmerProfileController(FarmerProfileService farmerProfileService) {
        this.farmerProfileService = farmerProfileService;
    }

    @PostMapping("/internal/farmers")
    @ResponseStatus(HttpStatus.CREATED)
    public void createFarmer(@Valid @RequestBody CreateFarmerProfileRequest request) {
        farmerProfileService.createProfile(request);
    }

    @DeleteMapping("/internal/farmers/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFarmer(@PathVariable("id") Long id) {
        farmerProfileService.deleteProfile(id);
    }

    @PutMapping("/internal/farmers/{id}/orders")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void recordOrder(@PathVariable("id") Long id, @Valid @RequestBody RecordOrderRequest request) {
        farmerProfileService.recordOrder(id, request);
    }

    @PutMapping("/internal/farmers/{id}/products")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void syncProducts(@PathVariable("id") Long id, @Valid @RequestBody SyncFarmerProductsRequest request) {
        farmerProfileService.syncProducts(id, request);
    }

    @GetMapping("/api/farmers")
    public List<FarmerProfileResponse> getAllFarmers() {
        return farmerProfileService.getAllFarmers();
    }

    @GetMapping("/api/farmers/me")
    public FarmerProfileResponse getCurrentFarmer(
            @RequestHeader("X-Authenticated-User-Id") String userId,
            @RequestHeader("X-Authenticated-Role") String role,
            @RequestHeader(value = "X-Authenticated-User", required = false) String email
    ) {
        return farmerProfileService.getCurrentFarmer(userId, role, email);
    }

    @GetMapping("/api/farmers/{id}")
    public FarmerProfileResponse getFarmerById(@PathVariable("id") Long id) {
        return farmerProfileService.getFarmerById(id);
    }

    @PutMapping("/api/farmers/{id}")
    public FarmerProfileResponse updateFarmer(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateFarmerProfileRequest request,
            @RequestHeader("X-Authenticated-User-Id") String userId,
            @RequestHeader("X-Authenticated-Role") String role,
            @RequestHeader(value = "X-Authenticated-User", required = false) String email
    ) {
        return farmerProfileService.updateFarmer(id, request, userId, role, email);
    }
}
