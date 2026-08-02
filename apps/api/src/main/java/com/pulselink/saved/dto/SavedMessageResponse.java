package com.pulselink.saved.dto;

import java.time.Instant;
import java.util.UUID;

public record SavedMessageResponse(
        UUID id,
        String content,
        Instant createdAt,
        String senderName,
        String senderUsername,
        UUID conversationId,
        String conversationName,
        String conversationType
) { }
