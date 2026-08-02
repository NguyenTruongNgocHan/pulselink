package com.pulselink.friend.dto;

import java.time.Instant;
import java.util.UUID;

public record FriendRequestResponse(
        UUID id,
        String username,
        String displayName,
        String avatarUrl,
        Instant requestedAt
) { }
