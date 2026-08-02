package com.pulselink.admin.service;

import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pulselink.admin.repository.AdminRepository;

@Service
public class AdminAuditService {

    private final AdminRepository repository;
    private final ObjectMapper objectMapper;

    public AdminAuditService(AdminRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public void record(
            UUID actorId,
            String action,
            String targetType,
            UUID targetId,
            String reason,
            Map<String, ?> metadata
    ) {
        repository.insertAudit(
                actorId,
                action,
                targetType,
                targetId,
                normalizeReason(reason),
                toJson(metadata)
        );
    }

    private String toJson(Map<String, ?> metadata) {
        try {
            return objectMapper.writeValueAsString(metadata == null ? Map.of() : metadata);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not serialize admin audit metadata.", exception);
        }
    }

    private static String normalizeReason(String reason) {
        return reason == null ? null : reason.trim();
    }
}
