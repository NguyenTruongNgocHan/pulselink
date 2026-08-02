package com.pulselink.storage.dto;

import java.util.UUID;

public record StoredFileResponse(
        UUID id,
        String fileName,
        String mimeType,
        long sizeBytes,
        String downloadUrl
) { }
