package com.pulselink.user.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pulselink.shared.exception.ApiException;
import com.pulselink.user.dto.ProfileResponse;
import com.pulselink.user.dto.UpdateProfileRequest;
import com.pulselink.user.repository.ProfileRepository;
import com.pulselink.user.repository.ProfileRepository.ProfileRow;

@Service
public class ProfileService {

    private final ProfileRepository repository;

    public ProfileService(ProfileRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public ProfileResponse get(UUID userId) {
        ProfileRow row = repository.profile(userId)
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "User was not found."));
        return new ProfileResponse(
                row.id(),
                row.username(),
                row.email(),
                row.displayName(),
                row.bio() == null ? "" : row.bio(),
                avatarUrl(row.avatarObjectKey()),
                row.role(),
                row.status(),
                row.createdAt(),
                repository.stats(userId),
                repository.recentMedia(userId),
                repository.groups(userId)
        );
    }

    @Transactional
    public ProfileResponse update(UUID userId, UpdateProfileRequest request) {
        repository.update(userId, request.displayName().trim(), normalizeBio(request.bio()));
        return get(userId);
    }

    @Transactional
    public void deactivate(UUID userId, String reason) {
        repository.deactivate(userId, reason.trim());
    }

    private String normalizeBio(String bio) {
        if (bio == null || bio.isBlank()) {
            return null;
        }
        return bio.trim();
    }

    private String avatarUrl(String objectKey) {
        return objectKey == null ? null : "/api/v1/files/avatar/" + objectKey;
    }
}
