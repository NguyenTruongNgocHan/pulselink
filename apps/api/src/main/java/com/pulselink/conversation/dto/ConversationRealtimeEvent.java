package com.pulselink.conversation.dto;

import java.util.UUID;

public record ConversationRealtimeEvent(
        String type,
        UUID conversationId,
        MessageResponse message
) { }
