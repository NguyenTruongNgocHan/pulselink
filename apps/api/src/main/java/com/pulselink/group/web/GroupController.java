package com.pulselink.group.web;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.pulselink.conversation.dto.ConversationResponse;
import com.pulselink.group.dto.AddGroupMembersRequest;
import com.pulselink.group.dto.CreateGroupRequest;
import com.pulselink.group.dto.GroupResponse;
import com.pulselink.group.dto.UpdateGroupRequest;
import com.pulselink.group.service.GroupService;
import com.pulselink.shared.auth.CurrentUser;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Groups")
public class GroupController {

    private final GroupService service;
    private final CurrentUser currentUser;

    public GroupController(GroupService service, CurrentUser currentUser) {
        this.service = service;
        this.currentUser = currentUser;
    }

    @PostMapping("/conversations/groups")
    @ResponseStatus(HttpStatus.CREATED)
    public ConversationResponse create(
            @Valid @RequestBody CreateGroupRequest request,
            Authentication authentication
    ) {
        return service.create(currentUser.id(authentication), request);
    }

    @GetMapping("/groups/{groupId}")
    public GroupResponse get(
            @PathVariable UUID groupId,
            Authentication authentication
    ) {
        return service.get(groupId, currentUser.id(authentication));
    }

    @PostMapping("/groups/{groupId}/members")
    public ResponseEntity<Void> addMembers(
            @PathVariable UUID groupId,
            @Valid @RequestBody AddGroupMembersRequest request,
            Authentication authentication
    ) {
        service.addMembers(groupId, currentUser.id(authentication), request.memberIds());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/groups/{groupId}/members/{memberId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable UUID groupId,
            @PathVariable UUID memberId,
            Authentication authentication
    ) {
        service.removeMember(groupId, currentUser.id(authentication), memberId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/groups/{groupId}/transfer-admin/{memberId}")
    public ResponseEntity<Void> transferAdmin(
            @PathVariable UUID groupId,
            @PathVariable UUID memberId,
            Authentication authentication
    ) {
        service.transferAdmin(groupId, currentUser.id(authentication), memberId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/groups/{groupId}/leave")
    public ResponseEntity<Void> leave(
            @PathVariable UUID groupId,
            Authentication authentication
    ) {
        service.leave(groupId, currentUser.id(authentication));
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/groups/{groupId}")
    public GroupResponse update(
            @PathVariable UUID groupId,
            @Valid @RequestBody UpdateGroupRequest request,
            Authentication authentication
    ) {
        return service.update(groupId, currentUser.id(authentication), request);
    }
}
