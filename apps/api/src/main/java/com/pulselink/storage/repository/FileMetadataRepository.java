package com.pulselink.storage.repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class FileMetadataRepository {

    private final JdbcTemplate jdbc;

    public FileMetadataRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void createStaged(
            UUID id,
            UUID conversationId,
            UUID uploaderId,
            String objectKey,
            String fileName,
            String mimeType,
            long sizeBytes
    ) {
        jdbc.update("""
                insert into message_attachments(
                  id,conversation_id,uploader_id,object_key,file_name,mime_type,size_bytes,status
                ) values(?,?,?,?,?,?,?,'STAGED')
                """, id, conversationId, uploaderId, objectKey, fileName, mimeType, sizeBytes);
    }

    public Optional<FileRow> findAttachment(UUID id) {
        return jdbc.query("""
                select a.id,a.conversation_id,a.uploader_id,a.object_key,a.file_name,
                       a.mime_type,a.size_bytes,a.status,a.created_at
                from message_attachments a
                where a.id=? and a.status<>'DELETED'
                  and (a.message_id is null or exists (
                    select 1 from messages m
                    where m.id=a.message_id and m.deleted_at is null and m.moderated_at is null
                  ))
                """, (rs, rowNum) -> new FileRow(
                rs.getObject("id", UUID.class),
                rs.getObject("conversation_id", UUID.class),
                rs.getObject("uploader_id", UUID.class),
                rs.getString("object_key"),
                rs.getString("file_name"),
                rs.getString("mime_type"),
                rs.getLong("size_bytes"),
                rs.getString("status"),
                instant(rs.getTimestamp("created_at"))
        ), id).stream().findFirst();
    }

    public String avatarObjectKey(UUID userId) {
        return jdbc.query("select avatar_object_key from users where id=?",
                (rs, rowNum) -> rs.getString("avatar_object_key"), userId)
                .stream().findFirst().orElse(null);
    }

    public void updateAvatar(UUID userId, String objectKey) {
        jdbc.update("update users set avatar_object_key=?,updated_at=now() where id=?",
                objectKey, userId);
    }

    public List<FileRow> staleStaged(Instant before) {
        return jdbc.query("""
                select id,conversation_id,uploader_id,object_key,file_name,mime_type,size_bytes,status,created_at
                from message_attachments
                where status='STAGED' and created_at<?
                limit 200
                """, (rs, rowNum) -> new FileRow(
                rs.getObject("id", UUID.class),
                rs.getObject("conversation_id", UUID.class),
                rs.getObject("uploader_id", UUID.class),
                rs.getString("object_key"),
                rs.getString("file_name"),
                rs.getString("mime_type"),
                rs.getLong("size_bytes"),
                rs.getString("status"),
                instant(rs.getTimestamp("created_at"))
        ), Timestamp.from(before));
    }

    public void markDeleted(UUID id) {
        jdbc.update("update message_attachments set status='DELETED',updated_at=now() where id=?", id);
    }

    public List<FileRow> deletedFiles(Instant before) {
        return jdbc.query("""
                select id,conversation_id,uploader_id,object_key,file_name,mime_type,size_bytes,status,created_at
                from message_attachments
                where status='DELETED' and updated_at<?
                limit 200
                """, (rs, rowNum) -> new FileRow(
                rs.getObject("id", UUID.class),
                rs.getObject("conversation_id", UUID.class),
                rs.getObject("uploader_id", UUID.class),
                rs.getString("object_key"),
                rs.getString("file_name"),
                rs.getString("mime_type"),
                rs.getLong("size_bytes"),
                rs.getString("status"),
                instant(rs.getTimestamp("created_at"))
        ), Timestamp.from(before));
    }

    public void deleteMetadata(UUID id) {
        jdbc.update("delete from message_attachments where id=? and status='DELETED'", id);
    }

    public record FileRow(
            UUID id,
            UUID conversationId,
            UUID uploaderId,
            String objectKey,
            String fileName,
            String mimeType,
            long sizeBytes,
            String status,
            Instant createdAt
    ) { }

    private static Instant instant(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toInstant();
    }
}
