package com.farmconnect.auth.service;

import com.farmconnect.auth.dto.AuthResponse;
import com.farmconnect.auth.dto.AuthStatsResponse;
import com.farmconnect.auth.dto.LoginRequest;
import com.farmconnect.auth.dto.ResendOtpRequest;
import com.farmconnect.auth.dto.RegisterRequest;
import com.farmconnect.auth.dto.UserEmailResponse;
import com.farmconnect.auth.dto.UserResponse;
import com.farmconnect.auth.dto.VerifyOtpRequest;
import com.farmconnect.auth.entity.Role;
import com.farmconnect.auth.entity.User;
import com.farmconnect.auth.repository.UserRepository;
import com.farmconnect.auth.security.SecurityUser;
import com.farmconnect.auth.security.JwtService;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.security.authentication.DisabledException;
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
    private final EmailService emailService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            ProfileProvisioningService profileProvisioningService,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.profileProvisioningService = profileProvisioningService;
        this.emailService = emailService;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (request.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Admin registration is restricted");
        }

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user != null) {
            if (user.getRole() == Role.ADMIN || user.isEnabled()) {
                throw new IllegalArgumentException("Email already exists");
            }

            // Cleanup any stale profile rows created before verification hardening.
            profileProvisioningService.removeProfile(user);
        } else {
            user = new User();
            user.setEmail(request.getEmail());
        }

        user.setName(request.getName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setBlocked(false);
        user.setEnabled(false);
        user.setVerificationToken(generateOtp());
        user.setTokenExpiry(Instant.now().plusSeconds(15 * 60));

        User savedUser = userRepository.save(user);
        sendVerificationOtp(savedUser);
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
        if (user.getRole() != Role.ADMIN && !user.isEnabled()) {
            throw new DisabledException("Please verify your email before login");
        }

        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getId(), user.getRole().name());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail(), user.getId(), user.getRole().name());
        return new AuthResponse(accessToken, refreshToken, jwtService.getAccessExpirationMillis(), toUserResponse(user));
    }

    public AuthResponse refreshAccessToken(String refreshToken) {
        User user = resolveUserFromRefreshToken(refreshToken);

        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getId(), user.getRole().name());
        String rotatedRefreshToken = jwtService.generateRefreshToken(user.getEmail(), user.getId(), user.getRole().name());
        return new AuthResponse(accessToken, rotatedRefreshToken, jwtService.getAccessExpirationMillis(), toUserResponse(user));
    }

    public void logout(String refreshToken) {
        resolveUserFromRefreshToken(refreshToken);
    }

    @Transactional
    public String verifyAccount(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Verification token is required");
        }

        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification token"));

        if (user.getTokenExpiry() == null || Instant.now().isAfter(user.getTokenExpiry())) {
            throw new IllegalArgumentException("Verification token has expired");
        }

        activateVerifiedUser(user);
        return "Account verified successfully. You can now login.";
    }

    @Transactional
    public String verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.isEnabled()) {
            return "Account already verified. Please login.";
        }
        if (user.getTokenExpiry() == null || Instant.now().isAfter(user.getTokenExpiry())) {
            throw new IllegalArgumentException("OTP has expired. Please request a new OTP.");
        }
        if (user.getVerificationToken() == null || !user.getVerificationToken().equals(request.getOtp())) {
            throw new IllegalArgumentException("Invalid OTP");
        }

        activateVerifiedUser(user);
        return "Email verified successfully. Please login.";
    }

    @Transactional
    public String resendVerificationOtp(ResendOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.isEnabled()) {
            return "Account already verified. Please login.";
        }

        user.setVerificationToken(generateOtp());
        user.setTokenExpiry(Instant.now().plusSeconds(15 * 60));
        userRepository.save(user);
        sendVerificationOtp(user);
        return "Verification OTP sent to your email.";
    }

    public UserEmailResponse getUserEmailById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return new UserEmailResponse(user.getId(), user.getEmail());
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toUserResponse(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAllByEnabledTrueOrderByIdAsc().stream()
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
        long totalUsers = userRepository.countByEnabledTrue();
        long totalFarmers = userRepository.countByRoleAndEnabledTrue(Role.FARMER);
        long totalConsumers = userRepository.countByRoleAndEnabledTrue(Role.USER);
        long totalAdmins = userRepository.countByRoleAndEnabledTrue(Role.ADMIN);
        return new AuthStatsResponse(totalUsers, totalFarmers, totalConsumers, totalAdmins);
    }

    private User resolveUserFromRefreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new IllegalArgumentException("Refresh token is required");
        }

        String email;
        try {
            email = jwtService.extractUsername(refreshToken);
        } catch (RuntimeException ex) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        SecurityUser securityUser = new SecurityUser(user);
        if (!jwtService.isRefreshTokenValid(refreshToken, securityUser)) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }
        if (user.isBlocked()) {
            throw new LockedException("Your account has been blocked");
        }
        if (user.getRole() != Role.ADMIN && !user.isEnabled()) {
            throw new DisabledException("Please verify your email before login");
        }
        return user;
    }

    private String generateOtp() {
        int otpNumber = ThreadLocalRandom.current().nextInt(100000, 1000000);
        return String.valueOf(otpNumber);
    }

    private void activateVerifiedUser(User user) {
        profileProvisioningService.provisionProfile(user);
        user.setEnabled(true);
        user.setVerificationToken(null);
        user.setTokenExpiry(null);
        userRepository.save(user);
    }

    private void sendVerificationOtp(User user) {
        String body = "Your FarmConnect verification OTP is: " + user.getVerificationToken()
                + "\nThis OTP expires in 15 minutes.";
        emailService.sendMail(user.getEmail(), "Verify Account OTP", body);
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isBlocked(),
                user.isEnabled()
        );
    }
}
