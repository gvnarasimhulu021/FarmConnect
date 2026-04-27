package com.farmconnect.userservice.controller;

import com.farmconnect.userservice.dto.UpdateUserProfileRequest;
import com.farmconnect.userservice.dto.UserProfileResponse;
import com.farmconnect.userservice.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/{id}")
    public UserProfileResponse getUserById(@PathVariable Long id) {
        return userProfileService.getUserById(id);
    }

    @PutMapping("/{id}")
    public UserProfileResponse updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserProfileRequest request) {
        return userProfileService.updateUser(id, request);
    }
}
