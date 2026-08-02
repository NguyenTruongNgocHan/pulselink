package com.pulselink.group.service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pulselink.conversation.dto.ConversationParticipantResponse;
import com.pulselink.conversation.dto.ConversationResponse;
import com.pulselink.conversation.repository.ConversationRepository;
import com.pulselink.conversation.service.ConversationService;
import com.pulselink.group.dto.CreateGroupRequest;
import com.pulselink.group.dto.GroupResponse;
import com.pulselink.group.dto.UpdateGroupRequest;
import com.pulselink.group.repository.GroupRepository;
import com.pulselink.group.repository.GroupRepository.GroupRow;
import com.pulselink.presence.service.PresenceService;
import com.pulselink.shared.exception.ApiException;
import com.pulselink.realtime.service.RealtimeEventPublisher;

@Service
public class GroupService {

    private final GroupRepository groupRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationService conversationService;
    private final PresenceService presenceService;
    private final RealtimeEventPublisher realtimeEvents;

    public GroupService(
            GroupRepository groupRepository,
            ConversationRepository conversationRepository,
            ConversationService conversationService,
            PresenceService presenceService,
            RealtimeEventPublisher realtimeEvents
    ) {
        this.groupRepository = groupRepository;
        this.conversationRepository = conversationRepository;
        this.conversationService = conversationService;
        this.presenceService = presenceService;
        this.realtimeEvents = realtimeEvents;
    }

    @Transactional
    public ConversationResponse create(UUID currentUserId, CreateGroupRequest request) {
        String name = request.name().trim();
        List<UUID> members = validateNewMembers(currentUserId, request.memberIds());
        UUID groupId = groupRepository.create(currentUserId, name, members);
        return conversationService.get(groupId, currentUserId);
    }

    @Transactional(readOnly = true)
    public GroupResponse get(UUID groupId, UUID currentUserId) {
        String currentRole = requireMember(groupId, currentUserId);
        GroupRow row = groupRepository.find(groupId)
                .orElseThrow(() -> ApiException.notFound("GROUP_NOT_FOUND", "Group was not found."));
        List<ConversationParticipantResponse> members = conversationRepository.participants(groupId)
                .stream()
                .map(member -> new ConversationParticipantResponse(
                        member.id(),
                        member.username(),
                        member.displayName(),
                        member.avatarUrl(),
                        member.role(),
                        presenceService.isOnline(member.id())
                ))
                .toList();
        return new GroupResponse(
                row.id(),
                row.name(),
                avatarUrl(row.avatarObjectKey()),
                row.status(),
                row.createdAt(),
                row.createdBy(),
                members,
                currentRole
        );
    }

    @Transactional
    public void addMembers(UUID groupId, UUID currentUserId, List<UUID> memberIds) {
        requireAdmin(groupId, currentUserId);
        List<UUID> members = validateNewMembers(currentUserId, memberIds);
        groupRepository.addMembers(groupId, members);
        publish(groupId, "GROUP_MEMBERS_UPDATED");
    }

    @Transactional
    public void removeMember(UUID groupId, UUID currentUserId, UUID memberId) {
        requireAdmin(groupId, currentUserId);
        if (currentUserId.equals(memberId)) {
            throw ApiException.badRequest(
                    "ADMIN_CANNOT_REMOVE_SELF",
                    "Transfer the administrator role before leaving the group."
            );
        }
        if (groupRepository.removeMember(groupId, memberId) == 0) {
            throw ApiException.notFound("GROUP_MEMBER_NOT_FOUND", "Group member was not found.");
        }
        publish(groupId, "GROUP_MEMBERS_UPDATED");
    }

    @Transactional
    public void transferAdmin(UUID groupId, UUID currentUserId, UUID nextAdminId) {
        requireAdmin(groupId, currentUserId);
        if (currentUserId.equals(nextAdminId)) {
            throw ApiException.badRequest("ADMIN_ALREADY_ASSIGNED", "This person is already the group admin.");
        }
        if (groupRepository.transferAdmin(groupId, currentUserId, nextAdminId) == 0) {
            throw ApiException.notFound("GROUP_MEMBER_NOT_FOUND", "The selected member was not found.");
        }
        publish(groupId, "GROUP_ADMIN_TRANSFERRED");
    }

    @Transactional
    public void leave(UUID groupId, UUID currentUserId) {
        String role = requireMember(groupId, currentUserId);
        if ("ADMIN".equals(role)) {
            throw ApiException.conflict(
                    "TRANSFER_ADMIN_REQUIRED",
                    "Transfer the administrator role before leaving the group."
            );
        }
        groupRepository.leave(groupId, currentUserId);
        publish(groupId, "GROUP_MEMBERS_UPDATED");
    }

    @Transactional
    public GroupResponse update(
            UUID groupId,
            UUID currentUserId,
            UpdateGroupRequest request
    ) {
        requireAdmin(groupId, currentUserId);
        String name = request.name() == null ? null : request.name().trim();
        groupRepository.update(groupId, name, request.avatarObjectKey());
        publish(groupId, "GROUP_UPDATED");
        return get(groupId, currentUserId);
    }


    private List<UUID> validateNewMembers(UUID currentUserId, List<UUID> requestedIds) {
        Set<UUID> uniqueIds = new LinkedHashSet<>(requestedIds == null ? List.of() : requestedIds);
        uniqueIds.remove(currentUserId);

        List<UUID> invalidIds = uniqueIds.stream()
                .filter(candidateId -> !groupRepository.isAcceptedFriend(currentUserId, candidateId))
                .toList();
        if (!invalidIds.isEmpty()) {
            throw ApiException.badRequest(
                    "GROUP_MEMBERS_MUST_BE_FRIENDS",
                    "Only active friends can be added to a group."
            );
        }
        return List.copyOf(uniqueIds);
    }

    private String requireMember(UUID groupId, UUID userId) {
        String role = groupRepository.role(groupId, userId);
        if (role == null) {
            throw ApiException.forbidden(
                    "GROUP_ACCESS_DENIED",
                    "You are not an active member of this group."
            );
        }
        return role;
    }

    private void requireAdmin(UUID groupId, UUID userId) {
        if (!"ADMIN".equals(requireMember(groupId, userId))) {
            throw ApiException.forbidden("GROUP_ADMIN_REQUIRED", "Group administrator access is required.");
        }
    }

    private void publish(UUID groupId, String type) {
        realtimeEvents.publishGroup(
                groupId,
                java.util.Map.of("type", type, "groupId", groupId)
        );
    }

    private String avatarUrl(String objectKey) {
        return objectKey == null ? null : "/api/v1/files/avatar/" + objectKey;
    }
}
