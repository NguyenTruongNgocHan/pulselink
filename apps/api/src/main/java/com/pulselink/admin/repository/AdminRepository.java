package com.pulselink.admin.repository;

import static com.pulselink.admin.dto.AdminDtos.*;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.pulselink.shared.json.JsonSupport;

@Repository
public class AdminRepository {

    private final JdbcTemplate jdbc;
    private final JsonSupport jsonSupport;

    public AdminRepository(JdbcTemplate jdbc, JsonSupport jsonSupport) {
        this.jdbc = jdbc;
        this.jsonSupport = jsonSupport;
    }

    public long count(String sql, Object... args) {
        Long value = jdbc.queryForObject(sql, Long.class, args);
        return value == null ? 0 : value;
    }

    public List<AuditEntry> auditEntries(String query, String action, int offset, int size) {
        String like = "%" + normalize(query) + "%";
        return jdbc.query("""
                select l.id,l.action,l.target_type,l.target_id,l.reason,
                       l.metadata_jsonb::text metadata,l.created_at,
                       coalesce(u.username,'system') actor_username,
                       coalesce(u.role,'USER') actor_role
                from admin_audit_logs l
                left join users u on u.id=l.actor_user_id
                where (?='' or lower(l.action) like ? or lower(coalesce(l.reason,'')) like ?
                       or lower(coalesce(u.username,'')) like ?)
                  and (?='' or l.action=?)
                order by l.created_at desc
                offset ? limit ?
                """, (rs, rowNum) -> new AuditEntry(
                rs.getObject("id", UUID.class),
                rs.getString("action"),
                rs.getString("actor_username"),
                rs.getString("actor_role"),
                rs.getString("target_type"),
                rs.getObject("target_id", UUID.class),
                rs.getString("reason"),
                jsonSupport.map(rs.getString("metadata")),
                instant(rs.getTimestamp("created_at"))
        ), normalize(query), like, like, like, enumFilter(action), enumFilter(action), offset, size);
    }

    public long auditCount(String query, String action) {
        String like = "%" + normalize(query) + "%";
        return count("""
                select count(*) from admin_audit_logs l
                left join users u on u.id=l.actor_user_id
                where (?='' or lower(l.action) like ? or lower(coalesce(l.reason,'')) like ?
                       or lower(coalesce(u.username,'')) like ?)
                  and (?='' or l.action=?)
                """, normalize(query), like, like, like, enumFilter(action), enumFilter(action));
    }

    public List<AuditEntry> auditForTarget(UUID targetId, int limit) {
        return jdbc.query("""
                select l.id,l.action,l.target_type,l.target_id,l.reason,
                       l.metadata_jsonb::text metadata,l.created_at,
                       coalesce(u.username,'system') actor_username,
                       coalesce(u.role,'USER') actor_role
                from admin_audit_logs l
                left join users u on u.id=l.actor_user_id
                where l.target_id=? order by l.created_at desc limit ?
                """, (rs, rowNum) -> new AuditEntry(
                rs.getObject("id", UUID.class),
                rs.getString("action"),
                rs.getString("actor_username"),
                rs.getString("actor_role"),
                rs.getString("target_type"),
                rs.getObject("target_id", UUID.class),
                rs.getString("reason"),
                jsonSupport.map(rs.getString("metadata")),
                instant(rs.getTimestamp("created_at"))
        ), targetId, limit);
    }

    public List<TrendPoint> reportTrend() {
        return jdbc.query("""
                select to_char(day,'YYYY-MM-DD') date,coalesce(count(r.id),0) count
                from generate_series(current_date-interval '6 days',current_date,interval '1 day') day
                left join reports r on r.created_at>=day and r.created_at<day+interval '1 day'
                group by day order by day
                """, (rs, rowNum) -> new TrendPoint(rs.getString("date"), rs.getLong("count")));
    }

    public List<UserSummary> users(
            String query,
            String role,
            String status,
            int offset,
            int size
    ) {
        String like = "%" + normalize(query) + "%";
        return jdbc.query("""
                select id,username,email,display_name,avatar_object_key,role,status,
                       suspended_until,created_at
                from users
                where (?='' or lower(username) like ? or lower(email) like ?
                       or lower(coalesce(display_name,'')) like ?)
                  and (?='' or role=?) and (?='' or status=?)
                order by created_at desc offset ? limit ?
                """, (rs, rowNum) -> userSummary(rs),
                normalize(query), like, like, like,
                enumFilter(role), enumFilter(role),
                enumFilter(status), enumFilter(status),
                offset, size);
    }

    public long usersCount(String query, String role, String status) {
        String like = "%" + normalize(query) + "%";
        return count("""
                select count(*) from users
                where (?='' or lower(username) like ? or lower(email) like ?
                       or lower(coalesce(display_name,'')) like ?)
                  and (?='' or role=?) and (?='' or status=?)
                """, normalize(query), like, like, like,
                enumFilter(role), enumFilter(role), enumFilter(status), enumFilter(status));
    }

    public Optional<UserDetails> userDetails(UUID userId) {
        return jdbc.query("""
                select u.id,u.username,u.email,u.display_name,u.avatar_object_key,u.role,u.status,
                       u.suspended_until,u.created_at,u.bio,u.email_verified,
                       (select count(*) from reports r where r.target_user_id=u.id) report_count,
                       (select count(*) from refresh_tokens t where t.user_id=u.id
                         and t.revoked=false and t.expires_at>now()) session_count
                from users u where u.id=?
                """, (rs, rowNum) -> new UserDetails(
                rs.getObject("id", UUID.class),
                rs.getString("username"),
                rs.getString("email"),
                rs.getString("display_name"),
                avatarUrl(rs.getString("avatar_object_key")),
                rs.getString("role"),
                rs.getString("status"),
                instant(rs.getTimestamp("suspended_until")),
                instant(rs.getTimestamp("created_at")),
                rs.getString("bio"),
                rs.getBoolean("email_verified"),
                rs.getLong("report_count"),
                rs.getLong("session_count"),
                auditForTarget(userId, 50)
        ), userId).stream().findFirst();
    }

    public Optional<StaffUser> staffUser(UUID userId) {
        return jdbc.query("select id,role,status from users where id=?",
                (rs, rowNum) -> new StaffUser(
                        rs.getObject("id", UUID.class),
                        rs.getString("role"),
                        rs.getString("status")
                ), userId).stream().findFirst();
    }

    public int suspend(UUID userId, Instant until) {
        return jdbc.update("""
                update users set status='SUSPENDED',suspended_until=?,token_version=token_version+1,
                    updated_at=now() where id=?
                """, Timestamp.from(until), userId);
    }

    public int setActive(UUID userId) {
        return jdbc.update("""
                update users set status='ACTIVE',suspended_until=null,updated_at=now() where id=?
                """, userId);
    }

    public int ban(UUID userId) {
        return jdbc.update("""
                update users set status='BANNED',suspended_until=null,
                    token_version=token_version+1,updated_at=now() where id=?
                """, userId);
    }

    public int changeRole(UUID userId, String role) {
        return jdbc.update("""
                update users set role=?,token_version=token_version+1,updated_at=now() where id=?
                """, role, userId);
    }

    public void revokeSessions(UUID userId) {
        jdbc.update("""
                update refresh_tokens set revoked=true,revoked_at=now()
                where user_id=? and revoked=false
                """, userId);
    }

    public void incrementTokenVersion(UUID userId) {
        jdbc.update("update users set token_version=token_version+1,updated_at=now() where id=?", userId);
    }

    public List<ReportSummary> reports(
            String query,
            String status,
            int offset,
            int size
    ) {
        String like = "%" + normalize(query) + "%";
        return jdbc.query(reportSelect() + """
                where (?='' or lower(r.reason) like ? or lower(coalesce(r.description,'')) like ?
                       or lower(reporter.username) like ?)
                  and (?='' or r.status=?)
                order by r.created_at desc offset ? limit ?
                """, (rs, rowNum) -> reportSummary(rs),
                normalize(query), like, like, like,
                enumFilter(status), enumFilter(status), offset, size);
    }

    public long reportsCount(String query, String status) {
        String like = "%" + normalize(query) + "%";
        return count("""
                select count(*) from reports r join users reporter on reporter.id=r.reporter_id
                where (?='' or lower(r.reason) like ? or lower(coalesce(r.description,'')) like ?
                       or lower(reporter.username) like ?)
                  and (?='' or r.status=?)
                """, normalize(query), like, like, like, enumFilter(status), enumFilter(status));
    }

    public Optional<ReportDetails> reportDetails(UUID reportId) {
        return jdbc.query(reportSelect() + " where r.id=?",
                (rs, rowNum) -> new ReportDetails(
                        rs.getObject("id", UUID.class),
                        rs.getString("target_type"),
                        rs.getString("target_label"),
                        rs.getString("reason"),
                        value(rs.getString("description")),
                        rs.getString("status"),
                        rs.getString("outcome"),
                        instant(rs.getTimestamp("created_at")),
                        instant(rs.getTimestamp("updated_at")),
                        rs.getString("reporter_username"),
                        rs.getObject("assignee_id", UUID.class),
                        rs.getString("assignee_username"),
                        rs.getObject("reporter_id", UUID.class),
                        rs.getObject("target_user_id", UUID.class),
                        rs.getObject("target_message_id", UUID.class),
                        rs.getObject("target_conversation_id", UUID.class),
                        rs.getString("resolution_summary"),
                        evidenceExists(reportId),
                        comments(reportId)
                ), reportId).stream().findFirst();
    }

    public List<ReportComment> comments(UUID reportId) {
        return jdbc.query("""
                select c.id,u.username author_username,c.visibility,c.body,c.created_at
                from report_comments c join users u on u.id=c.author_id
                where c.report_id=? order by c.created_at
                """, (rs, rowNum) -> new ReportComment(
                rs.getObject("id", UUID.class),
                rs.getString("author_username"),
                rs.getString("visibility"),
                rs.getString("body"),
                instant(rs.getTimestamp("created_at"))
        ), reportId);
    }

    public boolean evidenceExists(UUID reportId) {
        return count("select count(*) from report_evidence where report_id=?", reportId) > 0;
    }

    public Optional<EvidenceRow> evidence(UUID reportId) {
        return jdbc.query("""
                select e.evidence_jsonb::text evidence,e.captured_at,r.target_type,
                       r.target_message_id,r.target_conversation_id
                from report_evidence e join reports r on r.id=e.report_id
                where e.report_id=?
                """, (rs, rowNum) -> new EvidenceRow(
                jsonSupport.map(rs.getString("evidence")),
                instant(rs.getTimestamp("captured_at")),
                rs.getString("target_type"),
                rs.getObject("target_message_id", UUID.class),
                rs.getObject("target_conversation_id", UUID.class)
        ), reportId).stream().findFirst();
    }

    public List<NearbyMessage> nearbyMessages(UUID targetMessageId, UUID conversationId) {
        if (targetMessageId == null || conversationId == null) return List.of();
        return jdbc.query("""
                select m.id,coalesce(u.display_name,u.username) author,m.content,m.created_at
                from messages m join users u on u.id=m.sender_id
                where m.conversation_id=? and m.created_at between
                  (select created_at-interval '10 minutes' from messages where id=?) and
                  (select created_at+interval '10 minutes' from messages where id=?)
                order by m.created_at limit 20
                """, (rs, rowNum) -> new NearbyMessage(
                rs.getObject("id", UUID.class),
                rs.getString("author"),
                rs.getString("content"),
                instant(rs.getTimestamp("created_at"))
        ), conversationId, targetMessageId, targetMessageId);
    }

    public int claimReport(UUID reportId, UUID actorId) {
        return jdbc.update("""
                update reports set status='IN_REVIEW',assignee_id=?,updated_at=now()
                where id=? and status='OPEN'
                """, actorId, reportId);
    }

    public int resolveReport(UUID reportId, UUID actorId, String outcome, String reason) {
        return jdbc.update("""
                update reports
                set status='RESOLVED',outcome=?,resolution_summary=?,reviewed_at=now(),updated_at=now()
                where id=? and status='IN_REVIEW' and (assignee_id=? or assignee_id is null)
                """, outcome, reason, reportId, actorId);
    }

    public int rejectReport(UUID reportId, UUID actorId, String reason) {
        return jdbc.update("""
                update reports
                set status='REJECTED',outcome='NO_ACTION',resolution_summary=?,reviewed_at=now(),updated_at=now()
                where id=? and status='IN_REVIEW' and (assignee_id=? or assignee_id is null)
                """, reason, reportId, actorId);
    }

    public int moderateMessage(UUID messageId, UUID actorId, String reason) {
        return jdbc.update("""
                update messages set content=null,moderated_at=now(),moderated_by=?,
                    moderation_reason=?,updated_at=now()
                where id=? and moderated_at is null
                """, actorId, reason, messageId);
    }

    public void removeModeratedMessageArtifacts(UUID messageId) {
        jdbc.update("""
                update message_attachments
                set status='DELETED',updated_at=now()
                where message_id=? and status<>'DELETED'
                """, messageId);
        jdbc.update("delete from message_reactions where message_id=?", messageId);
        jdbc.update("delete from saved_messages where message_id=?", messageId);
    }

    public void suspendTarget(UUID userId, Instant until) {
        suspend(userId, until);
        revokeSessions(userId);
    }

    public void banTarget(UUID userId) {
        ban(userId);
        revokeSessions(userId);
    }

    public int closeGroup(UUID groupId) {
        return jdbc.update("""
                update conversations set status='CLOSED',updated_at=now()
                where id=? and type='GROUP' and status<>'CLOSED'
                """, groupId);
    }

    public Optional<UUID> messageSender(UUID messageId) {
        return jdbc.query(
                "select sender_id from messages where id=?",
                (rs, rowNum) -> rs.getObject("sender_id", UUID.class),
                messageId
        ).stream().findFirst();
    }

    public List<GroupSummary> groups(String query, String status, int offset, int size) {
        String like = "%" + normalize(query) + "%";
        return jdbc.query("""
                select c.id,c.name,c.status,c.created_at,
                       count(p.user_id) filter(where p.left_at is null) member_count,
                       max(u.username) filter(where p.role='ADMIN' and p.left_at is null) admin_username
                from conversations c
                left join conversation_participants p on p.conversation_id=c.id
                left join users u on u.id=p.user_id
                where c.type='GROUP' and (?='' or lower(coalesce(c.name,'')) like ?)
                  and (?='' or c.status=?)
                group by c.id order by c.created_at desc offset ? limit ?
                """, (rs, rowNum) -> new GroupSummary(
                rs.getObject("id", UUID.class),
                rs.getString("name"),
                rs.getString("status"),
                rs.getLong("member_count"),
                instant(rs.getTimestamp("created_at")),
                rs.getString("admin_username")
        ), normalize(query), like, enumFilter(status), enumFilter(status), offset, size);
    }

    public long groupsCount(String query, String status) {
        String like = "%" + normalize(query) + "%";
        return count("""
                select count(*) from conversations c
                where c.type='GROUP' and (?='' or lower(coalesce(c.name,'')) like ?)
                  and (?='' or c.status=?)
                """, normalize(query), like, enumFilter(status), enumFilter(status));
    }

    public int setGroupStatus(UUID groupId, String status) {
        return jdbc.update("""
                update conversations set status=?,updated_at=now()
                where id=? and type='GROUP'
                """, status, groupId);
    }

    public void insertAudit(
            UUID actorId,
            String action,
            String targetType,
            UUID targetId,
            String reason,
            String metadataJson
    ) {
        jdbc.update("""
                insert into admin_audit_logs(
                  actor_user_id,action,target_type,target_id,reason,metadata_jsonb
                ) values(?,?,?,?,?,cast(? as jsonb))
                """, actorId, action, targetType, targetId, reason, metadataJson);
    }

    private String reportSelect() {
        return """
                select r.id,r.target_type,r.reason,r.description,r.status,r.outcome,
                       r.created_at,r.updated_at,r.reporter_id,r.target_user_id,
                       r.target_message_id,r.target_conversation_id,r.resolution_summary,
                       r.assignee_id,reporter.username reporter_username,
                       assignee.username assignee_username,
                       coalesce(target_user.display_name,target_group.name,'Reported message') target_label
                from reports r
                join users reporter on reporter.id=r.reporter_id
                left join users assignee on assignee.id=r.assignee_id
                left join users target_user on target_user.id=r.target_user_id
                left join conversations target_group on target_group.id=r.target_conversation_id
                """;
    }

    private ReportSummary reportSummary(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new ReportSummary(
                rs.getObject("id", UUID.class),
                rs.getString("target_type"),
                rs.getString("target_label"),
                rs.getString("reason"),
                value(rs.getString("description")),
                rs.getString("status"),
                rs.getString("outcome"),
                instant(rs.getTimestamp("created_at")),
                instant(rs.getTimestamp("updated_at")),
                rs.getString("reporter_username"),
                rs.getObject("assignee_id", UUID.class),
                rs.getString("assignee_username")
        );
    }

    private UserSummary userSummary(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new UserSummary(
                rs.getObject("id", UUID.class),
                rs.getString("username"),
                rs.getString("email"),
                rs.getString("display_name"),
                avatarUrl(rs.getString("avatar_object_key")),
                rs.getString("role"),
                rs.getString("status"),
                instant(rs.getTimestamp("suspended_until")),
                instant(rs.getTimestamp("created_at"))
        );
    }

    private static String avatarUrl(String key) {
        return key == null ? null : "/api/v1/files/avatar/" + key;
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }

    private static String enumFilter(String value) {
        return value == null ? "" : value.trim().toUpperCase();
    }

    private static String value(String value) {
        return value == null ? "" : value;
    }

    private static Instant instant(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toInstant();
    }

    public record StaffUser(UUID id, String role, String status) { }
    public record EvidenceRow(
            Map<String, Object> snapshot,
            Instant capturedAt,
            String targetType,
            UUID targetMessageId,
            UUID targetConversationId
    ) { }
}
