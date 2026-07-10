# PulseLink Documentation — Full System Design (Complete Edition)

**Status: 100% design, 0% built.** Verified against the actual repository
on 2026-07-09 — no business logic exists yet. Every file below is the
target to implement against, not a record of what exists. This edition
(round 2, 2026-07-09) adds message search, push notifications, testing
strategy, deployment/CI-CD, and rate limiting on top of the round-1 core
messenger design — and revises group admin succession (ADR-0009) after a
scenario walkthrough surfaced a real gap in the original version.

## Reading order

1. [`requirements/product-brief.md`](./requirements/product-brief.md) —
   the client problem, confirmed scope (2 rounds).
2. [`requirements/functional-requirements.md`](./requirements/functional-requirements.md)
   (31 FRs) & [`non-functional-requirements.md`](./requirements/non-functional-requirements.md)
   (28 NFRs) — testable requirements.
3. [`architecture/system-design.md`](./architecture/system-design.md) —
   target system shape (C4-style), and
   [`architecture/deployment.md`](./architecture/deployment.md) — how it
   reaches the outside world.
4. [`decisions/`](./decisions) — 20 ADRs (0000–0019), starting at
   `ADR-0000`.
5. [`database/schema.md`](./database/schema.md) (9 tables) &
   [`api/`](./api) (6 endpoint/protocol references) — implementation-
   ready design.
6. [`testing/strategy.md`](./testing/strategy.md) — how all of the above
   gets verified, not just designed.

## ADR index

| ADR | Decision |
|---|---|
| [0000](./decisions/ADR-0000-modular-monolith.md) | Modular monolith, not microservices |
| [0001](./decisions/ADR-0001-monorepo-structure.md) | Monorepo (`apps/api` + `apps/web`) |
| [0002](./decisions/ADR-0002-database-postgres-supabase.md) | PostgreSQL, hostable on Supabase |
| [0003](./decisions/ADR-0003-attachment-storage-supabase.md) | Supabase Storage for attachments |
| [0004](./decisions/ADR-0004-custom-jwt-vs-managed-auth.md) | Hand-rolled Spring Security + JWT |
| [0005](./decisions/ADR-0005-refresh-token-rotation.md) | Opaque, DB-backed, rotating refresh tokens |
| [0006](./decisions/ADR-0006-docker-compose-orchestration.md) | Docker Compose, not Kubernetes |
| [0007](./decisions/ADR-0007-realtime-transport-stomp.md) | STOMP over WebSocket (+ SockJS) |
| [0008](./decisions/ADR-0008-friend-system.md) | Friend-gated messaging + blocking |
| [0009](./decisions/ADR-0009-group-role-model.md) | Single-admin group role, **explicit transfer + succession** (revised round 2) |
| [0010](./decisions/ADR-0010-unified-read-receipts.md) | Unified per-participant read receipts |
| [0011](./decisions/ADR-0011-unread-count-last-read-pointer.md) | Last-read pointer for unread counts |
| [0012](./decisions/ADR-0012-message-edit-delete.md) | In-place edit, soft-delete tombstone |
| [0013](./decisions/ADR-0013-emoji-reaction-model.md) | One reaction per user per message |
| [0014](./decisions/ADR-0014-presence-redis-ttl.md) | Redis TTL presence, WebSocket-driven |
| [0015](./decisions/ADR-0015-message-search-postgres-fts.md) | Postgres full-text search, not a search engine |
| [0016](./decisions/ADR-0016-push-notifications-webpush.md) | Web Push API (VAPID), not FCM |
| [0017](./decisions/ADR-0017-rate-limiting-redis.md) | Redis fixed-window rate limiting |
| [0018](./decisions/ADR-0018-deployment-cicd.md) | Render + Vercel + Supabase, GitHub Actions CI |
| [0019](./decisions/ADR-0019-testcontainers.md) | Testcontainers (real Postgres) for integration tests |

## Confirmed scope (as of 2026-07-09, round 2)
**In scope**: friend list (request/accept/decline, block/unblock), image/
file attachments, emoji reactions (one per user per message), group chat
with single-admin + explicit hand-off + auto-succession, detailed
per-person read receipts, edit/delete, unread badges, presence, typing,
**message search**, **push notifications for offline users**, **rate
limiting**, and a defined **testing + deployment/CI pipeline**.

**Out of scope**: voice/video calling, end-to-end encryption, native
mobile app, fuzzy/relevance-ranked search, retry queues for failed push,
virus scanning of attachments, staging environment, automated rollback,
end-to-end browser tests, load testing.

## Resolved since last edition
- ~~ADR-0009 open item (admin succession)~~ — resolved: explicit
  no-consent transfer + earliest-`joined_at` auto-succession with random
  tie-break for simultaneous joins. See the ADR's "Revision note" for the
  full reasoning.

## Nothing currently open
No pending confirmations at this time — this edition is implementation-
ready. The next step is writing code against it (starting with `auth`,
per the module dependency order in `functional-requirements.md`'s
Traceability section), or raising anything that still looks off before
that starts.
