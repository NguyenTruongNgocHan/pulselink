package com.pulselink.search.web;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pulselink.search.dto.MessageSearchResponse;
import com.pulselink.search.service.MessageSearchService;
import com.pulselink.shared.auth.CurrentUser;

import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/message-search")
@Tag(name = "Message search")
public class MessageSearchController {

    private final MessageSearchService service;
    private final CurrentUser currentUser;

    public MessageSearchController(MessageSearchService service, CurrentUser currentUser) {
        this.service = service;
        this.currentUser = currentUser;
    }

    @GetMapping
    public List<MessageSearchResponse> search(
            @RequestParam String q,
            @RequestParam(required = false) UUID conversationId,
            Authentication authentication
    ) {
        return service.search(currentUser.id(authentication), q, conversationId);
    }
}
