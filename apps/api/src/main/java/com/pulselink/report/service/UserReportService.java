package com.pulselink.report.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pulselink.report.dto.CreateReportRequest;
import com.pulselink.report.dto.UserReportResponse;
import com.pulselink.report.repository.UserReportRepository;
import com.pulselink.shared.exception.ApiException;

@Service
public class UserReportService {

    private final UserReportRepository repository;

    public UserReportService(UserReportRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<UserReportResponse> list(UUID reporterId) {
        return repository.list(reporterId).stream()
                .map(row -> new UserReportResponse(
                        row.id(),
                        row.targetType(),
                        row.targetLabel(),
                        row.reason(),
                        row.description(),
                        row.status(),
                        row.outcome(),
                        row.resolutionSummary(),
                        row.createdAt(),
                        row.updatedAt(),
                        repository.clarifications(row.id(), reporterId)
                ))
                .toList();
    }

    @Transactional
    public UUID create(UUID reporterId, CreateReportRequest request) {
        validateTarget(request);
        Map<String, Object> evidence = repository.evidenceForTarget(reporterId, request)
                .orElseThrow(() -> ApiException.notFound(
                        "REPORT_TARGET_NOT_FOUND",
                        "The report target was not found or is not visible to you."
                ));
        try {
            return repository.create(reporterId, request, evidence);
        } catch (DataIntegrityViolationException ex) {
            throw ApiException.conflict(
                    "DUPLICATE_OPEN_REPORT",
                    "You already have an unresolved report for this target."
            );
        }
    }

    @Transactional
    public void addClarification(UUID reporterId, UUID reportId, String body) {
        if (!repository.isOpenForReporter(reportId, reporterId)) {
            throw ApiException.conflict(
                    "REPORT_NOT_OPEN",
                    "Only open reports can receive additional clarification."
            );
        }
        if (repository.addClarification(reportId, reporterId, body.trim()) != 1) {
            throw ApiException.conflict(
                    "REPORT_NOT_OPEN",
                    "Only open reports can receive additional clarification."
            );
        }
    }

    private void validateTarget(CreateReportRequest request) {
        boolean valid = switch (request.targetType()) {
            case "USER" -> request.targetUserId() != null
                    && request.targetMessageId() == null
                    && request.targetConversationId() == null;
            case "MESSAGE" -> request.targetUserId() == null
                    && request.targetMessageId() != null
                    && request.targetConversationId() == null;
            case "GROUP" -> request.targetUserId() == null
                    && request.targetMessageId() == null
                    && request.targetConversationId() != null;
            default -> false;
        };
        if (!valid) {
            throw ApiException.badRequest(
                    "INVALID_REPORT_TARGET",
                    "The report target does not match the selected target type."
            );
        }
    }
}
