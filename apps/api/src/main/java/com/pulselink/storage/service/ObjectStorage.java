package com.pulselink.storage.service;

import java.io.InputStream;

import org.springframework.core.io.Resource;

/**
 * Storage boundary used by the application layer. The local implementation is
 * used by Docker Compose; an S3-compatible implementation can replace it
 * without changing message or profile services.
 */
public interface ObjectStorage {

    void store(String objectKey, InputStream content);

    Resource load(String objectKey);

    void delete(String objectKey);
}
