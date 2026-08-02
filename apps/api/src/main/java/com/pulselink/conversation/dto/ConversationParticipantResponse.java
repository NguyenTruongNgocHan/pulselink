package com.pulselink.conversation.dto;

import java.util.UUID;

public record ConversationParticipantResponse(
        UUID id,
        String username,
        String displayName,
        String avatarUrl,
        String role,
        boolean isOnline
) { }
