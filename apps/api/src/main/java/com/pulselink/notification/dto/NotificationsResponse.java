package com.pulselink.notification.dto;

import java.util.List;

public record NotificationsResponse(
        List<NotificationResponse> items,
        long unreadCount,
        String nextCursor
) { }
