package com.pulselink.shared.auth;

import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.pulselink.shared.exception.ApiException;

@Component
public class CurrentUser {

    public UUID id(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UUID userId)) {
            throw ApiException.unauthorized("AUTHENTICATION_REQUIRED", "Authentication is required.");
        }
        return userId;
    }
}
