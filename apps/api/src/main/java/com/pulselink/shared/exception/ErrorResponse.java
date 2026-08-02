package com.pulselink.shared.exception;

import java.time.Instant;
import java.util.Map;

public record ErrorResponse(
        String code,
        String message,
        Instant timestamp,
        Map<String, String> fieldErrors
) {
    public static ErrorResponse of(String code, String message) {
        return new ErrorResponse(code, message, Instant.now(), Map.of());
    }

    public static ErrorResponse ofFieldErrors(String message, Map<String, String> fieldErrors) {
        return new ErrorResponse("VALIDATION_ERROR", message, Instant.now(), fieldErrors);
    }
}
