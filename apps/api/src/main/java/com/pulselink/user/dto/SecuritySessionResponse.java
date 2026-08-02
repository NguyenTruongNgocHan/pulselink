package com.pulselink.user.dto;

import java.time.Instant;
import java.util.UUID;

public record SecuritySessionResponse(
        UUID id,
        String deviceName,
        String browser,
        String operatingSystem,
        String ipAddress,
        String location,
        boolean current,
        Instant createdAt,
        Instant lastUsedAt,
        Instant expiresAt
) { }
