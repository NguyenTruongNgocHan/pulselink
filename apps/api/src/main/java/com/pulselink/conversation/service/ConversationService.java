package com.pulselink.conversation.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pulselink.conversation.dto.ConversationParticipantResponse;
import com.pulselink.conversation.dto.ConversationRealtimeEvent;
import com.pulselink.conversation.dto.ConversationResponse;
import com.pulselink.conversation.dto.MessageResponse;
import com.pulselink.conversation.dto.SendMessageRequest;
import com.pulselink.conversation.repository.ConversationRepository;
import com.pulselink.conversation.repository.ConversationRepository.ConversationRow;
import com.pulselink.conversation.repository.ConversationRepository.MessageRow;
import com.pulselink.presence.service.PresenceService;
import com.pulselink.privacy.repository.PrivacyRepository;
import com.pulselink.shared.exception.ApiException;
import com.pulselink.realtime.service.RealtimeEventPublisher;

@Service
public class ConversationService {

    private final ConversationRepository repository;
    private final PresenceService presenceService;
    private final PrivacyRepository privacyRepository;
    private final RealtimeEventPublisher realtimeEvents;

    public ConversationService(
            ConversationRepository repository,
            PresenceService presenceService,
            PrivacyRepository privacyRepository,
            RealtimeEventPublisher realtimeEvents
    ) {
        this.repository = repository;
        this.presenceService = presenceService;
        this.privacyRepository = privacyRepository;
        this.realtimeEvents = realtimeEvents;
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> list(UUID currentUserId) {
        return repository.list(currentUserId).stream()
                .map(this::toConversation)
                .toList();
    }

    @Transactional(readOnly = true)
    public ConversationResponse get(UUID conversationId, UUID currentUserId) {
        ConversationRow row = repository.find(conversationId, currentUserId)
                .orElseThrow(() -> ApiException.notFound(
                        "CONVERSATION_NOT_FOUND",
                        "Conversation was not found."
                ));
        return toConversation(row);
    }

    @Transactional
    public ConversationResponse createDirect(UUID currentUserId, UUID otherUserId) {
        if (currentUserId.equals(otherUserId)) {
            throw ApiException.badRequest(
                    "DIRECT_CONVERSATION_SELF",
                    "A direct conversation requires another person."
            );
        }
        if (!repository.canStartDirect(currentUserId, otherUserId)) {
            throw ApiException.forbidden(
                    "DIRECT_MESSAGES_UNAVAILABLE",
                    "A direct conversation cannot be started with this person."
            );
        }
        UUID conversationId = repository.directConversationId(currentUserId, otherUserId)
                .orElseGet(() -> repository.createDirect(currentUserId, otherUserId));
        return get(conversationId, currentUserId);
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> messages(UUID conversationId, UUID currentUserId) {
        requireMember(conversationId, currentUserId);
        return repository.messages(conversationId).stream()
                .map(row -> toMessage(row, currentUserId))
                .toList();
    }

    @Transactional
    public MessageResponse send(
            UUID conversationId,
            UUID currentUserId,
            SendMessageRequest request
    ) {
        requireMember(conversationId, currentUserId);
        if (!repository.isConversationActive(conversationId)) {
            throw ApiException.conflict(
                    "CONVERSATION_CLOSED",
                    "This conversation is closed and cannot receive new messages."
            );
        }
        String content = request.content() == null ? "" : request.content().trim();
        if (content.isBlank() && request.attachmentIds().isEmpty()) {
            throw ApiException.badRequest(
                    "MESSAGE_EMPTY",
                    "A message must contain text or at least one attachment."
            );
        }

        var existingMessageId = repository.findMessageByClientId(
                conversationId,
                currentUserId,
                request.clientMessageId()
        );
        if (existingMessageId.isPresent()) {
            return getMessage(existingMessageId.get(), currentUserId);
        }

        UUID messageId = repository.insertMessage(
                conversationId,
                currentUserId,
                request.clientMessageId(),
                content.isBlank() ? null : content
        );
        int attached = repository.attachStagedFiles(
                messageId,
                conversationId,
                currentUserId,
                request.attachmentIds()
        );
        if (attached != request.attachmentIds().size()) {
            throw ApiException.badRequest(
                    "ATTACHMENT_NOT_AVAILABLE",
                    "One or more attachments are invalid or no longer available."
            );
        }

        MessageResponse message = getMessage(messageId, currentUserId);
        publish("MESSAGE_CREATED", message);
        return message;
    }

    @Transactional
    public MessageResponse edit(UUID messageId, UUID currentUserId, String content) {
        String normalized = content == null ? "" : content.trim();
        if (normalized.isBlank()) {
            throw ApiException.badRequest("MESSAGE_EMPTY", "Message content cannot be empty.");
        }
        requireMessageMember(messageId, currentUserId);
        if (repository.editMessage(messageId, currentUserId, normalized) == 0) {
            throw ApiException.forbidden(
                    "MESSAGE_EDIT_NOT_ALLOWED",
                    "Only the sender can edit an active message."
            );
        }
        MessageResponse message = getMessage(messageId, currentUserId);
        publish("MESSAGE_UPDATED", message);
        return message;
    }

    @Transactional
    public void delete(UUID messageId, UUID currentUserId) {
        requireMessageMember(messageId, currentUserId);
        if (repository.deleteMessage(messageId, currentUserId) == 0) {
            throw ApiException.forbidden(
                    "MESSAGE_DELETE_NOT_ALLOWED",
                    "Only the sender can delete this message."
            );
        }
        repository.removeMessageArtifacts(messageId);
        MessageResponse message = getMessage(messageId, currentUserId);
        publish("MESSAGE_DELETED", message);
    }

    @Transactional
    public void react(UUID messageId, UUID currentUserId, String emoji) {
        requireMessageMember(messageId, currentUserId);
        repository.upsertReaction(messageId, currentUserId, emoji.trim());
        MessageResponse message = getMessage(messageId, currentUserId);
        publish("REACTION_UPDATED", message);
    }

    @Transactional
    public void removeReaction(UUID messageId, UUID currentUserId) {
        requireMessageMember(messageId, currentUserId);
        repository.deleteReaction(messageId, currentUserId);
        MessageResponse message = getMessage(messageId, currentUserId);
        publish("REACTION_UPDATED", message);
    }

    @Transactional
    public void markRead(UUID conversationId, UUID currentUserId) {
        requireMember(conversationId, currentUserId);
        repository.latestMessageId(conversationId).ifPresent(messageId -> {
            boolean shareReceipt = privacyRepository.sendsReadReceipts(currentUserId);
            repository.markRead(conversationId, currentUserId, messageId, shareReceipt);
            if (shareReceipt) {
                MessageResponse message = getMessage(messageId, currentUserId);
                publish("READ_UPDATED", message);
            }
        });
    }

    @Transactional
    public void save(UUID messageId, UUID currentUserId) {
        requireMessageMember(messageId, currentUserId);
        repository.saveMessage(messageId, currentUserId);
    }

    @Transactional
    public void unsave(UUID messageId, UUID currentUserId) {
        requireMessageMember(messageId, currentUserId);
        repository.unsaveMessage(messageId, currentUserId);
    }

    @Transactional(readOnly = true)
    public boolean isMember(UUID conversationId, UUID userId) {
        return repository.isActiveMember(conversationId, userId);
    }

    @Transactional(readOnly = true)
    public String displayName(UUID userId) {
        return repository.displayName(userId);
    }

    private MessageRow requireMessageMember(UUID messageId, UUID currentUserId) {
        MessageRow message = repository.message(messageId)
                .orElseThrow(() -> ApiException.notFound(
                        "MESSAGE_NOT_FOUND",
                        "Message was not found."
                ));
        requireMember(message.conversationId(), currentUserId);
        return message;
    }

    private MessageResponse getMessage(UUID messageId, UUID currentUserId) {
        MessageRow row = repository.message(messageId)
                .orElseThrow(() -> ApiException.notFound(
                        "MESSAGE_NOT_FOUND",
                        "Message was not found."
                ));
        return toMessage(row, currentUserId);
    }

    private void requireMember(UUID conversationId, UUID currentUserId) {
        if (!repository.isActiveMember(conversationId, currentUserId)) {
            throw ApiException.forbidden(
                    "CONVERSATION_ACCESS_DENIED",
                    "You are not an active member of this conversation."
            );
        }
    }

    private ConversationResponse toConversation(ConversationRow row) {
        List<ConversationParticipantResponse> participants = repository.participants(row.id()).stream()
                .map(participant -> new ConversationParticipantResponse(
                        participant.id(),
                        participant.username(),
                        participant.displayName(),
                        participant.avatarUrl(),
                        participant.role(),
                        presenceService.isOnline(participant.id())
                ))
                .toList();
        String name = "DIRECT".equals(row.type())
                ? defaultText(row.directName(), "Conversation")
                : defaultText(row.name(), "Untitled group");
        String avatar = "DIRECT".equals(row.type())
                ? avatarUrl(row.directAvatarObjectKey())
                : avatarUrl(row.avatarObjectKey());
        return new ConversationResponse(
                row.id(),
                row.type(),
                name,
                avatar,
                row.status(),
                row.preview(),
                row.latestMessageAt(),
                row.unreadCount(),
                row.memberCount(),
                participants
        );
    }

    private MessageResponse toMessage(MessageRow row, UUID currentUserId) {
        return new MessageResponse(
                row.id(),
                row.conversationId(),
                row.senderId(),
                row.senderName(),
                row.senderUsername(),
                avatarUrl(row.senderAvatarObjectKey()),
                row.deletedAt() == null && row.moderatedAt() == null ? row.content() : null,
                row.createdAt(),
                row.editedAt(),
                row.deletedAt(),
                row.moderatedAt(),
                row.clientMessageId(),
                row.deletedAt() == null && row.moderatedAt() == null
                        ? repository.attachments(row.id())
                        : List.of(),
                row.deletedAt() == null && row.moderatedAt() == null
                        ? repository.reactions(row.id(), currentUserId)
                        : List.of(),
                repository.receipts(row.id()),
                repository.savedBy(row.id(), currentUserId)
        );
    }

    private void publish(String type, MessageResponse message) {
        realtimeEvents.publishConversation(
                message.conversationId(),
                new ConversationRealtimeEvent(type, message.conversationId(), message)
        );
    }

    private String avatarUrl(String objectKey) {
        return objectKey == null ? null : "/api/v1/files/avatar/" + objectKey;
    }

    private String defaultText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
