package com.farmconnect.auth.service;

import com.farmconnect.auth.dto.AuthResponse;
import com.farmconnect.auth.dto.AuthStatsResponse;
import com.farmconnect.auth.dto.LoginRequest;
import com.farmconnect.auth.dto.RegisterRequest;
import com.farmconnect.auth.dto.UserResponse;
import com.farmconnect.auth.entity.Role;
import com.farmconnect.auth.entity.User;
import com.farmconnect.auth.repository.UserRepository;
import com.farmconnect.auth.security.JwtService;
import java.util.List;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final ProfileProvisioningService profileProvisioningService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            ProfileProvisioningService profileProvisioningService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.profileProvisioningService = profileProvisioningService;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }
        if (request.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Admin registration is restricted");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        User savedUser = userRepository.save(user);
        profileProvisioningService.provisionProfile(savedUser);
        return toUserResponse(savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (request.getRole() != null && request.getRole() != user.getRole()) {
            throw new IllegalArgumentException("Selected role does not match this account");
        }
        if (user.isBlocked()) {
            throw new LockedException("Your account has been blocked");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        return new AuthResponse(token, toUserResponse(user));
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toUserResponse(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAllByOrderByIdAsc().stream()
                .map(this::toUserResponse)
                .toList();
    }

    @Transactional
    public UserResponse updateUserBlocked(Long id, boolean blocked) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setBlocked(blocked);
        User savedUser = userRepository.save(user);
        return toUserResponse(savedUser);
    }

    @Transactional
    public void deleteUserByAdmin(Long id, String requesterEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Admin accounts cannot be removed");
        }
        if (user.getEmail().equalsIgnoreCase(requesterEmail)) {
            throw new IllegalArgumentException("You cannot remove your own account");
        }

        profileProvisioningService.removeProfile(user);
        userRepository.delete(user);
    }

    public AuthStatsResponse getPublicStats() {
        long totalUsers = userRepository.count();
        long totalFarmers = userRepository.countByRole(Role.FARMER);
        long totalConsumers = userRepository.countByRole(Role.USER);
        long totalAdmins = userRepository.countByRole(Role.ADMIN);
        return new AuthStatsResponse(totalUsers, totalFarmers, totalConsumers, totalAdmins);
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isBlocked()
        );
    }
}
