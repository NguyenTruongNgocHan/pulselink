package com.pulselink.notification.service;

import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pulselink.notification.dto.NotificationResponse;
import com.pulselink.notification.dto.NotificationsResponse;
import com.pulselink.notification.repository.NotificationRepository;
import com.pulselink.shared.exception.ApiException;
import com.pulselink.realtime.service.RealtimeEventPublisher;

@Service
public class NotificationService {

    private final NotificationRepository repository;
    private final RealtimeEventPublisher realtimeEvents;

    public NotificationService(
            NotificationRepository repository,
            RealtimeEventPublisher realtimeEvents
    ) {
        this.repository = repository;
        this.realtimeEvents = realtimeEvents;
    }

    @Transactional(readOnly = true)
    public NotificationsResponse list(UUID userId, boolean unreadOnly) {
        return new NotificationsResponse(
                repository.list(userId, unreadOnly),
                repository.unreadCount(userId),
                null
        );
    }

    @Transactional
    public NotificationResponse create(
            UUID userId,
            String type,
            String title,
            String body,
            Map<String, Object> payload
    ) {
        NotificationResponse notification = repository.create(
                userId,
                type,
                title,
                body,
                payload
        );
        realtimeEvents.publishNotification(userId, notification);
        return notification;
    }

    @Transactional
    public void markRead(UUID notificationId, UUID userId) {
        if (repository.markRead(notificationId, userId) == 0) {
            throw ApiException.notFound("NOTIFICATION_NOT_FOUND", "Notification was not found.");
        }
    }

    @Transactional
    public void markAllRead(UUID userId) {
        repository.markAllRead(userId);
    }
}
