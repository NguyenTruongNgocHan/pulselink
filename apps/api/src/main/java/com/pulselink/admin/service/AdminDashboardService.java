package com.pulselink.admin.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pulselink.admin.dto.AdminDtos.Dashboard;
import com.pulselink.admin.repository.AdminRepository;

@Service
public class AdminDashboardService {

    private final AdminRepository repository;
    private final StaffAuthorizationService authorization;

    public AdminDashboardService(
            AdminRepository repository,
            StaffAuthorizationService authorization
    ) {
        this.repository = repository;
        this.authorization = authorization;
    }

    @Transactional(readOnly = true)
    public Dashboard get(UUID actorId) {
        authorization.requireStaff(actorId);
        return new Dashboard(
                repository.count("select count(*) from users"),
                repository.count("select count(*) from users where status='ACTIVE'"),
                repository.count("select count(*) from conversations"),
                repository.count("select count(*) from messages where deleted_at is null"),
                repository.count("select count(*) from reports where status='OPEN'"),
                repository.count("select count(*) from reports where status='IN_REVIEW'"),
                repository.count("select count(*) from users where status='SUSPENDED'"),
                repository.count("select count(*) from users where status='BANNED'"),
                repository.auditEntries("", "", 0, 8),
                repository.reportTrend()
        );
    }
}
