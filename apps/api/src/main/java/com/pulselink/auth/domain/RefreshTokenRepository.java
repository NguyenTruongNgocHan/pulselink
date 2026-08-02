package com.pulselink.auth.domain;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Query("""
            select token from RefreshToken token
            where token.user.id = :userId
              and token.revoked = false
              and token.expiresAt > :now
            order by token.lastUsedAt desc
            """)
    List<RefreshToken> findActiveSessions(
            @Param("userId") UUID userId,
            @Param("now") Instant now
    );

    @Modifying
    @Query("""
            update RefreshToken token
            set token.revoked = true, token.revokedAt = :now
            where token.user.id = :userId and token.revoked = false
            """)
    int revokeAllForUser(
            @Param("userId") UUID userId,
            @Param("now") Instant now
    );

    @Modifying
    @Query("""
            update RefreshToken token
            set token.revoked = true, token.revokedAt = :now
            where token.user.id = :userId
              and token.id <> :currentSessionId
              and token.revoked = false
            """)
    int revokeOtherSessions(
            @Param("userId") UUID userId,
            @Param("currentSessionId") UUID currentSessionId,
            @Param("now") Instant now
    );

    @Modifying
    @Query("""
            update RefreshToken token
            set token.revoked = true, token.revokedAt = :now
            where token.familyId = :familyId and token.revoked = false
            """)
    int revokeFamily(
            @Param("familyId") UUID familyId,
            @Param("now") Instant now
    );
}
