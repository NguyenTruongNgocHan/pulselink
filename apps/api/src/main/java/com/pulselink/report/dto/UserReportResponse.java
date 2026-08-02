package com.pulselink.report.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record UserReportResponse(
        UUID id,
        String targetType,
        String targetLabel,
        String reason,
        String description,
        String status,
        String outcome,
        String resolutionSummary,
        Instant createdAt,
        Instant updatedAt,
        List<Clarification> clarifications
) {
    public record Clarification(UUID id, String body, Instant createdAt) { }
}
