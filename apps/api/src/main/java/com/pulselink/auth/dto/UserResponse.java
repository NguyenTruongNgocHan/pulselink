package com.pulselink.auth.dto;

import java.util.UUID;

import com.pulselink.auth.domain.User;

public record UserResponse(
        UUID id,
        String username,
        String email,
        String displayName,
        String avatarUrl,
        String role,
        String status
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getDisplayName(),
                avatarUrl(user.getAvatarObjectKey()),
                user.getRole().name(),
                user.getStatus().name()
        );
    }

    private static String avatarUrl(String objectKey) {
        return objectKey == null ? null : "/api/v1/files/avatar/" + objectKey;
    }
}
