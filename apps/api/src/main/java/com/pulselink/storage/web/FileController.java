package com.pulselink.storage.web;

import java.util.Map;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.pulselink.shared.auth.CurrentUser;
import com.pulselink.storage.dto.StoredFileResponse;
import com.pulselink.storage.service.FileService;
import com.pulselink.storage.service.FileService.DownloadedFile;

import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Private file storage")
public class FileController {

    private final FileService fileService;
    private final CurrentUser currentUser;

    public FileController(FileService fileService, CurrentUser currentUser) {
        this.fileService = fileService;
        this.currentUser = currentUser;
    }

    @PostMapping(value = "/files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public StoredFileResponse uploadAttachment(
            @RequestParam MultipartFile file,
            @RequestParam UUID conversationId,
            Authentication authentication
    ) {
        return fileService.uploadAttachment(currentUser.id(authentication), conversationId, file);
    }

    @GetMapping("/files/{attachmentId}")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable UUID attachmentId,
            Authentication authentication
    ) {
        return response(fileService.downloadAttachment(currentUser.id(authentication), attachmentId));
    }

    @PostMapping(value = "/profile/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> uploadAvatar(
            @RequestParam MultipartFile file,
            Authentication authentication
    ) {
        return Map.of("avatarUrl", fileService.uploadAvatar(currentUser.id(authentication), file));
    }

    @GetMapping("/files/avatar/{objectKey}")
    public ResponseEntity<Resource> avatar(@PathVariable String objectKey) {
        return response(fileService.downloadAvatar(objectKey));
    }

    private ResponseEntity<Resource> response(DownloadedFile file) {
        ContentDisposition disposition = ContentDisposition.inline()
                .filename(file.fileName())
                .build();
        ResponseEntity.BodyBuilder builder = ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.mimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .header("X-Content-Type-Options", "nosniff")
                .cacheControl(org.springframework.http.CacheControl.noStore());
        if (file.sizeBytes() >= 0) {
            builder.contentLength(file.sizeBytes());
        }
        return builder.body(file.resource());
    }
}
