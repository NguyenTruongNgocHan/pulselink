package com.pulselink.admin.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pulselink.admin.dto.AdminDtos.AuditEntry;
import com.pulselink.admin.repository.AdminRepository;
import com.pulselink.shared.dto.PageResponse;

@Service
public class AdminAuditQueryService {

    private final AdminRepository repository;
    private final StaffAuthorizationService authorization;

    public AdminAuditQueryService(
            AdminRepository repository,
            StaffAuthorizationService authorization
    ) {
        this.repository = repository;
        this.authorization = authorization;
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditEntry> list(
            UUID actorId,
            String query,
            String action,
            int page,
            int size
    ) {
        authorization.requireRole(actorId, "ADMIN");
        int safePage = Math.max(0, page);
        int safeSize = Math.min(100, Math.max(1, size));
        return PageResponse.of(
                repository.auditEntries(query, action, safePage * safeSize, safeSize),
                safePage,
                safeSize,
                repository.auditCount(query, action)
        );
    }
}
