package com.pulselink.admin.service;

import java.util.Locale;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.pulselink.admin.repository.AdminRepository;
import com.pulselink.admin.repository.AdminRepository.StaffUser;
import com.pulselink.shared.exception.ApiException;

@Service
public class StaffAuthorizationService {

    private final AdminRepository repository;

    public StaffAuthorizationService(AdminRepository repository) {
        this.repository = repository;
    }

    public StaffUser requireStaff(UUID actorId) {
        StaffUser actor = repository.staffUser(actorId)
                .orElseThrow(() -> ApiException.unauthorized(
                        "STAFF_ACCOUNT_NOT_FOUND",
                        "The authenticated staff account no longer exists."
                ));

        if (!"ACTIVE".equals(actor.status()) || rank(actor.role()) < rank("MODERATOR")) {
            throw ApiException.forbidden(
                    "STAFF_ACCESS_REQUIRED",
                    "A currently active staff account is required."
            );
        }
        return actor;
    }

    public StaffUser requireRole(UUID actorId, String minimumRole) {
        StaffUser actor = requireStaff(actorId);
        if (rank(actor.role()) < rank(minimumRole)) {
            throw ApiException.forbidden(
                    "INSUFFICIENT_STAFF_ROLE",
                    "This operation requires the " + humanize(minimumRole) + " role or higher."
            );
        }
        return actor;
    }

    public StaffUser requireCanManageUser(UUID actorId, UUID targetId) {
        StaffUser actor = requireStaff(actorId);
        if (actorId.equals(targetId)) {
            throw ApiException.badRequest(
                    "SELF_MODERATION_NOT_ALLOWED",
                    "Use the security settings page to manage your own sessions."
            );
        }

        StaffUser target = repository.staffUser(targetId)
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "User was not found."));

        if (rank(actor.role()) <= rank(target.role())) {
            throw ApiException.forbidden(
                    "ROLE_HIERARCHY_VIOLATION",
                    "Staff members can only manage accounts below their own role."
            );
        }
        return target;
    }

    public void requireSuperAdmin(UUID actorId) {
        requireRole(actorId, "SUPER_ADMIN");
    }

    public static int rank(String role) {
        return switch (normalize(role)) {
            case "SUPER_ADMIN" -> 4;
            case "ADMIN" -> 3;
            case "MODERATOR" -> 2;
            default -> 1;
        };
    }

    public static String normalize(String role) {
        return role == null ? "USER" : role.trim().toUpperCase(Locale.ROOT);
    }

    private static String humanize(String role) {
        return normalize(role).toLowerCase(Locale.ROOT).replace('_', ' ');
    }
}
