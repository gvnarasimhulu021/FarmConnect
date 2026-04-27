package com.farmconnect.userservice.service;

import com.farmconnect.userservice.dto.UpdateUserProfileRequest;
import com.farmconnect.userservice.dto.UserProfileResponse;
import com.farmconnect.userservice.entity.UserProfile;
import com.farmconnect.userservice.exception.UserNotFoundException;
import com.farmconnect.userservice.repository.UserProfileRepository;
import org.springframework.stereotype.Service;

@Service
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;

    public UserProfileService(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    public UserProfileResponse getUserById(Long id) {
        UserProfile userProfile = userProfileRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        return toResponse(userProfile);
    }

    public UserProfileResponse updateUser(Long id, UpdateUserProfileRequest request) {
        UserProfile userProfile = userProfileRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        userProfileRepository.findByEmail(request.getEmail())
                .filter(existingUser -> !existingUser.getId().equals(id))
                .ifPresent(existingUser -> {
                    throw new IllegalArgumentException("Email is already in use");
                });

        userProfile.setName(request.getName());
        userProfile.setEmail(request.getEmail());
        userProfile.setPhone(request.getPhone());
        userProfile.setAddress(request.getAddress());

        UserProfile savedUser = userProfileRepository.save(userProfile);
        return toResponse(savedUser);
    }

    private UserProfileResponse toResponse(UserProfile userProfile) {
        return new UserProfileResponse(
                userProfile.getId(),
                userProfile.getName(),
                userProfile.getEmail(),
                userProfile.getPhone(),
                userProfile.getAddress()
        );
    }
}
