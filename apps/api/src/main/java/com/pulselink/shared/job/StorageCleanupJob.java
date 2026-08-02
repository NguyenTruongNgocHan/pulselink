package com.pulselink.storage.job;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.pulselink.storage.service.FileService;

@Component
@ConditionalOnProperty(
        prefix = "app.storage.cleanup",
        name = "enabled",
        havingValue = "true",
        matchIfMissing = true
)
public class StorageCleanupJob {

    private final FileService fileService;

    public StorageCleanupJob(FileService fileService) {
        this.fileService = fileService;
    }

    @Scheduled(
            fixedDelayString =
                    "${app.storage.cleanup.delay-ms:3600000}"
    )
    public void cleanupStagedFiles() {
        fileService.cleanupStagedFiles();
    }
}