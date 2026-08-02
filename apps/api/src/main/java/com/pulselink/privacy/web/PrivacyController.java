package com.pulselink.privacy.web;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pulselink.privacy.dto.PrivacySettingsResponse;
import com.pulselink.privacy.dto.UpdatePrivacySettingsRequest;
import com.pulselink.privacy.service.PrivacyService;
import com.pulselink.shared.auth.CurrentUser;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/privacy")
@Tag(name = "Privacy settings")
public class PrivacyController {

    private final PrivacyService service;
    private final CurrentUser currentUser;

    public PrivacyController(PrivacyService service, CurrentUser currentUser) {
        this.service = service;
        this.currentUser = currentUser;
    }

    @GetMapping
    public PrivacySettingsResponse get(Authentication authentication) {
        return service.get(currentUser.id(authentication));
    }

    @PutMapping
    public PrivacySettingsResponse update(
            @Valid @RequestBody UpdatePrivacySettingsRequest request,
            Authentication authentication
    ) {
        return service.update(currentUser.id(authentication), request);
    }
}
