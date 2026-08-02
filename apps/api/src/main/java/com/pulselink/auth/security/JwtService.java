package com.pulselink.auth.security;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Service;

import com.pulselink.auth.domain.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;

@Service
public class JwtService {

    private static final String USERNAME_CLAIM = "username";
    private static final String ROLE_CLAIM = "role";
    private static final String TOKEN_VERSION_CLAIM = "tokenVersion";
    private static final String SESSION_ID_CLAIM = "sessionId";

    private final SecretKey signingKey;
    private final long accessTokenTtlMinutes;

    public JwtService(JwtProperties properties) {
        byte[] raw = properties.secret().getBytes(StandardCharsets.UTF_8);
        byte[] keyBytes = raw.length >= 32 ? raw : padTo32Bytes(raw);
        this.signingKey = new SecretKeySpec(keyBytes, "HmacSHA256");
        this.accessTokenTtlMinutes = properties.accessTokenTtlMinutes();
    }

    private static byte[] padTo32Bytes(byte[] raw) {
        byte[] padded = new byte[32];
        System.arraycopy(raw, 0, padded, 0, Math.min(raw.length, 32));
        return padded;
    }

    public String issueAccessToken(User user, UUID sessionId) {
        Instant now = Instant.now();
        Instant expiry = now.plus(Duration.ofMinutes(accessTokenTtlMinutes));

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim(USERNAME_CLAIM, user.getUsername())
                .claim(ROLE_CLAIM, user.getRole().name())
                .claim(TOKEN_VERSION_CLAIM, user.getTokenVersion())
                .claim(SESSION_ID_CLAIM, sessionId.toString())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(signingKey)
                .compact();
    }

    public long accessTokenTtlSeconds() {
        return Duration.ofMinutes(accessTokenTtlMinutes).toSeconds();
    }

    public Optional<AccessTokenClaims> parse(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Optional.of(new AccessTokenClaims(
                    UUID.fromString(claims.getSubject()),
                    claims.get(USERNAME_CLAIM, String.class),
                    claims.get(ROLE_CLAIM, String.class),
                    claims.get(TOKEN_VERSION_CLAIM, Integer.class),
                    UUID.fromString(claims.get(SESSION_ID_CLAIM, String.class))
            ));
        } catch (JwtException | IllegalArgumentException | NullPointerException ex) {
            return Optional.empty();
        }
    }

    public Optional<UUID> parseUserId(String token) {
        return parse(token).map(AccessTokenClaims::userId);
    }

    public record AccessTokenClaims(
            UUID userId,
            String username,
            String role,
            int tokenVersion,
            UUID sessionId
    ) { }
}
