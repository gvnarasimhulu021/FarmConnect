package com.farmconnect.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long accessExpirationMillis;
    private final long refreshExpirationMillis;

    public JwtService(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.access-expiration-ms}") long accessExpirationMillis,
            @Value("${security.jwt.refresh-expiration-ms}") long refreshExpirationMillis
    ) {
        this.signingKey = Keys.hmacShaKeyFor(resolveSecret(secret));
        this.accessExpirationMillis = accessExpirationMillis;
        this.refreshExpirationMillis = refreshExpirationMillis;
    }

    public String generateToken(String email, Long userId, String role) {
        return generateAccessToken(email, userId, role);
    }

    public String generateAccessToken(String email, Long userId, String role) {
        return generateToken(email, userId, role, "ACCESS", accessExpirationMillis);
    }

    public String generateRefreshToken(String email, Long userId, String role) {
        return generateToken(email, userId, role, "REFRESH", refreshExpirationMillis);
    }

    public long getAccessExpirationMillis() {
        return accessExpirationMillis;
    }

    private String generateToken(String email, Long userId, String role, String tokenType, long expirationMillis) {
        Map<String, Object> claims = new HashMap<>();
        if (userId != null) {
            claims.put("userId", userId);
        }
        if (role != null && !role.isBlank()) {
            claims.put("role", role);
        }
        claims.put("tokenType", tokenType);
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMillis))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(userDetails.getUsername(), null, null);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username != null
                && username.equals(userDetails.getUsername())
                && !isTokenExpired(token)
                && isTokenType(token, "ACCESS");
    }

    public boolean isRefreshTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username != null
                && username.equals(userDetails.getUsername())
                && !isTokenExpired(token)
                && isTokenType(token, "REFRESH");
    }

    private boolean isTokenExpired(String token) {
        Date expiration = extractClaim(token, Claims::getExpiration);
        return expiration.before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(extractAllClaims(token));
    }

    private boolean isTokenType(String token, String expectedTokenType) {
        String tokenType = extractClaim(token, claims -> claims.get("tokenType", String.class));
        return expectedTokenType.equalsIgnoreCase(tokenType);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
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
