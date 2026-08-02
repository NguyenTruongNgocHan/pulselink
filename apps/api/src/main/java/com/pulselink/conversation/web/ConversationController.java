package com.pulselink.conversation.web;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.pulselink.conversation.dto.ConversationResponse;
import com.pulselink.conversation.dto.EditMessageRequest;
import com.pulselink.conversation.dto.MessageResponse;
import com.pulselink.conversation.dto.ReactionRequest;
import com.pulselink.conversation.dto.SendMessageRequest;
import com.pulselink.conversation.service.ConversationService;
import com.pulselink.shared.auth.CurrentUser;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Conversations and messages")
public class ConversationController {

    private final ConversationService service;
    private final CurrentUser currentUser;

    public ConversationController(ConversationService service, CurrentUser currentUser) {
        this.service = service;
        this.currentUser = currentUser;
    }

    @GetMapping("/conversations")
    public List<ConversationResponse> conversations(Authentication authentication) {
        return service.list(currentUser.id(authentication));
    }

    @GetMapping("/conversations/{conversationId}")
    public ConversationResponse conversation(
            @PathVariable UUID conversationId,
            Authentication authentication
    ) {
        return service.get(conversationId, currentUser.id(authentication));
    }

    @PostMapping("/conversations/direct/{personId}")
    @Operation(summary = "Find or create a direct conversation")
    public ConversationResponse direct(
            @PathVariable UUID personId,
            Authentication authentication
    ) {
        return service.createDirect(currentUser.id(authentication), personId);
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public List<MessageResponse> messages(
            @PathVariable UUID conversationId,
            Authentication authentication
    ) {
        return service.messages(conversationId, currentUser.id(authentication));
    }

    @PostMapping("/conversations/{conversationId}/messages")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse send(
            @PathVariable UUID conversationId,
            @Valid @RequestBody SendMessageRequest request,
            Authentication authentication
    ) {
        return service.send(conversationId, currentUser.id(authentication), request);
    }

    @PatchMapping("/messages/{messageId}")
    public MessageResponse edit(
            @PathVariable UUID messageId,
            @Valid @RequestBody EditMessageRequest request,
            Authentication authentication
    ) {
        return service.edit(messageId, currentUser.id(authentication), request.content());
    }

    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID messageId,
            Authentication authentication
    ) {
        service.delete(messageId, currentUser.id(authentication));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/messages/{messageId}/reaction")
    public ResponseEntity<Void> react(
            @PathVariable UUID messageId,
            @Valid @RequestBody ReactionRequest request,
            Authentication authentication
    ) {
        service.react(messageId, currentUser.id(authentication), request.emoji());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/messages/{messageId}/reaction")
    public ResponseEntity<Void> removeReaction(
            @PathVariable UUID messageId,
            Authentication authentication
    ) {
        service.removeReaction(messageId, currentUser.id(authentication));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Void> markRead(
            @PathVariable UUID conversationId,
            Authentication authentication
    ) {
        service.markRead(conversationId, currentUser.id(authentication));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/messages/{messageId}/save")
    public ResponseEntity<Void> save(
            @PathVariable UUID messageId,
            Authentication authentication
    ) {
        service.save(messageId, currentUser.id(authentication));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/messages/{messageId}/save")
    public ResponseEntity<Void> unsave(
            @PathVariable UUID messageId,
            Authentication authentication
    ) {
        service.unsave(messageId, currentUser.id(authentication));
        return ResponseEntity.noContent().build();
    }
}
