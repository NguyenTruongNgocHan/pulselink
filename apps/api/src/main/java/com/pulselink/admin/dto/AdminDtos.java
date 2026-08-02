package com.pulselink.admin.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AdminDtos {

    private AdminDtos() { }

    public record AuditEntry(
            UUID id,
            String action,
            String actorUsername,
            String actorRole,
            String targetType,
            UUID targetId,
            String reason,
            Map<String, Object> metadata,
            Instant createdAt
    ) { }

    public record TrendPoint(String date, long count) { }

    public record Dashboard(
            long users,
            long activeUsers,
            long conversations,
            long messages,
            long openReports,
            long inReviewReports,
            long suspendedUsers,
            long bannedUsers,
            List<AuditEntry> recentActions,
            List<TrendPoint> reportTrend
    ) { }

    public record UserSummary(
            UUID id,
            String username,
            String email,
            String displayName,
            String avatarUrl,
            String role,
            String status,
            Instant suspendedUntil,
            Instant createdAt
    ) { }

    public record UserDetails(
            UUID id,
            String username,
            String email,
            String displayName,
            String avatarUrl,
            String role,
            String status,
            Instant suspendedUntil,
            Instant createdAt,
            String bio,
            boolean emailVerified,
            long reportCount,
            long sessionCount,
            List<AuditEntry> moderationHistory
    ) { }

    public record ReportSummary(
            UUID id,
            String targetType,
            String targetLabel,
            String reason,
            String description,
            String status,
            String outcome,
            Instant createdAt,
            Instant updatedAt,
            String reporterUsername,
            UUID assigneeId,
            String assigneeUsername
    ) { }

    public record ReportComment(
            UUID id,
            String authorUsername,
            String visibility,
            String body,
            Instant createdAt
    ) { }

    public record ReportDetails(
            UUID id,
            String targetType,
            String targetLabel,
            String reason,
            String description,
            String status,
            String outcome,
            Instant createdAt,
            Instant updatedAt,
            String reporterUsername,
            UUID assigneeId,
            String assigneeUsername,
            UUID reporterId,
            UUID targetUserId,
            UUID targetMessageId,
            UUID targetConversationId,
            String resolutionSummary,
            boolean evidenceAvailable,
            List<ReportComment> comments
    ) { }

    public record NearbyMessage(UUID id, String author, String content, Instant createdAt) { }

    public record ReportEvidence(
            Instant capturedAt,
            String targetType,
            Map<String, Object> snapshot,
            List<NearbyMessage> nearbyMessages
    ) { }

    public record GroupSummary(
            UUID id,
            String name,
            String status,
            long memberCount,
            Instant createdAt,
            String adminUsername
    ) { }

    public record ActionRequest(
            @NotBlank @Size(min = 3, max = 500) String reason,
            Instant until
    ) { }

    public record RoleRequest(
            @NotBlank String role,
            @NotBlank @Size(min = 3, max = 500) String reason
    ) { }

    public record DecisionRequest(
            String outcome,
            @NotBlank @Size(min = 3, max = 1000) String reason
    ) { }
}
