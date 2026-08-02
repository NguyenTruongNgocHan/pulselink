package com.pulselink.admin.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pulselink.admin.dto.AdminDtos.DecisionRequest;
import com.pulselink.admin.dto.AdminDtos.ReportDetails;
import com.pulselink.admin.dto.AdminDtos.ReportEvidence;
import com.pulselink.admin.dto.AdminDtos.ReportSummary;
import com.pulselink.admin.repository.AdminRepository;
import com.pulselink.admin.repository.AdminRepository.EvidenceRow;
import com.pulselink.notification.service.NotificationService;
import com.pulselink.shared.dto.PageResponse;
import com.pulselink.shared.exception.ApiException;

@Service
public class AdminReportService {

    private static final Set<String> REPORT_STATUSES = Set.of(
            "OPEN", "IN_REVIEW", "RESOLVED", "REJECTED"
    );
    private static final Set<String> OUTCOMES = Set.of(
            "NO_ACTION",
            "WARNING_ISSUED",
            "CONTENT_REMOVED",
            "USER_SUSPENDED",
            "USER_BANNED",
            "GROUP_CLOSED"
    );

    private final AdminRepository repository;
    private final NotificationService notifications;
    private final StaffAuthorizationService authorization;
    private final AdminAuditService audit;

    public AdminReportService(
            AdminRepository repository,
            NotificationService notifications,
            StaffAuthorizationService authorization,
            AdminAuditService audit
    ) {
        this.repository = repository;
        this.notifications = notifications;
        this.authorization = authorization;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public PageResponse<ReportSummary> list(
            UUID actorId,
            String query,
            String status,
            int page,
            int size
    ) {
        authorization.requireStaff(actorId);
        String normalizedStatus = optionalStatus(status);
        int safePage = Math.max(0, page);
        int safeSize = Math.min(100, Math.max(1, size));
        return PageResponse.of(
                repository.reports(query, normalizedStatus, safePage * safeSize, safeSize),
                safePage,
                safeSize,
                repository.reportsCount(query, normalizedStatus)
        );
    }

    @Transactional(readOnly = true)
    public ReportDetails get(UUID actorId, UUID reportId) {
        authorization.requireStaff(actorId);
        return find(reportId);
    }

    @Transactional
    public ReportDetails claim(UUID actorId, UUID reportId) {
        authorization.requireStaff(actorId);
        ReportDetails report = find(reportId);
        if (!"OPEN".equals(report.status())) {
            throw ApiException.conflict(
                    "REPORT_ALREADY_CLAIMED",
                    "Only an open report can be claimed."
            );
        }
        if (repository.claimReport(reportId, actorId) != 1) {
            throw ApiException.conflict(
                    "REPORT_CLAIM_CONFLICT",
                    "Another moderator claimed this report first."
            );
        }
        audit.record(actorId, "REPORT_CLAIMED", "REPORT", reportId, "Report claimed for review.", Map.of());
        return find(reportId);
    }

    @Transactional
    public ReportEvidence evidence(UUID actorId, UUID reportId) {
        authorization.requireStaff(actorId);
        find(reportId);
        EvidenceRow row = repository.evidence(reportId)
                .orElseThrow(() -> ApiException.notFound(
                        "REPORT_EVIDENCE_NOT_FOUND",
                        "No immutable evidence snapshot is available for this report."
                ));
        audit.record(
                actorId,
                "REPORT_EVIDENCE_VIEWED",
                "REPORT",
                reportId,
                "Evidence viewed during moderation.",
                Map.of("capturedAt", row.capturedAt().toString())
        );
        return new ReportEvidence(
                row.capturedAt(),
                row.targetType(),
                row.snapshot(),
                repository.nearbyMessages(row.targetMessageId(), row.targetConversationId())
        );
    }

    @Transactional
    public ReportDetails resolve(UUID actorId, UUID reportId, DecisionRequest request) {
        authorization.requireStaff(actorId);
        ReportDetails report = find(reportId);
        requireOwnedReview(actorId, report);
        String outcome = normalizeOutcome(request == null ? null : request.outcome());
        String reason = requireReason(request == null ? null : request.reason());

        applyOutcome(actorId, report, outcome, reason);
        if (repository.resolveReport(reportId, actorId, outcome, reason) != 1) {
            throw ApiException.conflict(
                    "REPORT_RESOLUTION_CONFLICT",
                    "The report changed while it was being reviewed."
            );
        }

        notifications.create(
                report.reporterId(),
                "REPORT_RESOLVED",
                "Your report was resolved",
                "A moderator reviewed your report. Outcome: " + humanize(outcome) + ".",
                Map.of("reportId", reportId.toString())
        );
        audit.record(
                actorId,
                "REPORT_RESOLVED",
                "REPORT",
                reportId,
                reason,
                Map.of("outcome", outcome)
        );
        return find(reportId);
    }

    @Transactional
    public ReportDetails reject(UUID actorId, UUID reportId, DecisionRequest request) {
        authorization.requireStaff(actorId);
        ReportDetails report = find(reportId);
        requireOwnedReview(actorId, report);
        String reason = requireReason(request == null ? null : request.reason());
        if (repository.rejectReport(reportId, actorId, reason) != 1) {
            throw ApiException.conflict(
                    "REPORT_REJECTION_CONFLICT",
                    "The report changed while it was being reviewed."
            );
        }
        notifications.create(
                report.reporterId(),
                "REPORT_REJECTED",
                "Your report was reviewed",
                "A moderator reviewed the report and did not take enforcement action.",
                Map.of("reportId", reportId.toString())
        );
        audit.record(actorId, "REPORT_REJECTED", "REPORT", reportId, reason, Map.of());
        return find(reportId);
    }

    private void applyOutcome(
            UUID actorId,
            ReportDetails report,
            String outcome,
            String reason
    ) {
        switch (outcome) {
            case "NO_ACTION" -> {
                // The decision is still preserved in the report and audit log.
            }
            case "WARNING_ISSUED" -> {
                UUID targetUserId = requireTargetUser(report);
                notifications.create(
                        targetUserId,
                        "MODERATION_WARNING",
                        "A moderation warning was issued",
                        reason,
                        Map.of("reportId", report.id().toString())
                );
            }
            case "CONTENT_REMOVED" -> {
                if (report.targetMessageId() == null) {
                    throw invalidOutcome("Content removal requires a message report.");
                }
                if (repository.moderateMessage(report.targetMessageId(), actorId, reason) != 1) {
                    throw ApiException.conflict(
                            "MESSAGE_ALREADY_MODERATED",
                            "The reported message was already removed or no longer exists."
                    );
                }
                repository.removeModeratedMessageArtifacts(report.targetMessageId());
            }
            case "USER_SUSPENDED" -> {
                UUID targetUserId = requireTargetUser(report);
                authorization.requireCanManageUser(actorId, targetUserId);
                Instant until = Instant.now().plus(7, ChronoUnit.DAYS);
                repository.suspendTarget(targetUserId, until);
                notifications.create(
                        targetUserId,
                        "ACCOUNT_SUSPENDED",
                        "Your account was suspended",
                        reason,
                        Map.of("until", until.toString())
                );
            }
            case "USER_BANNED" -> {
                authorization.requireRole(actorId, "ADMIN");
                UUID targetUserId = requireTargetUser(report);
                authorization.requireCanManageUser(actorId, targetUserId);
                repository.banTarget(targetUserId);
            }
            case "GROUP_CLOSED" -> {
                if (report.targetConversationId() == null || !"GROUP".equals(report.targetType())) {
                    throw invalidOutcome("Closing a group requires a group report.");
                }
                if (repository.closeGroup(report.targetConversationId()) != 1) {
                    throw ApiException.conflict(
                            "GROUP_ALREADY_CLOSED",
                            "The reported group is already closed or no longer exists."
                    );
                }
            }
            default -> throw invalidOutcome("The selected moderation outcome is not supported.");
        }
    }

    private ReportDetails find(UUID reportId) {
        return repository.reportDetails(reportId)
                .orElseThrow(() -> ApiException.notFound("REPORT_NOT_FOUND", "Report was not found."));
    }

    private static void requireOwnedReview(UUID actorId, ReportDetails report) {
        if (!"IN_REVIEW".equals(report.status())) {
            throw ApiException.conflict(
                    "REPORT_NOT_IN_REVIEW",
                    "Claim the report before making a decision."
            );
        }
        if (report.assigneeId() != null && !report.assigneeId().equals(actorId)) {
            throw ApiException.forbidden(
                    "REPORT_ASSIGNED_TO_ANOTHER_MODERATOR",
                    "This report is assigned to another moderator."
            );
        }
    }

    private UUID requireTargetUser(ReportDetails report) {
        if (report.targetUserId() != null) {
            return report.targetUserId();
        }
        if (report.targetMessageId() != null) {
            return repository.messageSender(report.targetMessageId())
                    .orElseThrow(() -> invalidOutcome(
                            "The sender of the reported message could not be resolved."
                    ));
        }
        throw invalidOutcome(
                "This moderation outcome requires a user or message report."
        );
    }

    private static String optionalStatus(String value) {
        if (value == null || value.isBlank()) return "";
        String normalized = value.trim().toUpperCase();
        if (!REPORT_STATUSES.contains(normalized)) {
            throw ApiException.badRequest("INVALID_REPORT_STATUS", "Unsupported report status filter.");
        }
        return normalized;
    }

    private static String normalizeOutcome(String outcome) {
        String normalized = outcome == null ? "" : outcome.trim().toUpperCase();
        if (!OUTCOMES.contains(normalized)) {
            throw invalidOutcome("The selected moderation outcome is not supported.");
        }
        return normalized;
    }

    private static String requireReason(String reason) {
        String normalized = reason == null ? "" : reason.trim();
        if (normalized.length() < 3 || normalized.length() > 1_000) {
            throw ApiException.badRequest(
                    "INVALID_MODERATION_REASON",
                    "A decision reason between 3 and 1000 characters is required."
            );
        }
        return normalized;
    }

    private static ApiException invalidOutcome(String message) {
        return ApiException.badRequest("INVALID_MODERATION_OUTCOME", message);
    }

    private static String humanize(String value) {
        return value.toLowerCase().replace('_', ' ');
    }

}
