package com.farmconnect.auth.controller;

import com.farmconnect.auth.dto.UserEmailResponse;
import com.farmconnect.auth.service.AuthService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/users")
public class InternalUserController {

    private final AuthService authService;

    public InternalUserController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/{id}/email")
    public UserEmailResponse getUserEmail(@PathVariable("id") Long id) {
        return authService.getUserEmailById(id);
    }
}
