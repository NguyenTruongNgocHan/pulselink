package com.pulselink.notification.web;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pulselink.notification.dto.NotificationsResponse;
import com.pulselink.notification.service.NotificationService;
import com.pulselink.shared.auth.CurrentUser;

import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications")
public class NotificationController {

    private final NotificationService service;
    private final CurrentUser currentUser;

    public NotificationController(NotificationService service, CurrentUser currentUser) {
        this.service = service;
        this.currentUser = currentUser;
    }

    @GetMapping
    public NotificationsResponse list(
            @RequestParam(defaultValue = "false") boolean unread,
            Authentication authentication
    ) {
        return service.list(currentUser.id(authentication), unread);
    }

    @PostMapping("/{notificationId}/read")
    public ResponseEntity<Void> read(
            @PathVariable UUID notificationId,
            Authentication authentication
    ) {
        service.markRead(notificationId, currentUser.id(authentication));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> readAll(Authentication authentication) {
        service.markAllRead(currentUser.id(authentication));
        return ResponseEntity.noContent().build();
    }
}
