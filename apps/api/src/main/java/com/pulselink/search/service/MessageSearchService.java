package com.pulselink.search.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pulselink.search.dto.MessageSearchResponse;
import com.pulselink.search.repository.MessageSearchRepository;

@Service
public class MessageSearchService {

    private final MessageSearchRepository repository;

    public MessageSearchService(MessageSearchRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<MessageSearchResponse> search(UUID userId, String query, UUID conversationId) {
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }
        return repository.search(userId, query.trim(), conversationId);
    }
}
