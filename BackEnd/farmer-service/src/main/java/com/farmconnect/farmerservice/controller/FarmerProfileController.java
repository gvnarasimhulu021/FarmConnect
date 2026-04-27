package com.farmconnect.farmerservice.controller;

import com.farmconnect.farmerservice.dto.FarmerProfileResponse;
import com.farmconnect.farmerservice.dto.UpdateFarmerProfileRequest;
import com.farmconnect.farmerservice.service.FarmerProfileService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/farmers")
public class FarmerProfileController {

    private final FarmerProfileService farmerProfileService;

    public FarmerProfileController(FarmerProfileService farmerProfileService) {
        this.farmerProfileService = farmerProfileService;
    }

    @GetMapping("/{id}")
    public FarmerProfileResponse getFarmerById(@PathVariable Long id) {
        return farmerProfileService.getFarmerById(id);
    }

    @PutMapping("/{id}")
    public FarmerProfileResponse updateFarmer(
            @PathVariable Long id,
            @Valid @RequestBody UpdateFarmerProfileRequest request
    ) {
        return farmerProfileService.updateFarmer(id, request);
    }
}
