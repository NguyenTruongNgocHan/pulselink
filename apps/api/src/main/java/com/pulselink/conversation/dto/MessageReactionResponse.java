package com.pulselink.conversation.dto;

public record MessageReactionResponse(
        String emoji,
        long count,
        boolean reactedByMe
) { }
