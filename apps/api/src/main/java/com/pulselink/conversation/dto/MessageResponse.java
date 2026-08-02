package com.pulselink.conversation.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record MessageResponse(
        UUID id,
        UUID conversationId,
        UUID senderId,
        String senderName,
        String senderUsername,
        String senderAvatarUrl,
        String content,
        Instant createdAt,
        Instant editedAt,
        Instant deletedAt,
        Instant moderatedAt,
        String clientMessageId,
        List<MessageAttachmentResponse> attachments,
        List<MessageReactionResponse> reactions,
        List<MessageReceiptResponse> receipts,
        boolean savedByMe
) { }
