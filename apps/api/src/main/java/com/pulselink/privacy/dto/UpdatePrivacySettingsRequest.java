package com.pulselink.privacy.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record UpdatePrivacySettingsRequest(
        @NotNull Boolean discoverable,
        @NotNull Boolean allowFriendRequests,
        @NotNull Boolean allowDirectMessages,
        @NotNull Boolean sendReadReceipts,
        @NotNull Boolean showTypingIndicators,
        @NotNull @Pattern(regexp = "EVERYONE|FRIENDS|NOBODY") String profileVisibility,
        @NotNull Boolean showOnlineStatus,
        @NotNull Boolean showLastActive
) { }
