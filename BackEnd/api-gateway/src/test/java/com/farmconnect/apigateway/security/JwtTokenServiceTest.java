package com.farmconnect.apigateway.security;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class JwtTokenServiceTest {

    @Test
    void acceptsPlainTextSecrets() {
        assertDoesNotThrow(() -> new JwtTokenService("change-me-to-a-plain-text-secret-with-at-least-32-bytes"));
    }

    @Test
    void acceptsBase64Secrets() {
        assertDoesNotThrow(() -> new JwtTokenService("MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY="));
    }

    @Test
    void rejectsMalformedBase64LookingSecrets() {
        assertThrows(RuntimeException.class, () -> new JwtTokenService("MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY*"));
    }
}
