package com.pulselink.conversation.dto;

import java.util.UUID;

public record MessageAttachmentResponse(
        UUID id,
        String fileName,
        String mimeType,
        long sizeBytes,
        String downloadUrl
) { }
