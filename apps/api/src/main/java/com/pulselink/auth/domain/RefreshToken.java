package com.pulselink.auth.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "token_hash", nullable = false, unique = true, length = 255)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean revoked;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(name = "family_id", nullable = false)
    private UUID familyId;

    @Column(name = "device_name", nullable = false, length = 160)
    private String deviceName;

    @Column(nullable = false, length = 120)
    private String browser;

    @Column(name = "operating_system", nullable = false, length = 120)
    private String operatingSystem;

    @Column(name = "ip_address", nullable = false, length = 64)
    private String ipAddress;

    @Column(length = 160)
    private String location;

    @Column(name = "last_used_at", nullable = false)
    private Instant lastUsedAt;

    @Column(name = "token_version", nullable = false)
    private int tokenVersion;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected RefreshToken() {
        // JPA
    }

    public RefreshToken(
            User user,
            String tokenHash,
            Instant expiresAt,
            UUID familyId,
            SessionMetadata sessionMetadata
    ) {
        this.id = UUID.randomUUID();
        this.user = user;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
        this.familyId = familyId == null ? this.id : familyId;
        this.deviceName = sessionMetadata.deviceName();
        this.browser = sessionMetadata.browser();
        this.operatingSystem = sessionMetadata.operatingSystem();
        this.ipAddress = sessionMetadata.ipAddress();
        this.location = sessionMetadata.location();
        this.lastUsedAt = Instant.now();
        this.tokenVersion = user.getTokenVersion();
        this.revoked = false;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        if (this.lastUsedAt == null) {
            this.lastUsedAt = now;
        }
    }

    public UUID getId() { return id; }
    public User getUser() { return user; }
    public String getTokenHash() { return tokenHash; }
    public Instant getExpiresAt() { return expiresAt; }
    public boolean isRevoked() { return revoked; }
    public UUID getFamilyId() { return familyId; }
    public String getDeviceName() { return deviceName; }
    public String getBrowser() { return browser; }
    public String getOperatingSystem() { return operatingSystem; }
    public String getIpAddress() { return ipAddress; }
    public String getLocation() { return location; }
    public Instant getLastUsedAt() { return lastUsedAt; }
    public Instant getCreatedAt() { return createdAt; }

    public void revoke() {
        this.revoked = true;
        this.revokedAt = Instant.now();
    }

    public void touch() {
        this.lastUsedAt = Instant.now();
    }

    public boolean isUsable(Instant now) {
        return !revoked
                && expiresAt.isAfter(now)
                && tokenVersion == user.getTokenVersion()
                && user.canAuthenticate(now);
    }

    public record SessionMetadata(
            String deviceName,
            String browser,
            String operatingSystem,
            String ipAddress,
            String location
    ) {
        public SessionMetadata {
            deviceName = fallback(deviceName, "Unknown device");
            browser = fallback(browser, "Unknown browser");
            operatingSystem = fallback(operatingSystem, "Unknown operating system");
            ipAddress = fallback(ipAddress, "Unknown");
        }

        private static String fallback(String value, String fallback) {
            return value == null || value.isBlank() ? fallback : value;
        }
    }
}
