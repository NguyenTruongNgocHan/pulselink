package com.pulselink.report.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateReportRequest(
        @NotBlank @Pattern(regexp = "USER|MESSAGE|GROUP") String targetType,
        UUID targetUserId,
        UUID targetMessageId,
        UUID targetConversationId,
        @NotBlank @Size(max = 80) String reason,
        @Size(max = 2000) String description
) { }
