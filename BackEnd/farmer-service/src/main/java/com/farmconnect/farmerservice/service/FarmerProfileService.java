package com.farmconnect.farmerservice.service;

import com.farmconnect.farmerservice.dto.FarmerProfileResponse;
import com.farmconnect.farmerservice.dto.UpdateFarmerProfileRequest;
import com.farmconnect.farmerservice.entity.FarmerProfile;
import com.farmconnect.farmerservice.exception.FarmerNotFoundException;
import com.farmconnect.farmerservice.repository.FarmerProfileRepository;
import java.util.ArrayList;
import org.springframework.stereotype.Service;

@Service
public class FarmerProfileService {

    private final FarmerProfileRepository farmerProfileRepository;

    public FarmerProfileService(FarmerProfileRepository farmerProfileRepository) {
        this.farmerProfileRepository = farmerProfileRepository;
    }

    public FarmerProfileResponse getFarmerById(Long id) {
        FarmerProfile farmerProfile = farmerProfileRepository.findById(id)
                .orElseThrow(() -> new FarmerNotFoundException(id));
        return toResponse(farmerProfile);
    }

    public FarmerProfileResponse updateFarmer(Long id, UpdateFarmerProfileRequest request) {
        FarmerProfile farmerProfile = farmerProfileRepository.findById(id)
                .orElseThrow(() -> new FarmerNotFoundException(id));

        farmerProfileRepository.findByEmail(request.getEmail())
                .filter(existingFarmer -> !existingFarmer.getId().equals(id))
                .ifPresent(existingFarmer -> {
                    throw new IllegalArgumentException("Email is already in use");
                });

        farmerProfile.setName(request.getName());
        farmerProfile.setEmail(request.getEmail());
        farmerProfile.setPhone(request.getPhone());
        farmerProfile.setFarmName(request.getFarmName());
        farmerProfile.setLocation(request.getLocation());
        farmerProfile.setSpecialty(request.getSpecialty());
        farmerProfile.setProducts(new ArrayList<>(request.getProducts()));
        farmerProfile.setTotalOrders(request.getTotalOrders());
        farmerProfile.setTotalEarnings(request.getTotalEarnings());

        FarmerProfile savedFarmer = farmerProfileRepository.save(farmerProfile);
        return toResponse(savedFarmer);
    }

    private FarmerProfileResponse toResponse(FarmerProfile farmerProfile) {
        return new FarmerProfileResponse(
                farmerProfile.getId(),
                farmerProfile.getName(),
                farmerProfile.getEmail(),
                farmerProfile.getPhone(),
                farmerProfile.getFarmName(),
                farmerProfile.getLocation(),
                farmerProfile.getSpecialty(),
                farmerProfile.getProducts(),
                farmerProfile.getTotalOrders(),
                farmerProfile.getTotalEarnings()
        );
    }
}
