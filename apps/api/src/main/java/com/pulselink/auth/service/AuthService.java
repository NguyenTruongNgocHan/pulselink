package com.pulselink.auth.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pulselink.auth.domain.RefreshToken;
import com.pulselink.auth.domain.RefreshToken.SessionMetadata;
import com.pulselink.auth.domain.RefreshTokenRepository;
import com.pulselink.auth.domain.User;
import com.pulselink.auth.domain.UserRepository;
import com.pulselink.auth.dto.AuthResponse;
import com.pulselink.auth.dto.LoginRequest;
import com.pulselink.auth.dto.RegisterRequest;
import com.pulselink.auth.dto.UpdateProfileRequest;
import com.pulselink.auth.dto.UserResponse;
import com.pulselink.auth.security.JwtProperties;
import com.pulselink.auth.security.JwtService;
import com.pulselink.shared.exception.ApiException;

@Service
public class AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenIncidentService refreshTokenIncidentService;
    private final long refreshTokenTtlDays;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            RefreshTokenIncidentService refreshTokenIncidentService,
            JwtProperties jwtProperties
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenIncidentService = refreshTokenIncidentService;
        this.refreshTokenTtlDays = jwtProperties.refreshTokenTtlDays();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request, SessionMetadata metadata) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw ApiException.conflict("EMAIL_TAKEN", "An account with this email already exists.");
        }
        if (userRepository.existsByUsernameIgnoreCase(request.username())) {
            throw ApiException.conflict("USERNAME_TAKEN", "This username is already taken.");
        }

        String displayName = request.displayName() == null || request.displayName().isBlank()
                ? request.username()
                : request.displayName().trim();
        User user = new User(
                request.username().trim(),
                request.email().trim().toLowerCase(),
                passwordEncoder.encode(request.password()),
                displayName
        );
        userRepository.save(user);
        return issueSession(user, metadata, null);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, SessionMetadata metadata) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new BadCredentialsException("invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("invalid credentials");
        }

        if (user.getStatus() == User.Status.SUSPENDED
                && user.getSuspendedUntil() != null
                && user.getSuspendedUntil().isBefore(Instant.now())) {
            user.setStatus(User.Status.ACTIVE);
        }
        if (user.getStatus() != User.Status.ACTIVE) {
            throw ApiException.unauthorized("ACCOUNT_UNAVAILABLE", "This account is not currently active.");
        }

        return issueSession(user, metadata, null);
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken, SessionMetadata metadata) {
        RefreshToken existing = refreshTokenRepository.findByTokenHash(hash(rawRefreshToken))
                .orElseThrow(() -> ApiException.unauthorized(
                        "INVALID_REFRESH_TOKEN",
                        "Refresh token is invalid."
                ));

        Instant now = Instant.now();
        if (existing.isRevoked()) {
            refreshTokenIncidentService.revokeCompromisedFamily(
                    existing.getFamilyId(),
                    existing.getUser().getId()
            );
            throw ApiException.unauthorized(
                    "REFRESH_TOKEN_REUSE_DETECTED",
                    "This refresh token was already used. The entire session family was revoked."
            );
        }
        if (!existing.isUsable(now)) {
            refreshTokenIncidentService.revokeInvalidFamily(existing.getFamilyId());
            throw ApiException.unauthorized(
                    "INVALID_REFRESH_TOKEN",
                    "Refresh token is expired or belongs to an invalidated session."
            );
        }

        existing.revoke();
        refreshTokenRepository.save(existing);
        return issueSession(existing.getUser(), metadata, existing.getFamilyId());
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        refreshTokenRepository.findByTokenHash(hash(rawRefreshToken)).ifPresent(token -> {
            token.revoke();
            refreshTokenRepository.save(token);
        });
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(UUID userId) {
        return UserResponse.from(findUserOrThrow(userId));
    }

    @Transactional
    public UserResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = findUserOrThrow(userId);
        if (request.displayName() != null && !request.displayName().isBlank()) {
            user.setDisplayName(request.displayName().trim());
        }
        return UserResponse.from(user);
    }

    private User findUserOrThrow(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "User not found."));
    }

    private AuthResponse issueSession(User user, SessionMetadata metadata, UUID familyId) {
        String rawRefreshToken = generateOpaqueToken();
        RefreshToken refreshToken = new RefreshToken(
                user,
                hash(rawRefreshToken),
                Instant.now().plus(Duration.ofDays(refreshTokenTtlDays)),
                familyId,
                metadata
        );
        refreshTokenRepository.save(refreshToken);
        String accessToken = jwtService.issueAccessToken(user, refreshToken.getId());

        return new AuthResponse(
                accessToken,
                rawRefreshToken,
                jwtService.accessTokenTtlSeconds(),
                UserResponse.from(user)
        );
    }

    private static String generateOpaqueToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public static String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashed);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 not available", ex);
        }
    }
}
