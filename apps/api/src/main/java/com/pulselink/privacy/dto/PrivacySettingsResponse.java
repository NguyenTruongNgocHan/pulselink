package com.pulselink.privacy.dto;

public record PrivacySettingsResponse(
        boolean discoverable,
        boolean allowFriendRequests,
        boolean allowDirectMessages,
        boolean sendReadReceipts,
        boolean showTypingIndicators,
        String profileVisibility,
        boolean showOnlineStatus,
        boolean showLastActive
) { }
