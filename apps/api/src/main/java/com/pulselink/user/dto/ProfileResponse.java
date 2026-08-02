package com.pulselink.user.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ProfileResponse(
        UUID id,
        String username,
        String email,
        String displayName,
        String bio,
        String avatarUrl,
        String role,
        String status,
        Instant createdAt,
        Stats stats,
        List<Media> recentMedia,
        List<Group> groups
) {
    public record Stats(long messageCount, long groupCount, long connectionCount, long reportCount) { }
    public record Media(UUID id, String fileName, String mimeType, String url) { }
    public record Group(UUID id, String name) { }
}
