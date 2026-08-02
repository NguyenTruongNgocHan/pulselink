package com.pulselink.auth.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.pulselink.auth.domain.RefreshTokenRepository;
import com.pulselink.auth.domain.User;
import com.pulselink.auth.domain.UserRepository;

@Service
public class RefreshTokenIncidentService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    public RefreshTokenIncidentService(
            RefreshTokenRepository refreshTokenRepository,
            UserRepository userRepository
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void revokeCompromisedFamily(UUID familyId, UUID userId) {
        refreshTokenRepository.revokeFamily(familyId, Instant.now());
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            user.incrementTokenVersion();
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void revokeInvalidFamily(UUID familyId) {
        refreshTokenRepository.revokeFamily(familyId, Instant.now());
    }
}
