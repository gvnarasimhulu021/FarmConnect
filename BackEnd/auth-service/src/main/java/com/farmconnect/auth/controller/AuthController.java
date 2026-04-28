package com.farmconnect.auth.controller;

import com.farmconnect.auth.dto.AuthResponse;
import com.farmconnect.auth.dto.AuthStatsResponse;
import com.farmconnect.auth.dto.LoginRequest;
import com.farmconnect.auth.dto.RegisterRequest;
import com.farmconnect.auth.dto.UpdateUserBlockRequest;
import com.farmconnect.auth.dto.UserResponse;
import com.farmconnect.auth.service.AuthService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
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
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/stats")
    public AuthStatsResponse getPublicStats() {
        return authService.getPublicStats();
    }

    @PostMapping("/me")
    public UserResponse currentUser(@RequestHeader("X-Authenticated-User") String email) {
        return authService.getCurrentUser(email);
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getAllUsers() {
        return authService.getAllUsers();
    }

    @PutMapping("/users/{id}/block")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse updateUserBlocked(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateUserBlockRequest request
    ) {
        return authService.updateUserBlocked(id, request.getBlocked());
    }

    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUserByAdmin(
            @PathVariable("id") Long id,
            @RequestHeader("X-Authenticated-User") String requesterEmail
    ) {
        authService.deleteUserByAdmin(id, requesterEmail);
    }
}
