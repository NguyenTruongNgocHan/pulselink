package com.pulselink.storage.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;

import com.pulselink.shared.exception.ApiException;

@Service
public class LocalFileStorageService implements ObjectStorage {

    private final Path root;

    public LocalFileStorageService(@Value("${app.storage.path:/data/uploads}") String storagePath) {
        try {
            this.root = Path.of(storagePath).toAbsolutePath().normalize();
            Files.createDirectories(root);
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to initialize local storage", ex);
        }
    }

    @Override
    public void store(String objectKey, InputStream content) {
        Path target = resolve(objectKey);
        try {
            Files.createDirectories(target.getParent());
            Files.copy(content, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to store file", ex);
        }
    }

    @Override
    public Resource load(String objectKey) {
        Path target = resolve(objectKey);
        try {
            Resource resource = new UrlResource(target.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw ApiException.notFound("FILE_NOT_FOUND", "Stored file was not found.");
            }
            return resource;
        } catch (IOException ex) {
            throw ApiException.notFound("FILE_NOT_FOUND", "Stored file was not found.");
        }
    }

    @Override
    public void delete(String objectKey) {
        try {
            Files.deleteIfExists(resolve(objectKey));
        } catch (IOException ignored) {
            // Metadata remains authoritative; cleanup will retry on the next run.
        }
    }

    private Path resolve(String objectKey) {
        Path target = root.resolve(objectKey).normalize();
        if (!target.startsWith(root)) {
            throw ApiException.badRequest("INVALID_OBJECT_KEY", "Invalid storage object key.");
        }
        return target;
    }
}
