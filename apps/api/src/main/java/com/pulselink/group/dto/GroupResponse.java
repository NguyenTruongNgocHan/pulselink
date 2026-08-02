package com.pulselink.group.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.pulselink.conversation.dto.ConversationParticipantResponse;

public record GroupResponse(
        UUID id,
        String name,
        String avatarUrl,
        String status,
        Instant createdAt,
        UUID createdBy,
        List<ConversationParticipantResponse> members,
        String currentUserRole
) { }
