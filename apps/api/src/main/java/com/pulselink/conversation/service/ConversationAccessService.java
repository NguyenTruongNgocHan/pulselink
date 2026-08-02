package com.pulselink.conversation.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pulselink.conversation.repository.ConversationRepository;

/**
 * Lightweight authorization/read service used by WebSocket infrastructure.
 * It deliberately excludes message publishing and other broker dependencies.
 */
@Service
public class ConversationAccessService {

    private final ConversationRepository repository;

    public ConversationAccessService(ConversationRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public boolean isMember(UUID conversationId, UUID userId) {
        return repository.isActiveMember(conversationId, userId);
    }

    @Transactional(readOnly = true)
    public String displayName(UUID userId) {
        return repository.displayName(userId);
    }
}
