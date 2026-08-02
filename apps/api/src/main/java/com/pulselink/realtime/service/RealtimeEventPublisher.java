package com.pulselink.realtime.service;

import java.util.Map;
import java.util.UUID;

import com.pulselink.conversation.dto.ConversationRealtimeEvent;
import com.pulselink.notification.dto.NotificationResponse;

/**
 * Application-facing realtime port.
 *
 * Domain services publish committed business events through this interface and
 * remain independent from STOMP/WebSocket infrastructure.
 */
public interface RealtimeEventPublisher {

    void publishConversation(UUID conversationId, ConversationRealtimeEvent event);

    void publishGroup(UUID groupId, Map<String, Object> payload);

    void publishNotification(UUID userId, NotificationResponse notification);
}
