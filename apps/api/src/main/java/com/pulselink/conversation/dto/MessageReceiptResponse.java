package com.pulselink.conversation.dto;

import java.time.Instant;
import java.util.UUID;

public record MessageReceiptResponse(
        UUID userId,
        String displayName,
        Instant seenAt
) { }
