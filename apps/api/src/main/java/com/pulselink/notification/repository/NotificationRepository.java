package com.pulselink.notification.repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.pulselink.notification.dto.NotificationResponse;
import com.pulselink.shared.json.JsonSupport;

@Repository
public class NotificationRepository {

    private final JdbcTemplate jdbc;
    private final JsonSupport jsonSupport;

    public NotificationRepository(JdbcTemplate jdbc, JsonSupport jsonSupport) {
        this.jdbc = jdbc;
        this.jsonSupport = jsonSupport;
    }

    public List<NotificationResponse> list(UUID userId, boolean unreadOnly) {
        return jdbc.query("""
                select id,type,title,body,payload_jsonb::text payload,read_at,created_at
                from notifications
                where user_id=? and (?=false or read_at is null)
                order by created_at desc
                limit 100
                """, (rs, rowNum) -> new NotificationResponse(
                rs.getObject("id", UUID.class),
                rs.getString("type"),
                rs.getString("title"),
                rs.getString("body"),
                jsonSupport.map(rs.getString("payload")),
                instant(rs.getTimestamp("read_at")),
                instant(rs.getTimestamp("created_at"))
        ), userId, unreadOnly);
    }

    public long unreadCount(UUID userId) {
        Long count = jdbc.queryForObject(
                "select count(*) from notifications where user_id=? and read_at is null",
                Long.class,
                userId
        );
        return count == null ? 0 : count;
    }

    public int markRead(UUID notificationId, UUID userId) {
        return jdbc.update("""
                update notifications set read_at=coalesce(read_at,now())
                where id=? and user_id=?
                """, notificationId, userId);
    }

    public void markAllRead(UUID userId) {
        jdbc.update("""
                update notifications set read_at=coalesce(read_at,now())
                where user_id=? and read_at is null
                """, userId);
    }

    public NotificationResponse create(
            UUID userId,
            String type,
            String title,
            String body,
            Map<String, Object> payload
    ) {
        UUID notificationId = UUID.randomUUID();
        Instant createdAt = Instant.now();
        Map<String, Object> safePayload = payload == null ? Map.of() : Map.copyOf(payload);
        jdbc.update("""
                insert into notifications(
                  id,user_id,type,title,body,payload_jsonb,created_at
                ) values(?,?,?,?,?,cast(? as jsonb),?)
                """,
                notificationId,
                userId,
                type,
                title,
                body,
                jsonSupport.stringify(safePayload),
                Timestamp.from(createdAt)
        );
        return new NotificationResponse(
                notificationId,
                type,
                title,
                body,
                safePayload,
                null,
                createdAt
        );
    }

    private static Instant instant(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toInstant();
    }
}
