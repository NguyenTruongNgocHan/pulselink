package com.pulselink.realtime.event;

import java.util.UUID;

import com.pulselink.notification.dto.NotificationResponse;

public record UserNotificationEvent(
        UUID userId,
        NotificationResponse notification
) { }
