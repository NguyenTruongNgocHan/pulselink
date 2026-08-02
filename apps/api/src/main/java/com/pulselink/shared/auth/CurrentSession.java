package com.pulselink.shared.auth;

import java.util.UUID;

import org.springframework.stereotype.Component;

import com.pulselink.auth.security.JwtService;
import com.pulselink.shared.exception.ApiException;

import jakarta.servlet.http.HttpServletRequest;

@Component
public class CurrentSession {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;

    public CurrentSession(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    public UUID id(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            throw ApiException.unauthorized("AUTHENTICATION_REQUIRED", "Authentication is required.");
        }
        return jwtService.parse(header.substring(BEARER_PREFIX.length()))
                .map(JwtService.AccessTokenClaims::sessionId)
                .orElseThrow(() -> ApiException.unauthorized(
                        "INVALID_ACCESS_TOKEN",
                        "The access token is invalid or expired."
                ));
    }
}
