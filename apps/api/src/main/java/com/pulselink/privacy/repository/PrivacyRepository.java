package com.pulselink.privacy.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.pulselink.privacy.dto.PrivacySettingsResponse;
import com.pulselink.privacy.dto.UpdatePrivacySettingsRequest;

@Repository
public class PrivacyRepository {

    private final JdbcTemplate jdbc;

    public PrivacyRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<PrivacySettingsResponse> find(UUID userId) {
        return jdbc.query("""
                select discoverable,allow_friend_requests,allow_direct_messages,
                       send_read_receipts,show_typing_indicators,profile_visibility,
                       show_online_status,show_last_active
                from users where id=?
                """, (rs, rowNum) -> new PrivacySettingsResponse(
                rs.getBoolean("discoverable"),
                rs.getBoolean("allow_friend_requests"),
                rs.getBoolean("allow_direct_messages"),
                rs.getBoolean("send_read_receipts"),
                rs.getBoolean("show_typing_indicators"),
                rs.getString("profile_visibility"),
                rs.getBoolean("show_online_status"),
                rs.getBoolean("show_last_active")
        ), userId).stream().findFirst();
    }

    public boolean sendsReadReceipts(UUID userId) {
        Boolean enabled = jdbc.queryForObject(
                "select send_read_receipts from users where id=?",
                Boolean.class,
                userId
        );
        return Boolean.TRUE.equals(enabled);
    }

    public void update(UUID userId, UpdatePrivacySettingsRequest request) {
        jdbc.update("""
                update users
                set discoverable=?,allow_friend_requests=?,allow_direct_messages=?,
                    send_read_receipts=?,show_typing_indicators=?,profile_visibility=?,
                    show_online_status=?,show_last_active=?,updated_at=now()
                where id=?
                """,
                request.discoverable(),
                request.allowFriendRequests(),
                request.allowDirectMessages(),
                request.sendReadReceipts(),
                request.showTypingIndicators(),
                request.profileVisibility(),
                request.showOnlineStatus(),
                request.showLastActive(),
                userId
        );
    }
}
