package com.pulselink.storage.service;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import com.pulselink.conversation.service.ConversationAccessService;
import com.pulselink.shared.exception.ApiException;
import com.pulselink.storage.dto.StoredFileResponse;
import com.pulselink.storage.repository.FileMetadataRepository;
import com.pulselink.storage.repository.FileMetadataRepository.FileRow;

@Service
public class FileService {

    private static final long MAX_FILE_BYTES = 10L * 1024L * 1024L;
    private static final long MAX_AVATAR_BYTES = 5L * 1024L * 1024L;

    private static final Duration STAGED_FILE_RETENTION = Duration.ofHours(24);
    private static final Duration DELETED_METADATA_RETENTION = Duration.ofHours(1);

    private static final Set<String> ALLOWED_ATTACHMENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "application/pdf",
            "text/plain",
            "text/csv",
            "application/zip",
            "application/x-zip-compressed"
    );

    private static final Set<String> ALLOWED_AVATAR_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private static final Map<String, String> EXTENSIONS = Map.ofEntries(
            Map.entry("image/jpeg", ".jpg"),
            Map.entry("image/png", ".png"),
            Map.entry("image/webp", ".webp"),
            Map.entry("image/gif", ".gif"),
            Map.entry("application/pdf", ".pdf"),
            Map.entry("text/plain", ".txt"),
            Map.entry("text/csv", ".csv"),
            Map.entry("application/zip", ".zip"),
            Map.entry("application/x-zip-compressed", ".zip")
    );

    private final FileMetadataRepository repository;
    private final ObjectStorage storage;
    private final ConversationAccessService conversationAccessService;
    private final FileSignatureDetector signatureDetector;

    public FileService(
            FileMetadataRepository repository,
            ObjectStorage storage,
            ConversationAccessService conversationAccessService,
            FileSignatureDetector signatureDetector
    ) {
        this.repository = repository;
        this.storage = storage;
        this.conversationAccessService = conversationAccessService;
        this.signatureDetector = signatureDetector;
    }

    @Transactional
    public StoredFileResponse uploadAttachment(
            UUID currentUserId,
            UUID conversationId,
            MultipartFile file
    ) {
        requireConversationMembership(currentUserId, conversationId);

        String mimeType = validate(
                file,
                MAX_FILE_BYTES,
                ALLOWED_ATTACHMENT_TYPES
        );

        UUID attachmentId = UUID.randomUUID();
        String objectKey = createObjectKey(
                "attachment",
                attachmentId,
                mimeType
        );
        String fileName = sanitizeFileName(file.getOriginalFilename());

        store(file, objectKey);

        try {
            repository.createStaged(
                    attachmentId,
                    conversationId,
                    currentUserId,
                    objectKey,
                    fileName,
                    mimeType,
                    file.getSize()
            );
        } catch (RuntimeException exception) {
            deleteQuietly(objectKey);
            throw exception;
        }

        return new StoredFileResponse(
                attachmentId,
                fileName,
                mimeType,
                file.getSize(),
                "/api/v1/files/" + attachmentId
        );
    }

    @Transactional
    public String uploadAvatar(
            UUID currentUserId,
            MultipartFile file
    ) {
        String mimeType = validate(
                file,
                MAX_AVATAR_BYTES,
                ALLOWED_AVATAR_TYPES
        );

        UUID avatarId = UUID.randomUUID();
        String objectKey = createObjectKey(
                "avatar",
                avatarId,
                mimeType
        );

        String previousObjectKey =
                repository.avatarObjectKey(currentUserId);

        store(file, objectKey);

        try {
            repository.updateAvatar(currentUserId, objectKey);
        } catch (RuntimeException exception) {
            deleteQuietly(objectKey);
            throw exception;
        }

        deletePreviousAvatarAfterCommit(previousObjectKey);

        return "/api/v1/files/avatar/" + objectKey;
    }

    @Transactional(readOnly = true)
    public DownloadedFile downloadAttachment(
            UUID currentUserId,
            UUID attachmentId
    ) {
        FileRow row = repository.findAttachment(attachmentId)
                .orElseThrow(() -> ApiException.notFound(
                        "FILE_NOT_FOUND",
                        "File was not found."
                ));

        requireConversationMembership(
                currentUserId,
                row.conversationId()
        );

        return new DownloadedFile(
                storage.load(row.objectKey()),
                row.fileName(),
                row.mimeType(),
                row.sizeBytes()
        );
    }

    @Transactional(readOnly = true)
    public DownloadedFile downloadAvatar(String objectKey) {
        validateAvatarObjectKey(objectKey);

        return new DownloadedFile(
                storage.load(objectKey),
                objectKey,
                contentTypeFromName(objectKey),
                -1
        );
    }

    /**
     * Removes file objects that were uploaded but never attached to a message,
     * then removes metadata for files that were already marked as deleted.
     *
     * Scheduling is intentionally handled by StorageCleanupJob so that the
     * background process can be disabled in tests and selected environments.
     */
    @Transactional
    public void cleanupStagedFiles() {
        Instant now = Instant.now();
        Instant stagedBefore = now.minus(STAGED_FILE_RETENTION);
        Instant deletedBefore = now.minus(DELETED_METADATA_RETENTION);

        repository.staleStaged(stagedBefore).forEach(file -> {
            deleteQuietly(file.objectKey());
            repository.markDeleted(file.id());
        });

        repository.deletedFiles(deletedBefore).forEach(file -> {
            deleteQuietly(file.objectKey());
            repository.deleteMetadata(file.id());
        });
    }

    private void requireConversationMembership(
            UUID currentUserId,
            UUID conversationId
    ) {
        if (!conversationAccessService.isMember(
                conversationId,
                currentUserId
        )) {
            throw ApiException.forbidden(
                    "CONVERSATION_ACCESS_DENIED",
                    "You cannot access files in this conversation."
            );
        }
    }

    private String validate(
            MultipartFile file,
            long maxBytes,
            Set<String> allowedTypes
    ) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest(
                    "FILE_EMPTY",
                    "Choose a non-empty file."
            );
        }

        if (file.getSize() > maxBytes) {
            throw ApiException.badRequest(
                    "FILE_TOO_LARGE",
                    "The selected file is too large."
            );
        }

        String detectedType;

        try {
            detectedType = signatureDetector.detect(file);
        } catch (IOException exception) {
            throw ApiException.badRequest(
                    "FILE_UNREADABLE",
                    "The selected file could not be read."
            );
        }

        if (!allowedTypes.contains(detectedType)) {
            throw ApiException.badRequest(
                    "FILE_TYPE_NOT_ALLOWED",
                    "The file content does not match a supported file type."
            );
        }

        return detectedType;
    }

    private String createObjectKey(
            String prefix,
            UUID id,
            String mimeType
    ) {
        String extension = EXTENSIONS.getOrDefault(mimeType, ".bin");
        return prefix + "-" + id + extension;
    }

    private void store(
            MultipartFile file,
            String objectKey
    ) {
        try {
            storage.store(objectKey, file.getInputStream());
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Unable to store uploaded file.",
                    exception
            );
        }
    }

    private void deletePreviousAvatarAfterCommit(
            String previousObjectKey
    ) {
        if (previousObjectKey == null || previousObjectKey.isBlank()) {
            return;
        }

        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            deleteQuietly(previousObjectKey);
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        deleteQuietly(previousObjectKey);
                    }
                }
        );
    }

    private void deleteQuietly(String objectKey) {
        try {
            storage.delete(objectKey);
        } catch (RuntimeException exception) {
            /*
             * The database state must not be rolled back simply because an
             * already-orphaned local object could not be removed. In a full
             * production deployment this should also be emitted as a metric
             * or structured warning.
             */
        }
    }

    private void validateAvatarObjectKey(String objectKey) {
        if (objectKey == null
                || !objectKey.matches(
                        "^avatar-[a-fA-F0-9-]+\\.(jpg|png|webp)$"
                )) {
            throw ApiException.badRequest(
                    "INVALID_AVATAR_KEY",
                    "Invalid avatar key."
            );
        }
    }

    private String sanitizeFileName(String originalName) {
        String candidate =
                originalName == null ? "attachment" : originalName;

        candidate = candidate.replace('\\', '/');
        candidate = candidate.substring(
                candidate.lastIndexOf('/') + 1
        );
        candidate = candidate.replaceAll("[\\r\\n\\t]", "_");
        candidate = candidate
                .replaceAll("[^\\p{L}\\p{N}._()\\- ]", "_")
                .trim();

        if (candidate.isBlank()) {
            return "attachment";
        }

        if (candidate.length() > 180) {
            return candidate.substring(candidate.length() - 180);
        }

        return candidate;
    }

    private String contentTypeFromName(String objectKey) {
        if (objectKey.endsWith(".png")) {
            return MediaTypes.PNG;
        }

        if (objectKey.endsWith(".webp")) {
            return MediaTypes.WEBP;
        }

        return MediaTypes.JPEG;
    }

    public record DownloadedFile(
            Resource resource,
            String fileName,
            String mimeType,
            long sizeBytes
    ) {
    }

    private static final class MediaTypes {

        private static final String JPEG = "image/jpeg";
        private static final String PNG = "image/png";
        private static final String WEBP = "image/webp";

        private MediaTypes() {
        }
    }
}