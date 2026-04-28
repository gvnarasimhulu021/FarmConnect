package com.farmconnect.auth.service;

import com.farmconnect.auth.dto.CreateFarmerProfileRequest;
import com.farmconnect.auth.dto.CreateUserProfileRequest;
import com.farmconnect.auth.entity.Role;
import com.farmconnect.auth.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class ProfileProvisioningService {

    private final RestClient.Builder restClientBuilder;

    public ProfileProvisioningService(RestClient.Builder restClientBuilder) {
        this.restClientBuilder = restClientBuilder;
    }

    public void provisionProfile(User user) {
        if (user.getRole() == Role.FARMER) {
            restClientBuilder.build()
                    .post()
                    .uri("http://FARMER-SERVICE/internal/farmers")
                    .body(new CreateFarmerProfileRequest(
                            user.getId(),
                            user.getName(),
                            user.getEmail(),
                            user.getName() + "'s Farm"
                    ))
                    .retrieve()
                    .toBodilessEntity();
            return;
        }

        restClientBuilder.build()
                .post()
                .uri("http://USER-SERVICE/internal/users")
                .body(new CreateUserProfileRequest(user.getId(), user.getName(), user.getEmail()))
                .retrieve()
                .toBodilessEntity();
    }

    public void removeProfile(User user) {
        if (user.getRole() == Role.FARMER) {
            try {
                restClientBuilder.build()
                        .delete()
                        .uri("http://PRODUCT-SERVICE/internal/products/farmers/{id}", user.getId())
                        .retrieve()
                        .toBodilessEntity();
            } catch (RestClientException ex) {
                // Ignore if products are already absent.
            }

            try {
                restClientBuilder.build()
                        .delete()
                        .uri("http://FARMER-SERVICE/internal/farmers/{id}", user.getId())
                        .retrieve()
                        .toBodilessEntity();
            } catch (RestClientException ex) {
                // Ignore if farmer profile is already absent.
            }
            return;
        }

        if (user.getRole() == Role.USER) {
            try {
                restClientBuilder.build()
                        .delete()
                        .uri("http://USER-SERVICE/internal/users/{id}", user.getId())
                        .retrieve()
                        .toBodilessEntity();
            } catch (RestClientException ex) {
                // Ignore if user profile is already absent.
            }
        }
    }
}
