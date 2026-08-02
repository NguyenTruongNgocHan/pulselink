package com.pulselink.report.web;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.pulselink.report.dto.CreateReportRequest;
import com.pulselink.report.dto.ReportClarificationRequest;
import com.pulselink.report.dto.UserReportResponse;
import com.pulselink.report.service.UserReportService;
import com.pulselink.shared.auth.CurrentUser;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "User reports")
public class UserReportController {

    private final UserReportService service;
    private final CurrentUser currentUser;

    public UserReportController(UserReportService service, CurrentUser currentUser) {
        this.service = service;
        this.currentUser = currentUser;
    }

    @GetMapping("/my-reports")
    public List<UserReportResponse> list(Authentication authentication) {
        return service.list(currentUser.id(authentication));
    }

    @PostMapping("/reports")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(
            @Valid @RequestBody CreateReportRequest request,
            Authentication authentication
    ) {
        UUID id = service.create(currentUser.id(authentication), request);
        return Map.of("id", id, "status", "OPEN");
    }

    @PostMapping("/reports/{reportId}/clarifications")
    public ResponseEntity<Void> clarify(
            @PathVariable UUID reportId,
            @Valid @RequestBody ReportClarificationRequest request,
            Authentication authentication
    ) {
        service.addClarification(currentUser.id(authentication), reportId, request.body());
        return ResponseEntity.noContent().build();
    }
}
