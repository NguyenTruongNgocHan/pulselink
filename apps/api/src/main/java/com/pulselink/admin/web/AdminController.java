package com.pulselink.admin.web;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pulselink.admin.dto.AdminDtos.ActionRequest;
import com.pulselink.admin.dto.AdminDtos.AuditEntry;
import com.pulselink.admin.dto.AdminDtos.Dashboard;
import com.pulselink.admin.dto.AdminDtos.DecisionRequest;
import com.pulselink.admin.dto.AdminDtos.GroupSummary;
import com.pulselink.admin.dto.AdminDtos.ReportDetails;
import com.pulselink.admin.dto.AdminDtos.ReportEvidence;
import com.pulselink.admin.dto.AdminDtos.ReportSummary;
import com.pulselink.admin.dto.AdminDtos.RoleRequest;
import com.pulselink.admin.dto.AdminDtos.UserDetails;
import com.pulselink.admin.dto.AdminDtos.UserSummary;
import com.pulselink.admin.service.AdminAuditQueryService;
import com.pulselink.admin.service.AdminDashboardService;
import com.pulselink.admin.service.AdminGroupService;
import com.pulselink.admin.service.AdminReportService;
import com.pulselink.admin.service.AdminUserService;
import com.pulselink.shared.auth.CurrentUser;
import com.pulselink.shared.dto.PageResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Administration", description = "Role-protected moderation and administration operations")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final CurrentUser currentUser;
    private final AdminDashboardService dashboardService;
    private final AdminUserService userService;
    private final AdminReportService reportService;
    private final AdminGroupService groupService;
    private final AdminAuditQueryService auditQueryService;

    public AdminController(
            CurrentUser currentUser,
            AdminDashboardService dashboardService,
            AdminUserService userService,
            AdminReportService reportService,
            AdminGroupService groupService,
            AdminAuditQueryService auditQueryService
    ) {
        this.currentUser = currentUser;
        this.dashboardService = dashboardService;
        this.userService = userService;
        this.reportService = reportService;
        this.groupService = groupService;
        this.auditQueryService = auditQueryService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get administration dashboard metrics")
    public Dashboard dashboard(Authentication authentication) {
        return dashboardService.get(currentUser.id(authentication));
    }

    @GetMapping("/users")
    @Operation(summary = "Search and filter user accounts")
    public PageResponse<UserSummary> users(
            Authentication authentication,
            @RequestParam(name = "q", defaultValue = "") String query,
            @RequestParam(defaultValue = "") String role,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return userService.list(currentUser.id(authentication), query, role, status, page, size);
    }

    @GetMapping("/users/{userId}")
    @Operation(summary = "Get user administration details")
    public UserDetails user(
            Authentication authentication,
            @PathVariable UUID userId
    ) {
        return userService.get(currentUser.id(authentication), userId);
    }

    @PostMapping("/users/{userId}/suspend")
    @Operation(summary = "Temporarily suspend a user")
    public ResponseEntity<Void> suspend(
            Authentication authentication,
            @PathVariable UUID userId,
            @Valid @RequestBody ActionRequest request
    ) {
        userService.suspend(currentUser.id(authentication), userId, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{userId}/unsuspend")
    @Operation(summary = "Restore a suspended user")
    public ResponseEntity<Void> unsuspend(
            Authentication authentication,
            @PathVariable UUID userId,
            @Valid @RequestBody ActionRequest request
    ) {
        userService.unsuspend(currentUser.id(authentication), userId, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{userId}/ban")
    @Operation(summary = "Indefinitely ban a user")
    public ResponseEntity<Void> ban(
            Authentication authentication,
            @PathVariable UUID userId,
            @Valid @RequestBody ActionRequest request
    ) {
        userService.ban(currentUser.id(authentication), userId, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{userId}/unban")
    @Operation(summary = "Restore a banned user")
    public ResponseEntity<Void> unban(
            Authentication authentication,
            @PathVariable UUID userId,
            @Valid @RequestBody ActionRequest request
    ) {
        userService.unban(currentUser.id(authentication), userId, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{userId}/force-logout")
    @Operation(summary = "Revoke all user sessions")
    public ResponseEntity<Void> forceLogout(
            Authentication authentication,
            @PathVariable UUID userId,
            @Valid @RequestBody ActionRequest request
    ) {
        userService.forceLogout(currentUser.id(authentication), userId, request);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/{userId}/role")
    @Operation(summary = "Change a user's system role")
    public ResponseEntity<Void> changeRole(
            Authentication authentication,
            @PathVariable UUID userId,
            @Valid @RequestBody RoleRequest request
    ) {
        userService.changeRole(currentUser.id(authentication), userId, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reports")
    @Operation(summary = "Search and filter moderation reports")
    public PageResponse<ReportSummary> reports(
            Authentication authentication,
            @RequestParam(name = "q", defaultValue = "") String query,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return reportService.list(currentUser.id(authentication), query, status, page, size);
    }

    @GetMapping("/reports/{reportId}")
    @Operation(summary = "Get moderation report details")
    public ReportDetails report(
            Authentication authentication,
            @PathVariable UUID reportId
    ) {
        return reportService.get(currentUser.id(authentication), reportId);
    }

    @PostMapping("/reports/{reportId}/claim")
    @Operation(summary = "Claim an open report")
    public ReportDetails claimReport(
            Authentication authentication,
            @PathVariable UUID reportId
    ) {
        return reportService.claim(currentUser.id(authentication), reportId);
    }

    @GetMapping("/reports/{reportId}/evidence")
    @Operation(summary = "View immutable report evidence")
    public ReportEvidence reportEvidence(
            Authentication authentication,
            @PathVariable UUID reportId
    ) {
        return reportService.evidence(currentUser.id(authentication), reportId);
    }

    @PostMapping("/reports/{reportId}/resolve")
    @Operation(summary = "Resolve a claimed report")
    public ReportDetails resolveReport(
            Authentication authentication,
            @PathVariable UUID reportId,
            @Valid @RequestBody DecisionRequest request
    ) {
        return reportService.resolve(currentUser.id(authentication), reportId, request);
    }

    @PostMapping("/reports/{reportId}/reject")
    @Operation(summary = "Reject a claimed report")
    public ReportDetails rejectReport(
            Authentication authentication,
            @PathVariable UUID reportId,
            @Valid @RequestBody DecisionRequest request
    ) {
        return reportService.reject(currentUser.id(authentication), reportId, request);
    }

    @GetMapping("/groups")
    @Operation(summary = "Search and filter group conversations")
    public PageResponse<GroupSummary> groups(
            Authentication authentication,
            @RequestParam(name = "q", defaultValue = "") String query,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return groupService.list(currentUser.id(authentication), query, status, page, size);
    }

    @PostMapping("/groups/{groupId}/close")
    @Operation(summary = "Close a group conversation")
    public ResponseEntity<Void> closeGroup(
            Authentication authentication,
            @PathVariable UUID groupId,
            @Valid @RequestBody ActionRequest request
    ) {
        groupService.close(currentUser.id(authentication), groupId, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/groups/{groupId}/reopen")
    @Operation(summary = "Reopen a group conversation")
    public ResponseEntity<Void> reopenGroup(
            Authentication authentication,
            @PathVariable UUID groupId,
            @Valid @RequestBody ActionRequest request
    ) {
        groupService.reopen(currentUser.id(authentication), groupId, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Search immutable administration audit logs")
    public PageResponse<AuditEntry> auditLogs(
            Authentication authentication,
            @RequestParam(name = "q", defaultValue = "") String query,
            @RequestParam(defaultValue = "") String action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return auditQueryService.list(currentUser.id(authentication), query, action, page, size);
    }
}
