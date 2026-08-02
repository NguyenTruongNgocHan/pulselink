package com.pulselink.saved.web;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pulselink.saved.dto.SavedMessageResponse;
import com.pulselink.saved.service.SavedMessageService;
import com.pulselink.shared.auth.CurrentUser;

import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/saved-messages")
@Tag(name = "Saved messages")
public class SavedMessageController {

    private final SavedMessageService service;
    private final CurrentUser currentUser;

    public SavedMessageController(SavedMessageService service, CurrentUser currentUser) {
        this.service = service;
        this.currentUser = currentUser;
    }

    @GetMapping
    public List<SavedMessageResponse> list(Authentication authentication) {
        return service.list(currentUser.id(authentication));
    }
}
