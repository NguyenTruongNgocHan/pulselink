package com.pulselink.conversation.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ConversationResponse(
        UUID id,
        String type,
        String name,
        String avatarUrl,
        String status,
        String preview,
        Instant latestMessageAt,
        long unreadCount,
        long memberCount,
        List<ConversationParticipantResponse> participants
) { }
