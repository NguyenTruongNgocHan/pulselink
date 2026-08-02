package com.pulselink.search.repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.pulselink.search.dto.MessageSearchResponse;

@Repository
public class MessageSearchRepository {

    private static final String BASE_QUERY = """
            select m.id,
                   m.content,
                   m.created_at,
                   m.edited_at,
                   u.display_name as sender_name,
                   u.username as sender_username,
                   c.id as conversation_id,
                   c.type,
                   case
                       when c.type = 'GROUP' then c.name
                       else (
                           select other.display_name
                           from conversation_participants other_p
                           join users other
                             on other.id = other_p.user_id
                           where other_p.conversation_id = c.id
                             and other_p.user_id <> ?
                             and other_p.left_at is null
                           limit 1
                       )
                   end as conversation_name
            from messages m
            join users u
              on u.id = m.sender_id
            join conversations c
              on c.id = m.conversation_id
            join conversation_participants cp
              on cp.conversation_id = c.id
            where cp.user_id = ?
              and cp.left_at is null
              and m.deleted_at is null
              and m.moderated_at is null
              and to_tsvector(
                    'simple',
                    coalesce(m.content, '')
                  ) @@ plainto_tsquery('simple', ?)
            """;

    private static final String ORDER_AND_LIMIT = """
            order by ts_rank(
                to_tsvector(
                    'simple',
                    coalesce(m.content, '')
                ),
                plainto_tsquery('simple', ?)
            ) desc,
            m.created_at desc
            limit 100
            """;

    private final JdbcTemplate jdbc;

    public MessageSearchRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<MessageSearchResponse> search(
            UUID userId,
            String query,
            UUID conversationId
    ) {
        String normalizedQuery = query == null ? "" : query.trim();

        StringBuilder sql = new StringBuilder(BASE_QUERY);
        List<Object> parameters = new ArrayList<>();

        parameters.add(userId);
        parameters.add(userId);
        parameters.add(normalizedQuery);

        if (conversationId != null) {
            sql.append("""
                      and c.id = ?
                    """);

            parameters.add(conversationId);
        }

        sql.append(ORDER_AND_LIMIT);
        parameters.add(normalizedQuery);

        return jdbc.query(
                sql.toString(),
                (rs, rowNum) -> new MessageSearchResponse(
                        rs.getObject("id", UUID.class),
                        rs.getString("content"),
                        instant(rs.getTimestamp("created_at")),
                        instant(rs.getTimestamp("edited_at")),
                        rs.getString("sender_name"),
                        rs.getString("sender_username"),
                        rs.getObject("conversation_id", UUID.class),
                        rs.getString("conversation_name"),
                        rs.getString("type")
                ),
                parameters.toArray()
        );
    }

    private static Instant instant(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toInstant();
    }
}