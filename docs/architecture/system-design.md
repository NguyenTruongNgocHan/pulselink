# System Design — Full Scope

Target shape of the whole system, derived from `docs/requirements/`.
**Nothing in this system is built yet** (verified 2026-07-17) — this is
the map the implementation will follow.

## C1 — System context

```mermaid
flowchart TB
    User(("End user<br/>(browser)"))
    Staff(("Moderator / Administrator<br/>(browser)"))
    PulseLink["PulseLink"]
    Storage[("Supabase Storage<br/>(attachment files)")]

    User -->|"HTTPS + WSS"| PulseLink
    Staff -->|"HTTPS + WSS (protected /admin)"| PulseLink
    User -->|"fetch attachment (short-lived signed URL)"| Storage
    PulseLink -->|"upload on send"| Storage
```

## C2 — Containers

```mermaid
flowchart TB
    subgraph Client
        Web["Web SPA<br/>React + TypeScript + Vite<br/>+ Service Worker (push)"]
    end

    subgraph Server["API — Spring Boot (modular monolith, ADR-0000)"]
        Auth["auth/user module<br/>(FR-1..5)"]
        Friend["friend module<br/>(FR-6..11)"]
        Msg["message module<br/>(FR-12..21, FR-24..30)"]
        Presence["presence module<br/>(FR-22..23; supports FR-31)"]
        Push["push module<br/>(FR-31, ADR-0016)"]
        Report["report / notification module<br/>(FR-32..39)"]
        Admin["administration / audit module<br/>(FR-40..56)"]
        RateLimit["rate limiter<br/>(ADR-0017, cross-cutting)"]
    end

    DB[("PostgreSQL — 16 tables<br/>identity/social/messaging + reports,<br/>evidence, notifications, audit") ]
    Cache[("Redis-compatible store<br/>local Redis / demo Render Key Value<br/>presence + rate-limit counters")]
    Storage[("Supabase Storage<br/>private attachment bucket, ADR-0003")]
    PushSvc[("Browser push service<br/>(e.g. FCM/Mozilla push endpoints)<br/>ADR-0016 — not PulseLink's own infra")]

    Web -->|"REST"| Auth
    Web -->|"REST"| Friend
    Web -->|"REST (history, edit/delete, upload, search)"| Msg
    Web -->|"WebSocket (live delivery, typing, reactions, receipts)"| Msg
    Web -->|"WebSocket (presence events)"| Presence
    Web -->|"register subscription"| Push
    Web -->|"REST: reports + notifications"| Report
    Web -->|"protected REST: dashboard/users/reports/groups/audit"| Admin

    Auth --> DB
    Friend --> DB
    Msg --> DB
    Msg --> Storage
    Presence --> Cache
    Push --> DB
    Report --> DB
    Admin --> DB
    Push -->|"encrypted payload"| PushSvc
    PushSvc -->|"delivers to browser, even if closed"| Web
    Msg -.->|"is recipient online? / is sender blocked?"| Presence
    Msg -.->|"are these two users friends?"| Friend
    Msg -.->|"recipient offline? trigger push"| Push
    RateLimit -.->|"guards"| Auth
    RateLimit -.->|"guards"| Friend
    RateLimit -.->|"guards"| Msg
    RateLimit -.->|"guards"| Report
    RateLimit -.->|"guards"| Admin
    Admin -.->|"commands via application services"| Auth
    Admin -.->|"commands via application services"| Msg
    Admin -.->|"report-scoped evidence only"| Report
```

Key ties to requirements:
- **Friend gate** (ADR-0008): the `message` module never creates a direct
  conversation without checking `friend` module state first — this is the
  single most important cross-module dependency in the system.
- **Private attachments use authorized signed URLs** (ADR-0003): the API
  accepts uploads and stores an immutable object key. For reads, the client
  requests message/history data; after checking active conversation membership,
  the API supplies a short-lived signed URL. The browser then downloads the
  bytes directly from Supabase Storage, so authorization remains server-side
  without proxying the file body through the API.
- **The Redis-compatible store only holds what is safe to reconstruct** (presence and rate-limit windows) — nothing
  required by NFR-12 (message durability) touches it.

## C3 — Module boundaries

```mermaid
flowchart LR
    subgraph auth_module["auth / user"]
        UserSvc["UserLookupService"]
    end
    subgraph friend_module["friend"]
        FriendSvc["FriendshipService<br/>.areFriends() / .isBlocked()"]
    end
    subgraph message_module["message"]
        MsgSvc["MessageService"]
    end
    subgraph presence_module["presence"]
        PresenceSvc["PresenceService<br/>.isOnline()"]
    end

    MsgSvc --> UserSvc
    MsgSvc --> FriendSvc
    MsgSvc --> PresenceSvc
```

Every module boundary here is a single, named service method — the
concrete mechanism (per ADR-0000) that makes a later extraction possible
without a rewrite: if code respects this boundary now, splitting `friend`
or `presence` into its own deployable later is a network call replacing
a method call, not a redesign.

## Data flow: sending a direct message (target design)

```mermaid
sequenceDiagram
    participant Sender as Sender (WebSocket)
    participant Msg as message module
    participant Friend as friend module
    participant DB as PostgreSQL
    participant Storage as Supabase Storage
    participant Presence as presence module
    participant Recipient as Recipient (WebSocket, if online)
    participant Push as push module / browser push service

    Sender->>Msg: send message (conversationId, text, [attachment])
    Msg->>Friend: are sender & recipient friends, not blocked?
    Friend-->>Msg: yes
    opt has attachment
        Msg->>Storage: upload file to private bucket
        Storage-->>Msg: immutable object key
    end
    Msg->>DB: persist message (+ message_attachments row if any)
    Msg->>Presence: is recipient online?
    alt online
        Presence-->>Msg: yes
        Msg->>Recipient: push over WebSocket (NFR-1: <500ms)
    else offline
        Presence-->>Msg: no
        Msg->>Push: send best-effort Web Push if subscription exists
        Push-->>Recipient: notification via service worker (FR-31)
        Note over Recipient: on open/reconnect, fetch REST history;<br/>PostgreSQL remains the source of truth
    end
    Msg-->>Sender: ack (persisted)
```



## Administration portal flow: resolve a reported message

```mermaid
sequenceDiagram
    participant Reporter as Reporting user
    participant Report as report module
    participant DB as PostgreSQL
    participant Moderator as Moderator portal
    participant Admin as administration module
    participant Msg as message module
    participant Notify as notification module

    Reporter->>Report: POST /api/v1/reports (MESSAGE target)
    Report->>DB: persist report + immutable evidence snapshot
    Moderator->>Admin: claim report
    Admin->>DB: OPEN → IN_REVIEW + audit
    Moderator->>Admin: request evidence
    Admin->>Report: evidence + max 5 before/after
    Report-->>Moderator: bounded review model
    Moderator->>Admin: resolve CONTENT_REMOVED (reason)
    Admin->>Msg: moderation-remove reported message
    Admin->>Notify: notify affected user/reporter
    Admin->>DB: outcome + audit + RESOLVED (one transaction)
```

The administration module does not own user, message, or conversation tables directly. It issues authorized application commands to the owning modules, preserving modular-monolith boundaries and domain invariants.

## Account and group state effects

- Non-`ACTIVE` accounts cannot authenticate or establish WebSocket sessions.
- `CLOSED` groups remain readable to existing members but reject new messages and membership mutations.
- User recall (`deleted_at`) and moderator removal (`moderated_at/by/reason`) are separate states.
- Admin dashboard queries use read projections; they never bypass authorization to expose private content.

## What this design deliberately does not solve yet
- Multi-instance WebSocket fan-out (ADR-0007's named future trigger).
- Retry/dead-letter handling for failed push notifications (ADR-0016).
- Fuzzy/relevance-ranked search (ADR-0015 — exact keyword matching only).
- Virus scanning or thumbnailing of uploaded attachments (explicit NFR exclusion).
- AI moderation, staff impersonation, dynamic RBAC, multi-tenancy, or arbitrary private-message browsing.
- Kafka/event broker until measured extraction/replay/consumer triggers exist.

See [`deployment.md`](./deployment.md) for how this system reaches the
outside world (hosting, CI/CD) and [`../testing/strategy.md`](../testing/strategy.md)
for how it's verified before it gets there.
