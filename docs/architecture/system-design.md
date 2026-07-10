# System Design — Full Scope

Target shape of the whole system, derived from `docs/requirements/`.
**Nothing in this system is built yet** (verified 2026-07-09) — this is
the map the implementation will follow.

## C1 — System context

```mermaid
flowchart TB
    User(("End user<br/>(browser)"))
    PulseLink["PulseLink"]
    Storage[("Supabase Storage<br/>(attachment files)")]

    User -->|"HTTPS + WSS"| PulseLink
    User -->|"fetch attachment (direct URL)"| Storage
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
        Msg["message module<br/>(FR-12..20, 25..28)"]
        Presence["presence module<br/>(FR-21..24, 29..31)"]
        Push["push module<br/>(FR-31, ADR-0016)"]
        RateLimit["rate limiter<br/>(ADR-0017, cross-cutting)"]
    end

    DB[("PostgreSQL<br/>users, friendships, conversations,<br/>messages (+ search_vector), attachments,<br/>reactions, receipts, push_subscriptions")]
    Cache[("Redis<br/>presence, typing, rate-limit counters")]
    Storage[("Supabase Storage<br/>attachment files, ADR-0003")]
    PushSvc[("Browser push service<br/>(e.g. FCM/Mozilla push endpoints)<br/>ADR-0016 — not PulseLink's own infra")]

    Web -->|"REST"| Auth
    Web -->|"REST"| Friend
    Web -->|"REST (history, edit/delete, upload, search)"| Msg
    Web -->|"WebSocket (live delivery, typing, reactions, receipts)"| Msg
    Web -->|"WebSocket (presence events)"| Presence
    Web -->|"register subscription"| Push

    Auth --> DB
    Friend --> DB
    Msg --> DB
    Msg --> Storage
    Presence --> Cache
    Push --> DB
    Push -->|"encrypted payload"| PushSvc
    PushSvc -->|"delivers to browser, even if closed"| Web
    Msg -.->|"is recipient online? / is sender blocked?"| Presence
    Msg -.->|"are these two users friends?"| Friend
    Msg -.->|"recipient offline? trigger push"| Push
    RateLimit -.->|"guards"| Auth
    RateLimit -.->|"guards"| Friend
    RateLimit -.->|"guards"| Msg
```

Key ties to requirements:
- **Friend gate** (ADR-0008): the `message` module never creates a direct
  conversation without checking `friend` module state first — this is the
  single most important cross-module dependency in the system.
- **Attachments bypass the API for reads** (ADR-0003): the API is only in
  the *upload* path; fetching an attachment goes straight from the
  browser to Supabase Storage, keeping the API off the hot path for
  potentially large file downloads (consistent with NFR-2's API latency
  target — that budget is for API calls, not raw file transfer).
- **Redis only holds what's fine to lose** (presence, typing) — nothing
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

    Sender->>Msg: send message (conversationId, text, [attachment])
    Msg->>Friend: are sender & recipient friends, not blocked?
    Friend-->>Msg: yes
    opt has attachment
        Msg->>Storage: upload file
        Storage-->>Msg: file URL
    end
    Msg->>DB: persist message (+ message_attachments row if any)
    Msg->>Presence: is recipient online?
    alt online
        Presence-->>Msg: yes
        Msg->>Recipient: push over WebSocket (NFR-1: <500ms)
    else offline
        Note over Msg: nothing pushed; recipient fetches via<br/>REST history on next login
    end
    Msg-->>Sender: ack (persisted)
```

## What this design deliberately does not solve yet
- Multi-instance WebSocket fan-out (ADR-0007's named future trigger).
- Retry/dead-letter handling for failed push notifications (ADR-0016).
- Fuzzy/relevance-ranked search (ADR-0015 — exact keyword matching only).
- Virus scanning or thumbnailing of uploaded attachments (explicit NFR
  exclusion).

See [`deployment.md`](./deployment.md) for how this system reaches the
outside world (hosting, CI/CD) and [`../testing/strategy.md`](../testing/strategy.md)
for how it's verified before it gets there.
