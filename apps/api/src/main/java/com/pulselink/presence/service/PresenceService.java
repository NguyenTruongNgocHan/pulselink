package com.pulselink.presence.service;

import java.time.Duration;
import java.util.Collections;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class PresenceService {

    private static final Duration SESSION_TTL = Duration.ofSeconds(90);
    private static final Duration USER_SESSION_SET_TTL = Duration.ofHours(24);
    private static final String SESSION_PREFIX = "presence:session:";
    private static final String USER_SESSIONS_PREFIX = "presence:user:";

    private final StringRedisTemplate redisTemplate;

    public PresenceService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void register(UUID userId, String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return;
        }

        redisTemplate.opsForValue().set(sessionKey(sessionId), userId.toString(), SESSION_TTL);
        redisTemplate.opsForSet().add(userSessionsKey(userId), sessionId);
        redisTemplate.expire(userSessionsKey(userId), USER_SESSION_SET_TTL);
    }

    public void heartbeat(UUID userId, String sessionId) {
        register(userId, sessionId);
    }

    public void disconnect(UUID userId, String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return;
        }

        redisTemplate.delete(sessionKey(sessionId));
        redisTemplate.opsForSet().remove(userSessionsKey(userId), sessionId);
    }

    public boolean isOnline(UUID userId) {
        Set<String> sessionIds = redisTemplate.opsForSet().members(userSessionsKey(userId));
        if (sessionIds == null || sessionIds.isEmpty()) {
            return false;
        }

        boolean online = false;
        for (String sessionId : sessionIds) {
            if (Boolean.TRUE.equals(redisTemplate.hasKey(sessionKey(sessionId)))) {
                online = true;
            } else {
                redisTemplate.opsForSet().remove(userSessionsKey(userId), sessionId);
            }
        }
        return online;
    }

    public Set<String> activeSessions(UUID userId) {
        Set<String> sessionIds = redisTemplate.opsForSet().members(userSessionsKey(userId));
        if (sessionIds == null) {
            return Collections.emptySet();
        }
        sessionIds.removeIf(sessionId -> !Boolean.TRUE.equals(
                redisTemplate.hasKey(sessionKey(sessionId))
        ));
        return Set.copyOf(sessionIds);
    }

    private String sessionKey(String sessionId) {
        return SESSION_PREFIX + sessionId;
    }

    private String userSessionsKey(UUID userId) {
        return USER_SESSIONS_PREFIX + userId + ":sessions";
    }
}
