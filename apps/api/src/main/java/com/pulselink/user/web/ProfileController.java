package com.pulselink.user.web;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pulselink.shared.auth.CurrentSession;
import com.pulselink.shared.auth.CurrentUser;
import com.pulselink.user.dto.ChangePasswordRequest;
import com.pulselink.user.dto.DeactivateAccountRequest;
import com.pulselink.user.dto.ProfileResponse;
import com.pulselink.user.dto.SecuritySessionResponse;
import com.pulselink.user.dto.UpdateProfileRequest;
import com.pulselink.user.service.ProfileService;
import com.pulselink.user.service.SecuritySessionService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Profile and account security")
public class ProfileController {

    private final ProfileService profileService;
    private final SecuritySessionService sessionService;
    private final CurrentUser currentUser;
    private final CurrentSession currentSession;

    public ProfileController(
            ProfileService profileService,
            SecuritySessionService sessionService,
            CurrentUser currentUser,
            CurrentSession currentSession
    ) {
        this.profileService = profileService;
        this.sessionService = sessionService;
        this.currentUser = currentUser;
        this.currentSession = currentSession;
    }

    @GetMapping("/profile")
    public ProfileResponse profile(Authentication authentication) {
        return profileService.get(currentUser.id(authentication));
    }

    @PutMapping("/profile")
    public ProfileResponse update(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {
        return profileService.update(currentUser.id(authentication), request);
    }

    @GetMapping("/security/sessions")
    public java.util.List<SecuritySessionResponse> sessions(
            Authentication authentication,
            HttpServletRequest request
    ) {
        return sessionService.sessions(
                currentUser.id(authentication),
                currentSession.id(request)
        );
    }

    @DeleteMapping("/security/sessions/{sessionId}")
    public ResponseEntity<Void> revokeSession(
            @PathVariable UUID sessionId,
            Authentication authentication
    ) {
        sessionService.revoke(currentUser.id(authentication), sessionId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/security/sessions")
    public ResponseEntity<Void> revokeOtherSessions(
            Authentication authentication,
            HttpServletRequest request
    ) {
        sessionService.revokeOthers(
                currentUser.id(authentication),
                currentSession.id(request)
        );
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/security/password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication
    ) {
        sessionService.changePassword(currentUser.id(authentication), request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/security/deactivate")
    public ResponseEntity<Void> deactivate(
            @Valid @RequestBody DeactivateAccountRequest request,
            Authentication authentication
    ) {
        profileService.deactivate(currentUser.id(authentication), request.reason());
        return ResponseEntity.noContent().build();
    }
}
