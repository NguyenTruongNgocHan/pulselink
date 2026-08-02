package com.pulselink.friend.web;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pulselink.friend.dto.FriendRequestsResponse;
import com.pulselink.friend.dto.PersonResponse;
import com.pulselink.friend.service.FriendshipService;
import com.pulselink.shared.auth.CurrentUser;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "People and friendships")
public class PeopleController {

    private final FriendshipService service;
    private final CurrentUser currentUser;

    public PeopleController(FriendshipService service, CurrentUser currentUser) {
        this.service = service;
        this.currentUser = currentUser;
    }

    @GetMapping("/people")
    public List<PersonResponse> search(
            @RequestParam(defaultValue = "") String q,
            Authentication authentication
    ) {
        return service.search(currentUser.id(authentication), q);
    }

    @GetMapping("/friend-requests")
    public FriendRequestsResponse requests(Authentication authentication) {
        return service.requests(currentUser.id(authentication));
    }

    @PostMapping("/people/{personId}/friend-request")
    @Operation(summary = "Send a friend request")
    public ResponseEntity<Void> sendRequest(
            @PathVariable UUID personId,
            Authentication authentication
    ) {
        service.sendRequest(currentUser.id(authentication), personId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/people/{personId}/friend-request/accept")
    public ResponseEntity<Void> accept(
            @PathVariable UUID personId,
            Authentication authentication
    ) {
        service.accept(currentUser.id(authentication), personId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/friend-requests/{personId}")
    public ResponseEntity<Void> declineOrCancel(
            @PathVariable UUID personId,
            Authentication authentication
    ) {
        service.declineOrCancel(currentUser.id(authentication), personId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/people/{personId}/friendship")
    public ResponseEntity<Void> removeFriend(
            @PathVariable UUID personId,
            Authentication authentication
    ) {
        service.removeFriend(currentUser.id(authentication), personId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/blocks/{personId}")
    public ResponseEntity<Void> block(
            @PathVariable UUID personId,
            Authentication authentication
    ) {
        service.block(currentUser.id(authentication), personId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/blocks/{personId}")
    public ResponseEntity<Void> unblock(
            @PathVariable UUID personId,
            Authentication authentication
    ) {
        service.unblock(currentUser.id(authentication), personId);
        return ResponseEntity.noContent().build();
    }
}
