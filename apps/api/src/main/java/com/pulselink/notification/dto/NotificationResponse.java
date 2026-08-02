package com.pulselink.notification.dto;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        String type,
        String title,
        String body,
        Map<String, Object> payload,
        Instant readAt,
        Instant createdAt
) { }
