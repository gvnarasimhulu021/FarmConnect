package com.farmconnect.userservice.controller;

import com.farmconnect.userservice.dto.CreateUserProfileRequest;
import com.farmconnect.userservice.dto.UpdateUserProfileRequest;
import com.farmconnect.userservice.dto.UserProfileResponse;
import com.farmconnect.userservice.service.UserProfileService;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @PostMapping("/internal/users")
    @ResponseStatus(HttpStatus.CREATED)
    public void createUser(@Valid @RequestBody CreateUserProfileRequest request) {
        userProfileService.createProfile(request);
    }

    @DeleteMapping("/internal/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable("id") Long id) {
        userProfileService.deleteProfile(id);
    }

    @GetMapping("/api/users")
    public List<UserProfileResponse> getAllUsers(
            @RequestHeader("X-Authenticated-User-Id") String userId,
            @RequestHeader("X-Authenticated-Role") String role,
            @RequestHeader(value = "X-Authenticated-User", required = false) String email
    ) {
        return userProfileService.getAllUsers(userId, role, email);
    }

    @GetMapping("/api/users/me")
    public UserProfileResponse getCurrentUser(
            @RequestHeader("X-Authenticated-User-Id") String userId,
            @RequestHeader("X-Authenticated-Role") String role,
            @RequestHeader(value = "X-Authenticated-User", required = false) String email
    ) {
        return userProfileService.getCurrentUser(userId, role, email);
    }

    @GetMapping("/api/users/{id}")
    public UserProfileResponse getUserById(
            @PathVariable("id") Long id,
            @RequestHeader("X-Authenticated-User-Id") String userId,
            @RequestHeader("X-Authenticated-Role") String role,
            @RequestHeader(value = "X-Authenticated-User", required = false) String email
    ) {
        return userProfileService.getUserById(id, userId, role, email);
    }

    @PutMapping("/api/users/{id}")
    public UserProfileResponse updateUser(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateUserProfileRequest request,
            @RequestHeader("X-Authenticated-User-Id") String userId,
            @RequestHeader("X-Authenticated-Role") String role,
            @RequestHeader(value = "X-Authenticated-User", required = false) String email
    ) {
        return userProfileService.updateUser(id, request, userId, role, email);
    }
}
