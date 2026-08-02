package com.pulselink.search.dto;

import java.time.Instant;
import java.util.UUID;

public record MessageSearchResponse(
        UUID id,
        String content,
        Instant createdAt,
        Instant editedAt,
        String senderName,
        String senderUsername,
        UUID conversationId,
        String conversationName,
        String conversationType
) { }
