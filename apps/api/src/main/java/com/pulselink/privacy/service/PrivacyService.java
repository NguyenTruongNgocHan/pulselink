package com.pulselink.privacy.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pulselink.privacy.dto.PrivacySettingsResponse;
import com.pulselink.privacy.dto.UpdatePrivacySettingsRequest;
import com.pulselink.privacy.repository.PrivacyRepository;
import com.pulselink.shared.exception.ApiException;

@Service
public class PrivacyService {

    private final PrivacyRepository repository;

    public PrivacyService(PrivacyRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public PrivacySettingsResponse get(UUID userId) {
        return repository.find(userId)
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "User was not found."));
    }

    @Transactional
    public PrivacySettingsResponse update(UUID userId, UpdatePrivacySettingsRequest request) {
        repository.update(userId, request);
        return get(userId);
    }
}
