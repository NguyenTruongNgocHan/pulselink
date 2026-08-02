package com.pulselink.friend.dto;

import java.util.UUID;

public record PersonResponse(
        UUID id,
        String username,
        String displayName,
        String avatarUrl,
        String bio,
        boolean isOnline,
        String relationshipStatus
) { }
