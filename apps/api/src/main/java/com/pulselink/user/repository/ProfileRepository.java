package com.pulselink.user.repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.pulselink.user.dto.ProfileResponse;

@Repository
public class ProfileRepository {

    private final JdbcTemplate jdbc;

    public ProfileRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<ProfileRow> profile(UUID userId) {
        return jdbc.query("""
                select id,username,email,display_name,bio,avatar_object_key,role,status,created_at
                from users where id=?
                """, (rs, rowNum) -> new ProfileRow(
                rs.getObject("id", UUID.class),
                rs.getString("username"),
                rs.getString("email"),
                rs.getString("display_name"),
                rs.getString("bio"),
                rs.getString("avatar_object_key"),
                rs.getString("role"),
                rs.getString("status"),
                instant(rs.getTimestamp("created_at"))
        ), userId).stream().findFirst();
    }

    public void update(UUID userId, String displayName, String bio) {
        jdbc.update("""
                update users set display_name=?,bio=?,updated_at=now() where id=?
                """, displayName, bio, userId);
    }

    public ProfileResponse.Stats stats(UUID userId) {
        long messages = value("select count(*) from messages where sender_id=?", userId);
        long groups = value("""
                select count(*) from conversation_participants cp
                join conversations c on c.id=cp.conversation_id
                where cp.user_id=? and cp.left_at is null and c.type='GROUP'
                """, userId);
        long connections = value("""
                select count(*) from friendships
                where status='ACCEPTED' and (user_low_id=? or user_high_id=?)
                """, userId, userId);
        long reports = value("select count(*) from reports where reporter_id=?", userId);
        return new ProfileResponse.Stats(messages, groups, connections, reports);
    }

    public List<ProfileResponse.Media> recentMedia(UUID userId) {
        return jdbc.query("""
                select id,file_name,mime_type
                from message_attachments
                where uploader_id=? and status='READY'
                order by created_at desc limit 12
                """, (rs, rowNum) -> new ProfileResponse.Media(
                rs.getObject("id", UUID.class),
                rs.getString("file_name"),
                rs.getString("mime_type"),
                "/api/v1/files/" + rs.getObject("id", UUID.class)
        ), userId);
    }

    public List<ProfileResponse.Group> groups(UUID userId) {
        return jdbc.query("""
                select c.id,c.name
                from conversations c
                join conversation_participants cp on cp.conversation_id=c.id
                where cp.user_id=? and cp.left_at is null and c.type='GROUP'
                order by c.updated_at desc limit 8
                """, (rs, rowNum) -> new ProfileResponse.Group(
                rs.getObject("id", UUID.class),
                rs.getString("name")
        ), userId);
    }

    public void deactivate(UUID userId, String reason) {
        jdbc.update("""
                update users
                set status='DISABLED',deactivated_reason=?,token_version=token_version+1,updated_at=now()
                where id=?
                """, reason, userId);
        jdbc.update("""
                update refresh_tokens set revoked=true,revoked_at=now()
                where user_id=? and revoked=false
                """, userId);
    }

    private long value(String sql, Object... args) {
        Long value = jdbc.queryForObject(sql, Long.class, args);
        return value == null ? 0 : value;
    }

    private static Instant instant(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toInstant();
    }

    public record ProfileRow(
            UUID id,
            String username,
            String email,
            String displayName,
            String bio,
            String avatarObjectKey,
            String role,
            String status,
            Instant createdAt
    ) { }
}
