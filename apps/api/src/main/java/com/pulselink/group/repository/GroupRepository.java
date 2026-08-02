package com.pulselink.group.repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class GroupRepository {

    private final JdbcTemplate jdbc;

    public GroupRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public UUID create(UUID creatorId, String name, List<UUID> requestedMemberIds) {
        UUID groupId = UUID.randomUUID();
        jdbc.update("""
                insert into conversations(id,type,name,created_by,status)
                values(?,'GROUP',?,?,'ACTIVE')
                """, groupId, name, creatorId);
        jdbc.update("""
                insert into conversation_participants(conversation_id,user_id,role)
                values(?,?,'ADMIN')
                """, groupId, creatorId);

        Set<UUID> memberIds = new LinkedHashSet<>(requestedMemberIds);
        memberIds.remove(creatorId);
        for (UUID memberId : memberIds) {
            jdbc.update("""
                    insert into conversation_participants(conversation_id,user_id,role)
                    select ?,id,'MEMBER' from users where id=? and status='ACTIVE'
                    on conflict(conversation_id,user_id) do update set left_at=null,role='MEMBER'
                    """, groupId, memberId);
        }
        return groupId;
    }

    public Optional<GroupRow> find(UUID groupId) {
        return jdbc.query("""
                select id,name,avatar_object_key,status,created_at,created_by
                from conversations where id=? and type='GROUP'
                """, (rs, rowNum) -> new GroupRow(
                rs.getObject("id", UUID.class),
                rs.getString("name"),
                rs.getString("avatar_object_key"),
                rs.getString("status"),
                instant(rs.getTimestamp("created_at")),
                rs.getObject("created_by", UUID.class)
        ), groupId).stream().findFirst();
    }

    public String role(UUID groupId, UUID userId) {
        return jdbc.query("""
                select role from conversation_participants
                where conversation_id=? and user_id=? and left_at is null
                """, (rs, rowNum) -> rs.getString("role"), groupId, userId)
                .stream().findFirst().orElse(null);
    }

    public boolean isAcceptedFriend(UUID currentUserId, UUID candidateId) {
        Integer count = jdbc.queryForObject("""
                select count(*)
                from users candidate
                join friendships friendship
                  on friendship.user_low_id=least(?,candidate.id)
                 and friendship.user_high_id=greatest(?,candidate.id)
                 and friendship.status='ACCEPTED'
                where candidate.id=? and candidate.status='ACTIVE'
                """, Integer.class, currentUserId, currentUserId, candidateId);
        return count != null && count > 0;
    }

    public void addMembers(UUID groupId, List<UUID> memberIds) {
        for (UUID memberId : new LinkedHashSet<>(memberIds)) {
            jdbc.update("""
                    insert into conversation_participants(conversation_id,user_id,role)
                    select ?,id,'MEMBER' from users where id=? and status='ACTIVE'
                    on conflict(conversation_id,user_id) do update set left_at=null,role='MEMBER'
                    """, groupId, memberId);
        }
        jdbc.update("update conversations set updated_at=now() where id=?", groupId);
    }

    public int removeMember(UUID groupId, UUID memberId) {
        int updated = jdbc.update("""
                update conversation_participants set left_at=now()
                where conversation_id=? and user_id=? and role='MEMBER' and left_at is null
                """, groupId, memberId);
        if (updated > 0) {
            jdbc.update("update conversations set updated_at=now() where id=?", groupId);
        }
        return updated;
    }

    public int transferAdmin(UUID groupId, UUID currentAdminId, UUID nextAdminId) {
        Integer targetMember = jdbc.queryForObject("""
                select count(*) from conversation_participants
                where conversation_id=? and user_id=? and left_at is null
                """, Integer.class, groupId, nextAdminId);
        if (targetMember == null || targetMember == 0) {
            return 0;
        }
        jdbc.update("""
                update conversation_participants set role='MEMBER'
                where conversation_id=? and user_id=? and role='ADMIN'
                """, groupId, currentAdminId);
        return jdbc.update("""
                update conversation_participants set role='ADMIN'
                where conversation_id=? and user_id=? and left_at is null
                """, groupId, nextAdminId);
    }

    public int leave(UUID groupId, UUID userId) {
        return jdbc.update("""
                update conversation_participants set left_at=now()
                where conversation_id=? and user_id=? and role='MEMBER' and left_at is null
                """, groupId, userId);
    }

    public int update(UUID groupId, String name, String avatarObjectKey) {
        return jdbc.update("""
                update conversations
                set name=coalesce(?,name),avatar_object_key=coalesce(?,avatar_object_key),
                    updated_at=now()
                where id=? and type='GROUP'
                """, name, avatarObjectKey, groupId);
    }

    public record GroupRow(
            UUID id,
            String name,
            String avatarObjectKey,
            String status,
            Instant createdAt,
            UUID createdBy
    ) { }

    private static Instant instant(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toInstant();
    }
}
