package com.farmconnect.userservice.service;

import com.farmconnect.userservice.dto.CreateUserProfileRequest;
import com.farmconnect.userservice.dto.UpdateUserProfileRequest;
import com.farmconnect.userservice.dto.UserProfileResponse;
import com.farmconnect.userservice.entity.UserProfile;
import com.farmconnect.userservice.exception.UnauthorizedActionException;
import com.farmconnect.userservice.exception.UserNotFoundException;
import com.farmconnect.userservice.repository.UserProfileRepository;
import com.farmconnect.userservice.security.RequestContext;
import com.farmconnect.userservice.security.RequestContextFactory;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final RequestContextFactory requestContextFactory;

    public UserProfileService(
            UserProfileRepository userProfileRepository,
            RequestContextFactory requestContextFactory
    ) {
        this.userProfileRepository = userProfileRepository;
        this.requestContextFactory = requestContextFactory;
    }

    public void createProfile(CreateUserProfileRequest request) {
        if (userProfileRepository.existsById(request.getId())) {
            return;
        }

        userProfileRepository.findByEmail(request.getEmail()).ifPresent(existing -> {
            throw new IllegalArgumentException("Email is already in use");
        });

        UserProfile userProfile = new UserProfile();
        userProfile.setId(request.getId());
        userProfile.setName(request.getName());
        userProfile.setEmail(request.getEmail());
        userProfileRepository.save(userProfile);
    }

    @Transactional
    public void deleteProfile(Long id) {
        if (!userProfileRepository.existsById(id)) {
            return;
        }
        userProfileRepository.deleteById(id);
    }

    public List<UserProfileResponse> getAllUsers(String userId, String role, String email) {
        RequestContext requestContext = requestContextFactory.create(userId, role, email);
        if (!requestContext.isAdmin()) {
            throw new UnauthorizedActionException("Only admins can view all users");
        }

        return userProfileRepository.findAllByOrderByNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    public UserProfileResponse getUserById(Long id, String userId, String role, String email) {
        RequestContext requestContext = requestContextFactory.create(userId, role, email);
        validateSelfOrAdmin(id, requestContext);
        return toResponse(findUser(id));
    }

    public UserProfileResponse getCurrentUser(String userId, String role, String email) {
        RequestContext requestContext = requestContextFactory.create(userId, role, email);
        if (requestContext.userId() == null) {
            throw new UnauthorizedActionException("Missing authenticated user id");
        }
        return toResponse(findUser(requestContext.userId()));
    }

    public UserProfileResponse updateUser(Long id, UpdateUserProfileRequest request, String userId, String role, String email) {
        RequestContext requestContext = requestContextFactory.create(userId, role, email);
        validateSelfOrAdmin(id, requestContext);

        UserProfile userProfile = findUser(id);
        userProfileRepository.findByEmail(request.getEmail())
                .filter(existingUser -> !existingUser.getId().equals(id))
                .ifPresent(existingUser -> {
                    throw new IllegalArgumentException("Email is already in use");
                });

        userProfile.setName(request.getName());
        userProfile.setEmail(request.getEmail());
        userProfile.setPhone(request.getPhone());
        userProfile.setAddress(request.getAddress());
        userProfile.setProfileImageUrl(request.getProfileImageUrl());

        UserProfile savedUser = userProfileRepository.save(userProfile);
        return toResponse(savedUser);
    }

    private UserProfile findUser(Long id) {
        return userProfileRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    private void validateSelfOrAdmin(Long id, RequestContext requestContext) {
        if (requestContext.isAdmin()) {
            return;
        }

        if (requestContext.userId() == null || !requestContext.userId().equals(id)) {
            throw new UnauthorizedActionException("You can only access your own profile");
        }
    }

    private UserProfileResponse toResponse(UserProfile userProfile) {
        return new UserProfileResponse(
                userProfile.getId(),
                userProfile.getName(),
                userProfile.getEmail(),
                userProfile.getPhone(),
                userProfile.getAddress(),
                userProfile.getProfileImageUrl()
        );
    }
}
