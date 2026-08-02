package com.pulselink.saved.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pulselink.saved.dto.SavedMessageResponse;
import com.pulselink.saved.repository.SavedMessageRepository;

@Service
public class SavedMessageService {

    private final SavedMessageRepository repository;

    public SavedMessageService(SavedMessageRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<SavedMessageResponse> list(UUID userId) {
        return repository.list(userId);
    }
}
