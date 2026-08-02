package com.pulselink.auth.web;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pulselink.auth.dto.AuthResponse;
import com.pulselink.auth.dto.LoginRequest;
import com.pulselink.auth.dto.RefreshRequest;
import com.pulselink.auth.dto.RegisterRequest;
import com.pulselink.auth.dto.UpdateProfileRequest;
import com.pulselink.auth.dto.UserResponse;
import com.pulselink.auth.service.AuthService;
import com.pulselink.auth.session.SessionMetadataResolver;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;
    private final SessionMetadataResolver metadataResolver;

    public AuthController(AuthService authService, SessionMetadataResolver metadataResolver) {
        this.authService = authService;
        this.metadataResolver = metadataResolver;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a PulseLink account")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.register(request, metadataResolver.resolve(servletRequest)));
    }

    @PostMapping("/login")
    @Operation(summary = "Create an authenticated session")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest
    ) {
        return authService.login(request, metadataResolver.resolve(servletRequest));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotate a refresh token and renew the session")
    public AuthResponse refresh(
            @Valid @RequestBody RefreshRequest request,
            HttpServletRequest servletRequest
    ) {
        return authService.refresh(request.refreshToken(), metadataResolver.resolve(servletRequest));
    }

    @DeleteMapping("/logout")
    @Operation(summary = "Revoke the presented refresh token")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshRequest request) {
        authService.logout(request.refreshToken());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal UUID userId) {
        return authService.getProfile(userId);
    }

    @PatchMapping("/me")
    public UserResponse updateMe(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return authService.updateProfile(userId, request);
    }
}
