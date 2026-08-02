package com.pulselink.saved.repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.pulselink.saved.dto.SavedMessageResponse;

@Repository
public class SavedMessageRepository {

    private final JdbcTemplate jdbc;

    public SavedMessageRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<SavedMessageResponse> list(UUID userId) {
        return jdbc.query("""
                select m.id,m.content,m.created_at,u.display_name sender_name,
                       u.username sender_username,c.id conversation_id,c.type,
                       case when c.type='GROUP' then c.name else
                         (select other.display_name from conversation_participants p
                          join users other on other.id=p.user_id
                          where p.conversation_id=c.id and p.user_id<>? and p.left_at is null limit 1)
                       end conversation_name
                from saved_messages s
                join messages m on m.id=s.message_id
                join users u on u.id=m.sender_id
                join conversations c on c.id=m.conversation_id
                join conversation_participants mine on mine.conversation_id=c.id
                  and mine.user_id=? and mine.left_at is null
                where s.user_id=?
                order by s.created_at desc
                """, (rs, rowNum) -> new SavedMessageResponse(
                rs.getObject("id", UUID.class),
                rs.getString("content"),
                instant(rs.getTimestamp("created_at")),
                rs.getString("sender_name"),
                rs.getString("sender_username"),
                rs.getObject("conversation_id", UUID.class),
                rs.getString("conversation_name"),
                rs.getString("type")
        ), userId, userId, userId);
    }

    private static Instant instant(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toInstant();
    }
}
