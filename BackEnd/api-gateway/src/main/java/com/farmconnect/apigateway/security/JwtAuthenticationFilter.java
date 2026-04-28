package com.farmconnect.apigateway.security;

import java.util.List;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private static final List<String> PUBLIC_ENDPOINTS = List.of("/api/auth/login", "/api/auth/register", "/api/auth/stats");
    private static final List<String> PUBLIC_GET_ENDPOINTS = List.of(
            "/api/products",
            "/api/products/**",
            "/api/farmers",
            "/api/farmers/**",
            "/api/upload/files/**"
    );

    private final JwtTokenService jwtTokenService;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public JwtAuthenticationFilter(JwtTokenService jwtTokenService) {
        this.jwtTokenService = jwtTokenService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        if (isPublicEndpoint(exchange.getRequest().getMethod(), path)) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange, "Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        if (!jwtTokenService.isValid(token)) {
            return unauthorized(exchange, "Invalid or expired JWT token");
        }

        String subject = jwtTokenService.extractSubject(token);
        Long userId = jwtTokenService.extractUserId(token);
        String role = jwtTokenService.extractRole(token);
        ServerHttpRequest mutatedRequest = exchange.getRequest()
                .mutate()
                .header("X-Authenticated-User", subject)
                .header("X-Authenticated-User-Id", userId == null ? "" : String.valueOf(userId))
                .header("X-Authenticated-Role", role == null ? "" : role)
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    @Override
    public int getOrder() {
        return -1;
    }

    private boolean isPublicEndpoint(HttpMethod method, String path) {
        if (PUBLIC_ENDPOINTS.stream().anyMatch(pattern -> pathMatcher.match(pattern, path))) {
            return true;
        }

        return HttpMethod.GET.equals(method)
                && PUBLIC_GET_ENDPOINTS.stream().anyMatch(pattern -> pathMatcher.match(pattern, path));
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().add("X-Error-Message", message);
        return exchange.getResponse().setComplete();
    }
}
