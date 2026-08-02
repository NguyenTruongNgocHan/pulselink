package com.pulselink.admin.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pulselink.admin.dto.AdminDtos.ActionRequest;
import com.pulselink.admin.dto.AdminDtos.RoleRequest;
import com.pulselink.admin.dto.AdminDtos.UserDetails;
import com.pulselink.admin.dto.AdminDtos.UserSummary;
import com.pulselink.admin.repository.AdminRepository;
import com.pulselink.shared.dto.PageResponse;
import com.pulselink.shared.exception.ApiException;

@Service
public class AdminUserService {

    private static final Set<String> ROLES = Set.of("USER", "MODERATOR", "ADMIN", "SUPER_ADMIN");
    private static final Set<String> STATUSES = Set.of("ACTIVE", "SUSPENDED", "BANNED", "DISABLED");

    private final AdminRepository repository;
    private final StaffAuthorizationService authorization;
    private final AdminAuditService audit;

    public AdminUserService(
            AdminRepository repository,
            StaffAuthorizationService authorization,
            AdminAuditService audit
    ) {
        this.repository = repository;
        this.authorization = authorization;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public PageResponse<UserSummary> list(
            UUID actorId,
            String query,
            String role,
            String status,
            int page,
            int size
    ) {
        authorization.requireStaff(actorId);
        String normalizedRole = optionalEnum(role, ROLES, "INVALID_ROLE_FILTER");
        String normalizedStatus = optionalEnum(status, STATUSES, "INVALID_STATUS_FILTER");
        int safePage = normalizePage(page);
        int safeSize = normalizeSize(size);
        int offset = safePage * safeSize;
        return PageResponse.of(
                repository.users(query, normalizedRole, normalizedStatus, offset, safeSize),
                safePage,
                safeSize,
                repository.usersCount(query, normalizedRole, normalizedStatus)
        );
    }

    @Transactional(readOnly = true)
    public UserDetails get(UUID actorId, UUID userId) {
        authorization.requireStaff(actorId);
        return repository.userDetails(userId)
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "User was not found."));
    }

    @Transactional
    public void suspend(UUID actorId, UUID userId, ActionRequest request) {
        var target = authorization.requireCanManageUser(actorId, userId);
        if ("BANNED".equals(target.status()) || "DISABLED".equals(target.status())) {
            throw ApiException.conflict(
                    "ACCOUNT_CANNOT_BE_SUSPENDED",
                    "A banned or disabled account cannot be suspended."
            );
        }
        String reason = requireReason(request);
        Instant until = request.until();
        if (until == null) {
            until = Instant.now().plus(7, ChronoUnit.DAYS);
        }
        if (!until.isAfter(Instant.now().plus(1, ChronoUnit.MINUTES))) {
            throw ApiException.badRequest(
                    "INVALID_SUSPENSION_END",
                    "The suspension end must be in the future."
            );
        }
        repository.suspend(userId, until);
        repository.revokeSessions(userId);
        audit.record(actorId, "USER_SUSPENDED", "USER", userId, reason, Map.of("until", until.toString()));
    }

    @Transactional
    public void unsuspend(UUID actorId, UUID userId, ActionRequest request) {
        var target = authorization.requireCanManageUser(actorId, userId);
        if (!"SUSPENDED".equals(target.status())) {
            throw ApiException.conflict(
                    "ACCOUNT_NOT_SUSPENDED",
                    "Only a suspended account can be unsuspended."
            );
        }
        String reason = requireReason(request);
        repository.setActive(userId);
        audit.record(actorId, "USER_UNSUSPENDED", "USER", userId, reason, Map.of());
    }

    @Transactional
    public void ban(UUID actorId, UUID userId, ActionRequest request) {
        authorization.requireRole(actorId, "ADMIN");
        var target = authorization.requireCanManageUser(actorId, userId);
        if ("BANNED".equals(target.status())) {
            throw ApiException.conflict("ACCOUNT_ALREADY_BANNED", "This account is already banned.");
        }
        String reason = requireReason(request);
        repository.ban(userId);
        repository.revokeSessions(userId);
        audit.record(actorId, "USER_BANNED", "USER", userId, reason, Map.of());
    }

    @Transactional
    public void unban(UUID actorId, UUID userId, ActionRequest request) {
        authorization.requireRole(actorId, "ADMIN");
        var target = authorization.requireCanManageUser(actorId, userId);
        if (!"BANNED".equals(target.status())) {
            throw ApiException.conflict(
                    "ACCOUNT_NOT_BANNED",
                    "Only a banned account can be unbanned."
            );
        }
        String reason = requireReason(request);
        repository.setActive(userId);
        audit.record(actorId, "USER_UNBANNED", "USER", userId, reason, Map.of());
    }

    @Transactional
    public void forceLogout(UUID actorId, UUID userId, ActionRequest request) {
        authorization.requireCanManageUser(actorId, userId);
        String reason = requireReason(request);
        repository.revokeSessions(userId);
        repository.incrementTokenVersion(userId);
        audit.record(actorId, "USER_FORCE_LOGOUT", "USER", userId, reason, Map.of());
    }

    @Transactional
    public void changeRole(UUID actorId, UUID userId, RoleRequest request) {
        authorization.requireSuperAdmin(actorId);
        authorization.requireCanManageUser(actorId, userId);
        String reason = requireReason(request == null ? null : request.reason());
        String role = request == null ? "" : StaffAuthorizationService.normalize(request.role());
        if (!ROLES.contains(role)) {
            throw ApiException.badRequest("INVALID_ROLE", "The requested role is not supported.");
        }
        repository.changeRole(userId, role);
        repository.revokeSessions(userId);
        audit.record(actorId, "USER_ROLE_CHANGED", "USER", userId, reason, Map.of("role", role));
    }

    private static String requireReason(ActionRequest request) {
        return requireReason(request == null ? null : request.reason());
    }

    private static String requireReason(String reason) {
        String value = reason == null ? "" : reason.trim();
        if (value.length() < 3 || value.length() > 500) {
            throw ApiException.badRequest(
                    "INVALID_MODERATION_REASON",
                    "A reason between 3 and 500 characters is required."
            );
        }
        return value;
    }

    private static String optionalEnum(String value, Set<String> accepted, String code) {
        if (value == null || value.isBlank()) return "";
        String normalized = value.trim().toUpperCase();
        if (!accepted.contains(normalized)) {
            throw ApiException.badRequest(code, "An unsupported filter value was provided.");
        }
        return normalized;
    }

    private static int normalizePage(int page) {
        return Math.max(0, page);
    }

    private static int normalizeSize(int size) {
        return Math.min(100, Math.max(1, size));
    }
}
