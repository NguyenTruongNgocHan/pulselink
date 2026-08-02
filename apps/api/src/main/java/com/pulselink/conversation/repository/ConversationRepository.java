package com.pulselink.conversation.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.pulselink.conversation.dto.ConversationParticipantResponse;
import com.pulselink.conversation.dto.MessageAttachmentResponse;
import com.pulselink.conversation.dto.MessageReactionResponse;
import com.pulselink.conversation.dto.MessageReceiptResponse;
import com.pulselink.conversation.dto.MessageResponse;

@Repository
public class ConversationRepository {

    private final JdbcTemplate jdbc;

    public ConversationRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<ConversationRow> list(UUID userId) {
        return jdbc.query("""
                select c.id,c.type,c.name,c.avatar_object_key,c.status,c.updated_at,
                       m.content preview,m.created_at latest_message_at,
                       (select count(*) from conversation_participants p2
                        where p2.conversation_id=c.id and p2.left_at is null) member_count,
                       (select count(*) from messages unread
                        where unread.conversation_id=c.id
                          and unread.deleted_at is null
                          and unread.sender_id<>?
                          and unread.created_at > coalesce(
                            (select read_message.created_at from messages read_message
                             where read_message.id=cp.last_read_message_id),
                            cp.joined_at
                          )) unread_count,
                       (select other_user.display_name
                        from conversation_participants other_cp
                        join users other_user on other_user.id=other_cp.user_id
                        where other_cp.conversation_id=c.id and other_cp.user_id<>?
                          and other_cp.left_at is null limit 1) direct_name,
                       (select other_user.avatar_object_key
                        from conversation_participants other_cp
                        join users other_user on other_user.id=other_cp.user_id
                        where other_cp.conversation_id=c.id and other_cp.user_id<>?
                          and other_cp.left_at is null limit 1) direct_avatar
                from conversations c
                join conversation_participants cp on cp.conversation_id=c.id
                left join messages m on m.id=c.latest_message_id
                where cp.user_id=? and cp.left_at is null
                order by coalesce(m.created_at,c.updated_at) desc
                """, (rs, rowNum) -> conversationRow(rs), userId, userId, userId, userId);
    }

    public Optional<ConversationRow> find(UUID conversationId, UUID userId) {
        return jdbc.query("""
                select c.id,c.type,c.name,c.avatar_object_key,c.status,c.updated_at,
                       m.content preview,m.created_at latest_message_at,
                       (select count(*) from conversation_participants p2
                        where p2.conversation_id=c.id and p2.left_at is null) member_count,
                       (select count(*) from messages unread
                        where unread.conversation_id=c.id
                          and unread.deleted_at is null
                          and unread.sender_id<>?
                          and unread.created_at > coalesce(
                            (select read_message.created_at from messages read_message
                             where read_message.id=cp.last_read_message_id),cp.joined_at
                          )) unread_count,
                       (select other_user.display_name
                        from conversation_participants other_cp
                        join users other_user on other_user.id=other_cp.user_id
                        where other_cp.conversation_id=c.id and other_cp.user_id<>?
                          and other_cp.left_at is null limit 1) direct_name,
                       (select other_user.avatar_object_key
                        from conversation_participants other_cp
                        join users other_user on other_user.id=other_cp.user_id
                        where other_cp.conversation_id=c.id and other_cp.user_id<>?
                          and other_cp.left_at is null limit 1) direct_avatar
                from conversations c
                join conversation_participants cp on cp.conversation_id=c.id
                left join messages m on m.id=c.latest_message_id
                where c.id=? and cp.user_id=? and cp.left_at is null
                """, (rs, rowNum) -> conversationRow(rs), userId, userId, userId,
                conversationId, userId).stream().findFirst();
    }

    public List<ConversationParticipantResponse> participants(UUID conversationId) {
        return jdbc.query("""
                select u.id,u.username,u.display_name,u.avatar_object_key,cp.role
                from conversation_participants cp
                join users u on u.id=cp.user_id
                where cp.conversation_id=? and cp.left_at is null
                order by case cp.role when 'ADMIN' then 0 else 1 end,
                         lower(coalesce(u.display_name,u.username))
                """, (rs, rowNum) -> new ConversationParticipantResponse(
                rs.getObject("id", UUID.class),
                rs.getString("username"),
                rs.getString("display_name"),
                avatarUrl(rs.getString("avatar_object_key")),
                rs.getString("role"),
                false
        ), conversationId);
    }

    public boolean isActiveMember(UUID conversationId, UUID userId) {
        Integer count = jdbc.queryForObject("""
                select count(*) from conversation_participants
                where conversation_id=? and user_id=? and left_at is null
                """, Integer.class, conversationId, userId);
        return count != null && count > 0;
    }

    public boolean isConversationActive(UUID conversationId) {
        Integer count = jdbc.queryForObject(
                "select count(*) from conversations where id=? and status='ACTIVE'",
                Integer.class,
                conversationId
        );
        return count != null && count > 0;
    }

    public Optional<UUID> directConversationId(UUID firstUserId, UUID secondUserId) {
        return jdbc.query(
                "select id from conversations where direct_key=?",
                (rs, rowNum) -> rs.getObject("id", UUID.class),
                directKey(firstUserId, secondUserId)
        ).stream().findFirst();
    }

    public UUID createDirect(UUID creatorId, UUID otherUserId) {
        UUID conversationId = UUID.randomUUID();
        jdbc.update("""
                insert into conversations(id,type,direct_key,created_by)
                values(?,'DIRECT',?,?)
                """, conversationId, directKey(creatorId, otherUserId), creatorId);
        jdbc.update("""
                insert into conversation_participants(conversation_id,user_id,role)
                values(?,?,'MEMBER'),(?,?,'MEMBER')
                """, conversationId, creatorId, conversationId, otherUserId);
        return conversationId;
    }

    public List<MessageRow> messages(UUID conversationId) {
        return jdbc.query("""
                select m.id,m.conversation_id,m.sender_id,u.display_name sender_name,
                       u.username sender_username,u.avatar_object_key sender_avatar,
                       m.content,m.created_at,m.edited_at,m.deleted_at,m.moderated_at,
                       m.client_message_id
                from messages m
                join users u on u.id=m.sender_id
                where m.conversation_id=?
                order by m.created_at asc
                limit 500
                """, (rs, rowNum) -> messageRow(rs), conversationId);
    }

    public Optional<MessageRow> message(UUID messageId) {
        return jdbc.query("""
                select m.id,m.conversation_id,m.sender_id,u.display_name sender_name,
                       u.username sender_username,u.avatar_object_key sender_avatar,
                       m.content,m.created_at,m.edited_at,m.deleted_at,m.moderated_at,
                       m.client_message_id
                from messages m
                join users u on u.id=m.sender_id
                where m.id=?
                """, (rs, rowNum) -> messageRow(rs), messageId).stream().findFirst();
    }

    public Optional<UUID> findMessageByClientId(
            UUID conversationId,
            UUID senderId,
            String clientMessageId
    ) {
        return jdbc.query("""
                select id from messages
                where conversation_id=? and sender_id=? and client_message_id=?
                """, (rs, rowNum) -> rs.getObject("id", UUID.class),
                conversationId, senderId, clientMessageId).stream().findFirst();
    }

    public UUID insertMessage(
            UUID conversationId,
            UUID senderId,
            String clientMessageId,
            String content
    ) {
        UUID messageId = UUID.randomUUID();
        jdbc.update("""
                insert into messages(id,conversation_id,sender_id,client_message_id,content)
                values(?,?,?,?,?)
                """, messageId, conversationId, senderId, clientMessageId, content);
        jdbc.update("""
                update conversations set latest_message_id=?,updated_at=now() where id=?
                """, messageId, conversationId);
        return messageId;
    }

    public int attachStagedFiles(
            UUID messageId,
            UUID conversationId,
            UUID uploaderId,
            List<UUID> attachmentIds
    ) {
        int updated = 0;
        for (UUID attachmentId : attachmentIds) {
            updated += jdbc.update("""
                    update message_attachments
                    set message_id=?,status='READY',updated_at=now()
                    where id=? and conversation_id=? and uploader_id=?
                      and message_id is null and status='STAGED'
                    """, messageId, attachmentId, conversationId, uploaderId);
        }
        return updated;
    }

    public int editMessage(UUID messageId, UUID senderId, String content) {
        return jdbc.update("""
                update messages set content=?,edited_at=now(),updated_at=now()
                where id=? and sender_id=? and deleted_at is null and moderated_at is null
                """, content, messageId, senderId);
    }

    public int deleteMessage(UUID messageId, UUID senderId) {
        return jdbc.update("""
                update messages
                set content=null,deleted_at=now(),updated_at=now()
                where id=? and sender_id=? and deleted_at is null and moderated_at is null
                """, messageId, senderId);
    }

    public void removeMessageArtifacts(UUID messageId) {
        jdbc.update("""
                update message_attachments
                set status='DELETED',updated_at=now()
                where message_id=? and status<>'DELETED'
                """, messageId);
        jdbc.update("delete from message_reactions where message_id=?", messageId);
        jdbc.update("delete from saved_messages where message_id=?", messageId);
    }

    public void upsertReaction(UUID messageId, UUID userId, String emoji) {
        jdbc.update("""
                insert into message_reactions(message_id,user_id,emoji)
                values(?,?,?)
                on conflict(message_id,user_id)
                do update set emoji=excluded.emoji,created_at=now()
                """, messageId, userId, emoji);
    }

    public int deleteReaction(UUID messageId, UUID userId) {
        return jdbc.update("delete from message_reactions where message_id=? and user_id=?",
                messageId, userId);
    }

    public List<MessageAttachmentResponse> attachments(UUID messageId) {
        return jdbc.query("""
                select id,file_name,mime_type,size_bytes
                from message_attachments
                where message_id=? and status='READY'
                order by created_at
                """, (rs, rowNum) -> new MessageAttachmentResponse(
                rs.getObject("id", UUID.class),
                rs.getString("file_name"),
                rs.getString("mime_type"),
                rs.getLong("size_bytes"),
                "/api/v1/files/" + rs.getObject("id", UUID.class)
        ), messageId);
    }

    public List<MessageReactionResponse> reactions(UUID messageId, UUID currentUserId) {
        return jdbc.query("""
                select emoji,count(*) reaction_count,
                       bool_or(user_id=?) reacted_by_me
                from message_reactions
                where message_id=?
                group by emoji
                order by min(created_at)
                """, (rs, rowNum) -> new MessageReactionResponse(
                rs.getString("emoji"),
                rs.getLong("reaction_count"),
                rs.getBoolean("reacted_by_me")
        ), currentUserId, messageId);
    }

    public List<MessageReceiptResponse> receipts(UUID messageId) {
        return jdbc.query("""
                select r.user_id,u.display_name,r.seen_at
                from message_read_receipts r
                join users u on u.id=r.user_id
                where r.message_id=?
                order by r.seen_at
                """, (rs, rowNum) -> new MessageReceiptResponse(
                rs.getObject("user_id", UUID.class),
                rs.getString("display_name"),
                instant(rs.getTimestamp("seen_at"))
        ), messageId);
    }

    public boolean savedBy(UUID messageId, UUID userId) {
        Integer count = jdbc.queryForObject(
                "select count(*) from saved_messages where user_id=? and message_id=?",
                Integer.class,
                userId,
                messageId
        );
        return count != null && count > 0;
    }

    public void saveMessage(UUID messageId, UUID userId) {
        jdbc.update("""
                insert into saved_messages(user_id,message_id) values(?,?)
                on conflict(user_id,message_id) do nothing
                """, userId, messageId);
    }

    public int unsaveMessage(UUID messageId, UUID userId) {
        return jdbc.update("delete from saved_messages where user_id=? and message_id=?",
                userId, messageId);
    }

    public Optional<UUID> latestMessageId(UUID conversationId) {
        return jdbc.query("""
                select id from messages where conversation_id=? order by created_at desc limit 1
                """, (rs, rowNum) -> rs.getObject("id", UUID.class), conversationId)
                .stream().findFirst();
    }

    public void markRead(
            UUID conversationId,
            UUID userId,
            UUID messageId,
            boolean createReceipt
    ) {
        jdbc.update("""
                update conversation_participants set last_read_message_id=?
                where conversation_id=? and user_id=? and left_at is null
                """, messageId, conversationId, userId);
        if (createReceipt) {
            jdbc.update("""
                    insert into message_read_receipts(message_id,user_id) values(?,?)
                    on conflict(message_id,user_id) do update set seen_at=now()
                    """, messageId, userId);
        } else {
            jdbc.update(
                    "delete from message_read_receipts where message_id=? and user_id=?",
                    messageId,
                    userId
            );
        }
    }

    public String displayName(UUID userId) {
        return jdbc.queryForObject(
                "select coalesce(display_name,username) from users where id=?",
                String.class,
                userId
        );
    }

    public boolean canStartDirect(UUID currentUserId, UUID targetId) {
        Integer count = jdbc.queryForObject("""
                select count(*) from users target
                where target.id=? and target.status='ACTIVE'
                  and target.allow_direct_messages=true
                  and not exists(
                    select 1 from user_blocks b
                    where (b.blocker_id=? and b.blocked_id=?)
                       or (b.blocker_id=? and b.blocked_id=?)
                  )
                """, Integer.class, targetId,
                currentUserId, targetId, targetId, currentUserId);
        return count != null && count > 0;
    }

    private ConversationRow conversationRow(ResultSet rs) throws SQLException {
        return new ConversationRow(
                rs.getObject("id", UUID.class),
                rs.getString("type"),
                rs.getString("name"),
                rs.getString("avatar_object_key"),
                rs.getString("status"),
                rs.getString("preview"),
                instant(rs.getTimestamp("latest_message_at")),
                rs.getLong("unread_count"),
                rs.getLong("member_count"),
                rs.getString("direct_name"),
                rs.getString("direct_avatar")
        );
    }

    private MessageRow messageRow(ResultSet rs) throws SQLException {
        return new MessageRow(
                rs.getObject("id", UUID.class),
                rs.getObject("conversation_id", UUID.class),
                rs.getObject("sender_id", UUID.class),
                rs.getString("sender_name"),
                rs.getString("sender_username"),
                rs.getString("sender_avatar"),
                rs.getString("content"),
                instant(rs.getTimestamp("created_at")),
                instant(rs.getTimestamp("edited_at")),
                instant(rs.getTimestamp("deleted_at")),
                instant(rs.getTimestamp("moderated_at")),
                rs.getString("client_message_id")
        );
    }

    private String directKey(UUID first, UUID second) {
        return first.compareTo(second) < 0 ? first + ":" + second : second + ":" + first;
    }

    private String avatarUrl(String objectKey) {
        return objectKey == null ? null : "/api/v1/files/avatar/" + objectKey;
    }

    private Instant instant(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toInstant();
    }

    public record ConversationRow(
            UUID id,
            String type,
            String name,
            String avatarObjectKey,
            String status,
            String preview,
            Instant latestMessageAt,
            long unreadCount,
            long memberCount,
            String directName,
            String directAvatarObjectKey
    ) { }

    public record MessageRow(
            UUID id,
            UUID conversationId,
            UUID senderId,
            String senderName,
            String senderUsername,
            String senderAvatarObjectKey,
            String content,
            Instant createdAt,
            Instant editedAt,
            Instant deletedAt,
            Instant moderatedAt,
            String clientMessageId
    ) { }
}
