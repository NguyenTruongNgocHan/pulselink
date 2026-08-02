package com.pulselink.conversation.dto;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SendMessageRequest(
        @Size(max = 4000) String content,
        @NotBlank @Size(max = 80) String clientMessageId,
        @Size(max = 10) List<UUID> attachmentIds
) {
    public SendMessageRequest {
        attachmentIds = attachmentIds == null ? List.of() : List.copyOf(attachmentIds);
    }
}
