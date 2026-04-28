package com.farmconnect.apigateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtTokenService {

    private final SecretKey signingKey;

    public JwtTokenService(@Value("${security.jwt.secret}") String secret) {
        this.signingKey = Keys.hmacShaKeyFor(resolveSecret(secret));
    }

    public boolean isValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (RuntimeException ex) {
            return false;
        }
    }

    public String extractSubject(String token) {
        return parseClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        Object claim = parseClaims(token).get("userId");
        if (claim instanceof Number number) {
            return number.longValue();
        }
        if (claim instanceof String value && !value.isBlank()) {
            return Long.parseLong(value);
        }
        return null;
    }

    public String extractRole(String token) {
        Object claim = parseClaims(token).get("role");
        return claim == null ? null : claim.toString();
    }

    public boolean isAccessToken(String token) {
        String tokenType = parseClaims(token).get("tokenType", String.class);
        if (tokenType == null || tokenType.isBlank()) {
            return true;
        }
        return "ACCESS".equalsIgnoreCase(tokenType);
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private byte[] resolveSecret(String secret) {
        String normalizedSecret = secret.trim();
        try {
            return Decoders.BASE64.decode(normalizedSecret);
        } catch (RuntimeException ex) {
            if (looksLikeBase64(normalizedSecret)) {
                throw ex;
            }
            return normalizedSecret.getBytes(StandardCharsets.UTF_8);
        }
    }

    private boolean looksLikeBase64(String secret) {
        if (secret.length() % 4 != 0) {
            return false;
        }

        try {
            Base64.getDecoder().decode(secret);
            return true;
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }
}
