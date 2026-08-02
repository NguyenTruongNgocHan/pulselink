package com.pulselink.realtime.service;

import java.util.Map;
import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import com.pulselink.conversation.dto.ConversationRealtimeEvent;
import com.pulselink.notification.dto.NotificationResponse;
import com.pulselink.realtime.event.ConversationMessageEvent;
import com.pulselink.realtime.event.GroupRealtimeEvent;
import com.pulselink.realtime.event.UserNotificationEvent;
import com.pulselink.shared.transaction.AfterCommitExecutor;

@Component
public class ApplicationRealtimeEventPublisher implements RealtimeEventPublisher {

    private final ApplicationEventPublisher applicationEvents;
    private final AfterCommitExecutor afterCommit;

    public ApplicationRealtimeEventPublisher(
            ApplicationEventPublisher applicationEvents,
            AfterCommitExecutor afterCommit
    ) {
        this.applicationEvents = applicationEvents;
        this.afterCommit = afterCommit;
    }

    @Override
    public void publishConversation(UUID conversationId, ConversationRealtimeEvent event) {
        afterCommit.run(() -> applicationEvents.publishEvent(
                new ConversationMessageEvent(conversationId, event)
        ));
    }

    @Override
    public void publishGroup(UUID groupId, Map<String, Object> payload) {
        Map<String, Object> immutablePayload = Map.copyOf(payload);
        afterCommit.run(() -> applicationEvents.publishEvent(
                new GroupRealtimeEvent(groupId, immutablePayload)
        ));
    }

    @Override
    public void publishNotification(UUID userId, NotificationResponse notification) {
        afterCommit.run(() -> applicationEvents.publishEvent(
                new UserNotificationEvent(userId, notification)
        ));
    }
}
