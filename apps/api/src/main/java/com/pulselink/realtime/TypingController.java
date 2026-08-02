package com.pulselink.realtime;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.pulselink.conversation.service.ConversationAccessService;

@Controller
public class TypingController {

    private final ConversationAccessService conversationAccessService;
    private final SimpMessagingTemplate broker;
    private final JdbcTemplate jdbc;

    public TypingController(
            ConversationAccessService conversationAccessService,
            SimpMessagingTemplate broker,
            JdbcTemplate jdbc
    ) {
        this.conversationAccessService = conversationAccessService;
        this.broker = broker;
        this.jdbc = jdbc;
    }

    @MessageMapping("/conversations/{conversationId}/typing")
    public void typing(
            @DestinationVariable UUID conversationId,
            Map<String, Object> payload,
            Principal principal
    ) {
        if (principal == null) {
            return;
        }
        UUID userId = UUID.fromString(principal.getName());
        if (!conversationAccessService.isMember(conversationId, userId) || !typingEnabled(userId)) {
            return;
        }
        broker.convertAndSend(
                "/topic/conversations/" + conversationId,
                Map.of(
                        "type", "TYPING",
                        "conversationId", conversationId,
                        "userId", userId,
                        "displayName", conversationAccessService.displayName(userId),
                        "typing", Boolean.TRUE.equals(payload.get("typing"))
                )
        );
    }

    private boolean typingEnabled(UUID userId) {
        Boolean enabled = jdbc.queryForObject(
                "select show_typing_indicators from users where id=?",
                Boolean.class,
                userId
        );
        return Boolean.TRUE.equals(enabled);
    }
}
