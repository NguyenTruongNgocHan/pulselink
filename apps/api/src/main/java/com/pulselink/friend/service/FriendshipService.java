package com.pulselink.friend.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pulselink.friend.dto.FriendRequestsResponse;
import com.pulselink.friend.dto.PersonResponse;
import com.pulselink.friend.repository.FriendshipRepository;
import com.pulselink.notification.service.NotificationService;
import com.pulselink.presence.service.PresenceService;
import com.pulselink.shared.exception.ApiException;

@Service
public class FriendshipService {

    private final FriendshipRepository repository;
    private final PresenceService presenceService;
    private final NotificationService notificationService;

    public FriendshipService(
            FriendshipRepository repository,
            PresenceService presenceService,
            NotificationService notificationService
    ) {
        this.repository = repository;
        this.presenceService = presenceService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<PersonResponse> search(UUID currentUserId, String query) {
        String normalized = query == null ? "" : query.trim();
        return repository.search(currentUserId, normalized).stream()
                .map(person -> new PersonResponse(
                        person.id(),
                        person.username(),
                        person.displayName(),
                        person.avatarUrl(),
                        person.bio(),
                        presenceService.isOnline(person.id()),
                        person.relationshipStatus()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public FriendRequestsResponse requests(UUID currentUserId) {
        return new FriendRequestsResponse(
                repository.received(currentUserId),
                repository.sent(currentUserId)
        );
    }

    @Transactional
    public void sendRequest(UUID currentUserId, UUID targetId) {
        requireDifferentUsers(currentUserId, targetId);
        if (!repository.canReceiveFriendRequests(targetId)) {
            throw ApiException.conflict(
                    "FRIEND_REQUESTS_DISABLED",
                    "This person is not accepting friend requests."
            );
        }
        if (repository.isBlockedEitherWay(currentUserId, targetId)) {
            throw ApiException.forbidden("RELATIONSHIP_BLOCKED", "This relationship is blocked.");
        }
        if (repository.createRequest(currentUserId, targetId) == 0) {
            throw ApiException.conflict(
                    "RELATIONSHIP_EXISTS",
                    "A friendship or pending request already exists."
            );
        }
        notificationService.create(
                targetId,
                "FRIEND_REQUEST",
                "New friend request",
                repository.displayName(currentUserId) + " sent you a friend request.",
                Map.of("requesterId", currentUserId.toString())
        );
    }

    @Transactional
    public void accept(UUID currentUserId, UUID requesterId) {
        requireDifferentUsers(currentUserId, requesterId);
        if (repository.accept(currentUserId, requesterId) == 0) {
            throw ApiException.notFound("FRIEND_REQUEST_NOT_FOUND", "Friend request was not found.");
        }
        notificationService.create(
                requesterId,
                "FRIEND_REQUEST_ACCEPTED",
                "Friend request accepted",
                repository.displayName(currentUserId) + " accepted your friend request.",
                Map.of("friendId", currentUserId.toString())
        );
    }

    @Transactional
    public void declineOrCancel(UUID currentUserId, UUID otherUserId) {
        if (repository.deleteRelationship(currentUserId, otherUserId, "PENDING") == 0) {
            throw ApiException.notFound("FRIEND_REQUEST_NOT_FOUND", "Friend request was not found.");
        }
    }

    @Transactional
    public void removeFriend(UUID currentUserId, UUID otherUserId) {
        if (repository.deleteRelationship(currentUserId, otherUserId, "ACCEPTED") == 0) {
            throw ApiException.notFound("FRIENDSHIP_NOT_FOUND", "Friendship was not found.");
        }
    }

    @Transactional
    public void block(UUID currentUserId, UUID targetId) {
        requireDifferentUsers(currentUserId, targetId);
        repository.block(currentUserId, targetId);
    }

    @Transactional
    public void unblock(UUID currentUserId, UUID targetId) {
        if (repository.unblock(currentUserId, targetId) == 0) {
            throw ApiException.notFound("BLOCK_NOT_FOUND", "Block was not found.");
        }
    }

    private void requireDifferentUsers(UUID currentUserId, UUID targetId) {
        if (currentUserId.equals(targetId)) {
            throw ApiException.badRequest("SELF_RELATIONSHIP", "You cannot perform this action on yourself.");
        }
    }
}
