package com.pulselink.report.repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.pulselink.report.dto.CreateReportRequest;
import com.pulselink.report.dto.UserReportResponse;
import com.pulselink.shared.json.JsonSupport;

@Repository
public class UserReportRepository {

    private final JdbcTemplate jdbc;
    private final JsonSupport jsonSupport;

    public UserReportRepository(JdbcTemplate jdbc, JsonSupport jsonSupport) {
        this.jdbc = jdbc;
        this.jsonSupport = jsonSupport;
    }

    public List<ReportRow> list(UUID reporterId) {
        return jdbc.query("""
                select r.id,r.target_type,r.target_user_id,r.target_message_id,
                       r.target_conversation_id,r.reason,r.description,r.status,r.outcome,
                       r.resolution_summary,r.created_at,r.updated_at,
                       coalesce(
                         target_user.display_name,
                         target_user.username,
                         target_group.name,
                         'Reported message'
                       ) target_label
                from reports r
                left join users target_user on target_user.id=r.target_user_id
                left join conversations target_group on target_group.id=r.target_conversation_id
                where r.reporter_id=?
                order by r.created_at desc
                """, (rs, rowNum) -> new ReportRow(
                rs.getObject("id", UUID.class),
                rs.getString("target_type"),
                rs.getString("target_label"),
                rs.getString("reason"),
                value(rs.getString("description")),
                rs.getString("status"),
                rs.getString("outcome"),
                rs.getString("resolution_summary"),
                instant(rs.getTimestamp("created_at")),
                instant(rs.getTimestamp("updated_at"))
        ), reporterId);
    }

    public List<UserReportResponse.Clarification> clarifications(
            UUID reportId,
            UUID reporterId
    ) {
        return jdbc.query("""
                select c.id,c.body,c.created_at
                from report_comments c
                join reports r on r.id=c.report_id
                where c.report_id=? and r.reporter_id=?
                  and c.visibility='REPORTER_VISIBLE'
                order by c.created_at
                """, (rs, rowNum) -> new UserReportResponse.Clarification(
                rs.getObject("id", UUID.class),
                rs.getString("body"),
                instant(rs.getTimestamp("created_at"))
        ), reportId, reporterId);
    }

    public UUID create(
            UUID reporterId,
            CreateReportRequest request,
            Map<String, Object> evidence
    ) {
        UUID reportId = UUID.randomUUID();
        UUID targetConversationId = resolveConversationId(request, evidence);
        jdbc.update("""
                insert into reports(
                  id,reporter_id,target_type,target_user_id,target_message_id,
                  target_conversation_id,reason,description,status
                ) values(?,?,?,?,?,?,?,?,'OPEN')
                """,
                reportId,
                reporterId,
                request.targetType(),
                request.targetUserId(),
                request.targetMessageId(),
                targetConversationId,
                request.reason().trim(),
                request.description() == null ? null : request.description().trim()
        );

        String evidenceJson = jsonSupport.stringify(evidence);
        jdbc.update("""
                insert into report_evidence(report_id,evidence_jsonb,content_hash)
                values(?,cast(? as jsonb),encode(digest(?,'sha256'),'hex'))
                """, reportId, evidenceJson, evidenceJson);
        return reportId;
    }

    public Optional<Map<String, Object>> evidenceForTarget(
            UUID reporterId,
            CreateReportRequest request
    ) {
        return switch (request.targetType()) {
            case "USER" -> userEvidence(reporterId, request.targetUserId());
            case "MESSAGE" -> messageEvidence(reporterId, request.targetMessageId());
            case "GROUP" -> groupEvidence(reporterId, request.targetConversationId());
            default -> Optional.empty();
        };
    }

    public boolean isOpenForReporter(UUID reportId, UUID reporterId) {
        Integer count = jdbc.queryForObject("""
                select count(*) from reports
                where id=? and reporter_id=? and status in ('OPEN','IN_REVIEW')
                """, Integer.class, reportId, reporterId);
        return count != null && count > 0;
    }

    public int addClarification(UUID reportId, UUID reporterId, String body) {
        int inserted = jdbc.update("""
                insert into report_comments(report_id,author_id,visibility,body)
                select id,?,'REPORTER_VISIBLE',? from reports
                where id=? and reporter_id=? and status in ('OPEN','IN_REVIEW')
                """, reporterId, body, reportId, reporterId);
        if (inserted > 0) {
            jdbc.update("update reports set updated_at=now() where id=?", reportId);
        }
        return inserted;
    }

    private Optional<Map<String, Object>> userEvidence(
            UUID reporterId,
            UUID targetUserId
    ) {
        if (targetUserId == null || reporterId.equals(targetUserId)) {
            return Optional.empty();
        }
        return jdbc.query("""
                select id,username,display_name,status,created_at
                from users where id=?
                """, (rs, rowNum) -> evidence(
                "targetType", "USER",
                "id", rs.getObject("id", UUID.class).toString(),
                "username", rs.getString("username"),
                "displayName", rs.getString("display_name"),
                "status", rs.getString("status"),
                "createdAt", toText(instant(rs.getTimestamp("created_at"))),
                "capturedAt", Instant.now().toString()
        ), targetUserId).stream().findFirst();
    }

    private Optional<Map<String, Object>> messageEvidence(
            UUID reporterId,
            UUID messageId
    ) {
        if (messageId == null) {
            return Optional.empty();
        }
        return jdbc.query("""
                select m.id,m.content,m.created_at,m.sender_id,u.username,
                       coalesce(u.display_name,u.username) sender_name,
                       c.id conversation_id
                from messages m
                join users u on u.id=m.sender_id
                join conversations c on c.id=m.conversation_id
                join conversation_participants cp on cp.conversation_id=c.id
                where m.id=? and cp.user_id=? and cp.left_at is null
                """, (rs, rowNum) -> evidence(
                "targetType", "MESSAGE",
                "id", rs.getObject("id", UUID.class).toString(),
                "content", value(rs.getString("content")),
                "createdAt", toText(instant(rs.getTimestamp("created_at"))),
                "senderId", rs.getObject("sender_id", UUID.class).toString(),
                "senderUsername", rs.getString("username"),
                "senderName", rs.getString("sender_name"),
                "conversationId", rs.getObject("conversation_id", UUID.class).toString(),
                "capturedAt", Instant.now().toString()
        ), messageId, reporterId).stream().findFirst();
    }

    private Optional<Map<String, Object>> groupEvidence(
            UUID reporterId,
            UUID groupId
    ) {
        if (groupId == null) {
            return Optional.empty();
        }
        return jdbc.query("""
                select c.id,c.name,c.status,c.created_at,
                       (select count(*) from conversation_participants p
                        where p.conversation_id=c.id and p.left_at is null) member_count
                from conversations c
                join conversation_participants cp on cp.conversation_id=c.id
                where c.id=? and c.type='GROUP' and cp.user_id=? and cp.left_at is null
                """, (rs, rowNum) -> evidence(
                "targetType", "GROUP",
                "id", rs.getObject("id", UUID.class).toString(),
                "name", rs.getString("name"),
                "status", rs.getString("status"),
                "memberCount", rs.getLong("member_count"),
                "createdAt", toText(instant(rs.getTimestamp("created_at"))),
                "capturedAt", Instant.now().toString()
        ), groupId, reporterId).stream().findFirst();
    }

    private static UUID resolveConversationId(
            CreateReportRequest request,
            Map<String, Object> evidence
    ) {
        if (!"MESSAGE".equals(request.targetType())) {
            return request.targetConversationId();
        }
        Object value = evidence.get("conversationId");
        if (value == null) {
            throw new IllegalStateException("Message evidence is missing the conversation id");
        }
        return UUID.fromString(value.toString());
    }

    private static Map<String, Object> evidence(Object... entries) {
        if (entries.length % 2 != 0) {
            throw new IllegalArgumentException("Evidence entries must contain key-value pairs");
        }
        Map<String, Object> result = new LinkedHashMap<>();
        for (int index = 0; index < entries.length; index += 2) {
            result.put(String.valueOf(entries[index]), entries[index + 1]);
        }
        return result;
    }

    private static String toText(Instant instant) {
        return instant == null ? null : instant.toString();
    }

    private static String value(String value) {
        return value == null ? "" : value;
    }

    private static Instant instant(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toInstant();
    }

    public record ReportRow(
            UUID id,
            String targetType,
            String targetLabel,
            String reason,
            String description,
            String status,
            String outcome,
            String resolutionSummary,
            Instant createdAt,
            Instant updatedAt
    ) { }
}
