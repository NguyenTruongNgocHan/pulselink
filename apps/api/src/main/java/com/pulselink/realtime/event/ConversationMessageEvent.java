package com.pulselink.realtime.event;

import java.util.UUID;

import com.pulselink.conversation.dto.ConversationRealtimeEvent;

public record ConversationMessageEvent(
        UUID conversationId,
        ConversationRealtimeEvent payload
) { }
