package com.pulselink.friend.repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.pulselink.friend.dto.FriendRequestResponse;
import com.pulselink.friend.dto.PersonResponse;

@Repository
public class FriendshipRepository {

    private final JdbcTemplate jdbc;

    public FriendshipRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<PersonResponse> search(UUID currentUserId, String query) {
        String like = "%" + query.toLowerCase() + "%";
        return jdbc.query("""
                select u.id, u.username, u.display_name, u.avatar_object_key, u.bio,
                       case
                         when exists(select 1 from user_blocks b where b.blocker_id=? and b.blocked_id=u.id) then 'BLOCKED'
                         when f.status='ACCEPTED' then 'FRIEND'
                         when f.status='PENDING' and f.requester_id=? then 'PENDING_SENT'
                         when f.status='PENDING' then 'PENDING_RECEIVED'
                         else 'NONE'
                       end relationship_status
                from users u
                left join friendships f
                  on f.user_low_id=least(?,u.id) and f.user_high_id=greatest(?,u.id)
                where u.id<>?
                  and u.status='ACTIVE'
                  and u.discoverable=true
                  and not exists(select 1 from user_blocks b where b.blocker_id=u.id and b.blocked_id=?)
                  and (lower(u.username) like ? or lower(coalesce(u.display_name,'')) like ?)
                order by
                  case when f.status='ACCEPTED' then 0 when f.status='PENDING' then 1 else 2 end,
                  lower(coalesce(u.display_name,u.username))
                limit 50
                """, (rs, rowNum) -> new PersonResponse(
                rs.getObject("id", UUID.class),
                rs.getString("username"),
                rs.getString("display_name"),
                avatarUrl(rs.getString("avatar_object_key")),
                rs.getString("bio"),
                false,
                rs.getString("relationship_status")
        ), currentUserId, currentUserId, currentUserId, currentUserId, currentUserId,
                currentUserId, like, like);
    }

    public List<FriendRequestResponse> received(UUID userId) {
        return jdbc.query("""
                select u.id,u.username,u.display_name,u.avatar_object_key,f.created_at
                from friendships f
                join users u on u.id=f.requester_id
                where f.status='PENDING'
                  and f.requester_id<>?
                  and (f.user_low_id=? or f.user_high_id=?)
                order by f.created_at desc
                """, (rs, rowNum) -> request(rs.getObject("id", UUID.class),
                rs.getString("username"), rs.getString("display_name"),
                rs.getString("avatar_object_key"), rs.getTimestamp("created_at")),
                userId, userId, userId);
    }

    public List<FriendRequestResponse> sent(UUID userId) {
        return jdbc.query("""
                select u.id,u.username,u.display_name,u.avatar_object_key,f.created_at
                from friendships f
                join users u on u.id=case when f.user_low_id=? then f.user_high_id else f.user_low_id end
                where f.status='PENDING' and f.requester_id=?
                order by f.created_at desc
                """, (rs, rowNum) -> request(rs.getObject("id", UUID.class),
                rs.getString("username"), rs.getString("display_name"),
                rs.getString("avatar_object_key"), rs.getTimestamp("created_at")),
                userId, userId);
    }

    public String displayName(UUID userId) {
        return jdbc.queryForObject(
                "select coalesce(nullif(display_name,''),username) from users where id=?",
                String.class,
                userId
        );
    }

    public boolean canReceiveFriendRequests(UUID targetId) {
        Integer count = jdbc.queryForObject("""
                select count(*) from users
                where id=? and status='ACTIVE' and allow_friend_requests=true
                """, Integer.class, targetId);
        return count != null && count > 0;
    }

    public boolean isBlockedEitherWay(UUID first, UUID second) {
        Integer count = jdbc.queryForObject("""
                select count(*) from user_blocks
                where (blocker_id=? and blocked_id=?) or (blocker_id=? and blocked_id=?)
                """, Integer.class, first, second, second, first);
        return count != null && count > 0;
    }

    public int createRequest(UUID requesterId, UUID targetId) {
        Pair pair = pair(requesterId, targetId);
        return jdbc.update("""
                insert into friendships(user_low_id,user_high_id,requester_id,status)
                values(?,?,?,'PENDING')
                on conflict(user_low_id,user_high_id) do nothing
                """, pair.low(), pair.high(), requesterId);
    }

    public int accept(UUID currentUserId, UUID requesterId) {
        Pair pair = pair(currentUserId, requesterId);
        return jdbc.update("""
                update friendships
                set status='ACCEPTED',updated_at=now()
                where user_low_id=? and user_high_id=? and requester_id=? and status='PENDING'
                """, pair.low(), pair.high(), requesterId);
    }

    public int deleteRelationship(UUID currentUserId, UUID otherUserId, String requiredStatus) {
        Pair pair = pair(currentUserId, otherUserId);
        String sql = requiredStatus == null
                ? "delete from friendships where user_low_id=? and user_high_id=?"
                : "delete from friendships where user_low_id=? and user_high_id=? and status=?";
        return requiredStatus == null
                ? jdbc.update(sql, pair.low(), pair.high())
                : jdbc.update(sql, pair.low(), pair.high(), requiredStatus);
    }

    public void block(UUID currentUserId, UUID targetId) {
        jdbc.update("""
                insert into user_blocks(blocker_id,blocked_id) values(?,?)
                on conflict(blocker_id,blocked_id) do nothing
                """, currentUserId, targetId);
        deleteRelationship(currentUserId, targetId, null);
    }

    public int unblock(UUID currentUserId, UUID targetId) {
        return jdbc.update("delete from user_blocks where blocker_id=? and blocked_id=?",
                currentUserId, targetId);
    }

    private FriendRequestResponse request(
            UUID id,
            String username,
            String displayName,
            String avatarObjectKey,
            Timestamp createdAt
    ) {
        Instant instant = createdAt == null ? Instant.now() : createdAt.toInstant();
        return new FriendRequestResponse(id, username, displayName, avatarUrl(avatarObjectKey), instant);
    }

    private String avatarUrl(String objectKey) {
        return objectKey == null ? null : "/api/v1/files/avatar/" + objectKey;
    }

    private Pair pair(UUID first, UUID second) {
        return comparePostgresUuidOrder(first, second) < 0 ? new Pair(first, second) : new Pair(second, first);
    }

    /**
     * PostgreSQL's {@code uuid} type is ordered by comparing its 16 bytes as
     * unsigned values. {@link UUID#compareTo(UUID)} instead compares
     * {@code mostSigBits}/{@code leastSigBits} as SIGNED longs, which
     * disagrees with Postgres for roughly half of all random UUID pairs
     * (whenever the leading bit of the two UUIDs differs). Using the signed
     * Java ordering here previously caused inserts to violate the
     * {@code chk_friend_pair CHECK (user_low_id < user_high_id)} constraint
     * for ~50% of user pairs, which surfaced as an opaque
     * DataIntegrityViolationException instead of the request ever
     * succeeding. This comparator matches Postgres's actual ordering.
     */
    private static int comparePostgresUuidOrder(UUID first, UUID second) {
        int mostSignificant = Long.compareUnsigned(
                first.getMostSignificantBits(), second.getMostSignificantBits());
        if (mostSignificant != 0) {
            return mostSignificant;
        }
        return Long.compareUnsigned(first.getLeastSignificantBits(), second.getLeastSignificantBits());
    }

    private record Pair(UUID low, UUID high) { }
}
