package com.pulselink.admin.service;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pulselink.admin.dto.AdminDtos.ActionRequest;
import com.pulselink.admin.dto.AdminDtos.GroupSummary;
import com.pulselink.admin.repository.AdminRepository;
import com.pulselink.shared.dto.PageResponse;
import com.pulselink.shared.exception.ApiException;

@Service
public class AdminGroupService {

    private static final Set<String> STATUSES = Set.of("ACTIVE", "CLOSED");

    private final AdminRepository repository;
    private final StaffAuthorizationService authorization;
    private final AdminAuditService audit;

    public AdminGroupService(
            AdminRepository repository,
            StaffAuthorizationService authorization,
            AdminAuditService audit
    ) {
        this.repository = repository;
        this.authorization = authorization;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public PageResponse<GroupSummary> list(
            UUID actorId,
            String query,
            String status,
            int page,
            int size
    ) {
        authorization.requireStaff(actorId);
        String normalizedStatus = normalizeStatus(status);
        int safePage = Math.max(0, page);
        int safeSize = Math.min(100, Math.max(1, size));
        return PageResponse.of(
                repository.groups(query, normalizedStatus, safePage * safeSize, safeSize),
                safePage,
                safeSize,
                repository.groupsCount(query, normalizedStatus)
        );
    }

    @Transactional
    public void close(UUID actorId, UUID groupId, ActionRequest request) {
        authorization.requireStaff(actorId);
        String reason = requireReason(request);
        if (repository.setGroupStatus(groupId, "CLOSED") != 1) {
            throw ApiException.notFound("GROUP_NOT_FOUND", "Group conversation was not found.");
        }
        audit.record(actorId, "GROUP_CLOSED", "GROUP", groupId, reason, Map.of());
    }

    @Transactional
    public void reopen(UUID actorId, UUID groupId, ActionRequest request) {
        authorization.requireRole(actorId, "ADMIN");
        String reason = requireReason(request);
        if (repository.setGroupStatus(groupId, "ACTIVE") != 1) {
            throw ApiException.notFound("GROUP_NOT_FOUND", "Group conversation was not found.");
        }
        audit.record(actorId, "GROUP_REOPENED", "GROUP", groupId, reason, Map.of());
    }

    private static String normalizeStatus(String value) {
        if (value == null || value.isBlank()) return "";
        String normalized = value.trim().toUpperCase();
        if (!STATUSES.contains(normalized)) {
            throw ApiException.badRequest("INVALID_GROUP_STATUS", "Unsupported group status filter.");
        }
        return normalized;
    }

    private static String requireReason(ActionRequest request) {
        String reason = request == null || request.reason() == null ? "" : request.reason().trim();
        if (reason.length() < 3 || reason.length() > 500) {
            throw ApiException.badRequest(
                    "INVALID_MODERATION_REASON",
                    "A reason between 3 and 500 characters is required."
            );
        }
        return reason;
    }
}
