package com.pulselink.user.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pulselink.auth.domain.RefreshToken;
import com.pulselink.auth.domain.RefreshTokenRepository;
import com.pulselink.auth.domain.User;
import com.pulselink.auth.domain.UserRepository;
import com.pulselink.shared.exception.ApiException;
import com.pulselink.user.dto.ChangePasswordRequest;
import com.pulselink.user.dto.SecuritySessionResponse;

@Service
public class SecuritySessionService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public SecuritySessionService(
            RefreshTokenRepository refreshTokenRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<SecuritySessionResponse> sessions(UUID userId, UUID currentSessionId) {
        return refreshTokenRepository.findActiveSessions(userId, Instant.now()).stream()
                .map(token -> response(token, currentSessionId))
                .toList();
    }

    @Transactional
    public void revoke(UUID userId, UUID sessionId) {
        RefreshToken token = refreshTokenRepository.findById(sessionId)
                .filter(candidate -> candidate.getUser().getId().equals(userId))
                .orElseThrow(() -> ApiException.notFound(
                        "SESSION_NOT_FOUND",
                        "Session was not found."
                ));
        token.revoke();
    }

    @Transactional
    public void revokeOthers(UUID userId, UUID currentSessionId) {
        refreshTokenRepository.revokeOtherSessions(userId, currentSessionId, Instant.now());
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "User was not found."));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw ApiException.badRequest(
                    "CURRENT_PASSWORD_INCORRECT",
                    "The current password is incorrect."
            );
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw ApiException.badRequest(
                    "PASSWORD_UNCHANGED",
                    "Choose a password different from the current password."
            );
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.incrementTokenVersion();
        refreshTokenRepository.revokeAllForUser(userId, Instant.now());
    }

    private SecuritySessionResponse response(RefreshToken token, UUID currentSessionId) {
        return new SecuritySessionResponse(
                token.getId(),
                token.getDeviceName(),
                token.getBrowser(),
                token.getOperatingSystem(),
                token.getIpAddress(),
                token.getLocation(),
                token.getId().equals(currentSessionId),
                token.getCreatedAt(),
                token.getLastUsedAt(),
                token.getExpiresAt()
        );
    }
}
