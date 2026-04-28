package com.farmconnect.farmerservice.service;

import com.farmconnect.farmerservice.dto.CreateFarmerProfileRequest;
import com.farmconnect.farmerservice.dto.FarmerProfileResponse;
import com.farmconnect.farmerservice.dto.RecordOrderRequest;
import com.farmconnect.farmerservice.dto.SyncFarmerProductsRequest;
import com.farmconnect.farmerservice.dto.UpdateFarmerProfileRequest;
import com.farmconnect.farmerservice.entity.FarmerProfile;
import com.farmconnect.farmerservice.exception.FarmerNotFoundException;
import com.farmconnect.farmerservice.exception.UnauthorizedActionException;
import com.farmconnect.farmerservice.repository.FarmerProfileRepository;
import com.farmconnect.farmerservice.security.RequestContext;
import com.farmconnect.farmerservice.security.RequestContextFactory;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FarmerProfileService {

    private final FarmerProfileRepository farmerProfileRepository;
    private final RequestContextFactory requestContextFactory;

    public FarmerProfileService(
            FarmerProfileRepository farmerProfileRepository,
            RequestContextFactory requestContextFactory
    ) {
        this.farmerProfileRepository = farmerProfileRepository;
        this.requestContextFactory = requestContextFactory;
    }

    public void createProfile(CreateFarmerProfileRequest request) {
        if (farmerProfileRepository.existsById(request.getId())) {
            return;
        }

        farmerProfileRepository.findByEmail(request.getEmail()).ifPresent(existing -> {
            throw new IllegalArgumentException("Email is already in use");
        });

        FarmerProfile farmerProfile = new FarmerProfile();
        farmerProfile.setId(request.getId());
        farmerProfile.setName(request.getName());
        farmerProfile.setEmail(request.getEmail());
        farmerProfile.setFarmName(request.getFarmName());
        farmerProfileRepository.save(farmerProfile);
    }

    @Transactional
    public void deleteProfile(Long id) {
        if (!farmerProfileRepository.existsById(id)) {
            return;
        }
        farmerProfileRepository.deleteById(id);
    }

    public List<FarmerProfileResponse> getAllFarmers() {
        return farmerProfileRepository.findAllByOrderByFarmNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    public FarmerProfileResponse getFarmerById(Long id) {
        return toResponse(findFarmer(id));
    }

    public FarmerProfileResponse getCurrentFarmer(String userId, String role, String email) {
        RequestContext requestContext = requestContextFactory.create(userId, role, email);
        if (requestContext.userId() == null) {
            throw new UnauthorizedActionException("Missing authenticated farmer id");
        }
        return toResponse(findFarmer(requestContext.userId()));
    }

    public FarmerProfileResponse updateFarmer(
            Long id,
            UpdateFarmerProfileRequest request,
            String userId,
            String role,
            String email
    ) {
        RequestContext requestContext = requestContextFactory.create(userId, role, email);
        validateSelfOrAdmin(id, requestContext);

        FarmerProfile farmerProfile = findFarmer(id);
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
        farmerProfile.setProfileImageUrl(request.getProfileImageUrl());

        FarmerProfile savedFarmer = farmerProfileRepository.save(farmerProfile);
        return toResponse(savedFarmer);
    }

    @Transactional
    public void recordOrder(Long farmerId, RecordOrderRequest request) {
        FarmerProfile farmerProfile = findFarmer(farmerId);
        farmerProfile.setTotalOrders(farmerProfile.getTotalOrders() + 1);
        farmerProfile.setTotalEarnings(farmerProfile.getTotalEarnings().add(request.getAmount()));
    }

    @Transactional
    public void syncProducts(Long farmerId, SyncFarmerProductsRequest request) {
        FarmerProfile farmerProfile = findFarmer(farmerId);
        farmerProfile.setProducts(new ArrayList<>(request.getProducts()));
    }

    private FarmerProfile findFarmer(Long id) {
        return farmerProfileRepository.findById(id)
                .orElseThrow(() -> new FarmerNotFoundException(id));
    }

    private void validateSelfOrAdmin(Long id, RequestContext requestContext) {
        if (requestContext.isAdmin()) {
            return;
        }

        if (!requestContext.isFarmer() || requestContext.userId() == null || !requestContext.userId().equals(id)) {
            throw new UnauthorizedActionException("You can only access your own farmer profile");
        }
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
                farmerProfile.getProfileImageUrl(),
                farmerProfile.getProducts(),
                farmerProfile.getTotalOrders(),
                farmerProfile.getTotalEarnings() == null ? BigDecimal.ZERO : farmerProfile.getTotalEarnings()
        );
    }
}
