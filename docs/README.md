# PulseLink Documentation — Full System Design (Complete Edition)

**Status: 100% design, 0% built.** Verified against the actual repository
on 2026-07-17 — no business logic exists yet. Every file below is the
target to implement against, not a record of what exists. This final design baseline (2026-07-17) consolidates the complete product, architecture, data, API, realtime, security, testing, and deployment decisions required to begin Phase 0.

## Reading order

1. [`requirements/product-brief.md`](./requirements/product-brief.md) —
   the client problem and frozen Phase-0 scope.
2. [`requirements/functional-requirements.md`](./requirements/functional-requirements.md)
   (31 FRs) & [`non-functional-requirements.md`](./requirements/non-functional-requirements.md)
   (28 NFRs) — testable requirements.
3. [`architecture/system-design.md`](./architecture/system-design.md) —
   target system shape (C4-style), and
   [`architecture/deployment.md`](./architecture/deployment.md) — how it
   reaches the outside world.
4. [`decisions/`](./decisions) — 20 ADRs (0000–0019), starting at
   `ADR-0000`.
5. [`database/schema.md`](./database/schema.md) (11 tables) &
   [`api/`](./api) (6 endpoint/protocol references) — implementation-
   ready design.
6. [`testing/strategy.md`](./testing/strategy.md) — how all of the above
   gets verified, not just designed.
7. [`design-readiness-checklist.md`](./design-readiness-checklist.md) — final
   cross-document consistency and Phase-0 entry gate.

## ADR index

| ADR | Decision |
|---|---|
| [0000](./decisions/ADR-0000-modular-monolith.md) | Modular monolith, not microservices |
| [0001](./decisions/ADR-0001-monorepo-structure.md) | Monorepo (`apps/api` + `apps/web`) |
| [0002](./decisions/ADR-0002-database-postgres-supabase.md) | PostgreSQL, hostable on Supabase |
| [0003](./decisions/ADR-0003-attachment-storage-supabase.md) | Private Supabase Storage + authorized signed URLs |
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
| [0018](./decisions/ADR-0018-deployment-cicd.md) | Render API + Render Key Value, Vercel, Supabase, GitHub Actions CI |
| [0019](./decisions/ADR-0019-testcontainers.md) | Testcontainers (real Postgres) for integration tests |

## Confirmed scope (design freeze: 2026-07-17)
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

## Resolved in the final design baseline
- Group admin succession: explicit no-consent transfer plus earliest-`joined_at`
  auto-succession with random tie-break for simultaneous joins (ADR-0009).
- Attachment privacy: a **private Supabase Storage bucket**; the database stores
  an immutable object key, while the API returns short-lived signed download
  URLs only after conversation authorization (ADR-0003).
- Offline delivery: messages are always persisted; online recipients receive a
  WebSocket event, while recipients with no active connection receive a
  best-effort Web Push notification when a valid subscription exists (ADR-0016).
- Demo Redis provider: **Render Key Value (Valkey, Redis-compatible)** in the
  same Render region as the API; local development still uses Redis in Docker
  Compose (ADR-0018).
- Kafka: not part of the implementation plan; it is a future option only after
  a concrete trigger such as module extraction, event replay, or independent
  asynchronous consumers.
- Frontend verification: Vitest + React Testing Library tests are required for
  critical auth, routing, chat rendering, and unread-state behavior.

## Design freeze
No product or architecture decision remains open for Phase 0. Provider pricing
and free-tier availability must still be re-checked at deployment time because
those external terms can change, but the architectural fallback is fixed:
replace the managed Redis-compatible endpoint without changing application
interfaces. This documentation is the implementation baseline; changes after
Phase 0 must be recorded through an ADR or a requirement revision.

## Implementation Plan

Order follows the dependency chain already established in
`requirements/functional-requirements.md`'s Traceability section — each
phase is a demoable vertical slice (backend + frontend + tests), not a
backend-only or frontend-only milestone. Tests are written *within* each
phase, not deferred to the end (per `testing/strategy.md` / NFR-27).

### Phase 0 — Project skeleton
- Backend: Spring Boot project structure per module boundaries
  (`auth`, `friend`, `message`, `presence`, `push`), `pom.xml` deps
  (Security, JPA, WebSocket, Validation, jjwt), Flyway baseline migration
  setup (per `schema.md`'s migration-tooling note).
- Frontend: Vite + React + TypeScript scaffold, routing skeleton
  (login/register/app shell), Zustand store skeleton, TanStack Query
  client setup, Vitest + React Testing Library + jsdom configuration.
- Infra: `docker-compose.yml` (Postgres, Redis, api, web) per ADR-0006.
- CI: GitHub Actions skeleton (backend test job, frontend lint/test/build job) —
  includes one React smoke test and one Spring context test, wired early so every later phase
  is gated by it from day one (ADR-0018).
- **Exit criteria**: `docker compose up` runs all 4 services; CI pipeline runs lint, frontend tests, frontend build, and backend tests on push.

### Phase 1 — Auth (FR-1..5)
- Backend: `User` entity, `AuthController`/`AuthService`/`JwtService`/
  `RefreshTokenService`/`SecurityConfig` per ADR-0002/0004/0005.
- Frontend: register/login pages, token storage + auto-refresh
  interceptor, protected route wrapper, profile edit page.
- Tests: unit (JwtService, RefreshTokenService rotation), integration
  (full register→login→refresh→logout flow, Testcontainers).
- **Exit criteria**: can register, log in, stay logged in across a
  refresh, log out, edit profile — end to end through the real UI.

### Phase 2 — Friends (FR-6..11)
- Backend: `Friendship`/`UserBlock` entities, `FriendshipService`
  (`.areFriends()`/`.isBlocked()` — get this right early, everything
  downstream depends on it per ADR-0008), search/request/accept/decline/
  remove/block endpoints.
- Frontend: user search, friend request inbox (incoming/outgoing), friend
  list, block/unblock UI.
- Tests: unit on every relationship-state combination (this is the
  highest-leverage test in the system per `testing/strategy.md`).
- **Exit criteria**: two test accounts can become friends and see each
  other in their friend lists; a blocked user can't send a request.

### Phase 3 — Direct messaging core (FR-12, 14, 15)
- Backend: `Conversation`/`Message` entities, STOMP config (ADR-0007),
  friend-gate check on conversation creation, cursor-paginated history
  endpoint.
- Frontend: conversation list, chat window, WebSocket client connection
  (`@stomp/stompjs`), send/receive text messages live.
- Tests: integration test with two WebSocket test clients (sender +
  recipient) proving live delivery + persistence.
- **Exit criteria**: two friends can chat in real time in two browser
  windows; refreshing shows history.

### Phase 4 — Attachments & reactions (FR-13, 27)
- Backend: private Supabase Storage integration (ADR-0003), upload endpoint, signed-download URL generation after authorization,
  `MessageAttachment`/`MessageReaction` entities, reaction
  replace-not-append logic (ADR-0013).
- Frontend: file/image picker + preview, authorized signed-URL attachment rendering in chat,
  emoji reaction picker on messages.
- **Exit criteria**: can send an image in a direct chat; can react to any
  message with an emoji, changing it updates in place.

### Phase 5 — Group chat (FR-16..21)
- Backend: group creation (friends-only invite per ADR-0008),
  `conversation_participants.role`, add/remove member endpoints, **the
  ADR-0009 succession algorithm** (explicit transfer + auto-succession +
  random tie-break) — allocate real test-writing time here, it's the
  most intricate logic in the system.
- Frontend: create-group flow, member management UI (admin-only add/
  remove), leave-group action, admin badge/indicator, transfer-admin UI.
- Tests: every branch of the succession algorithm named in ADR-0009 and
  `testing/strategy.md`, not just the happy path.
- **Exit criteria**: create a group with 3 friends, admin leaves, a
  successor is auto-assigned; manually transfer admin to someone else.

### Phase 6 — Presence, typing, receipts, unread (FR-22..24, 29, 30)
- Backend: Redis presence (ADR-0014), typing relay, `message_read_receipts`
  (ADR-0010) + `last_read_message_id` (ADR-0011), unread-count query.
- Frontend: online indicator, typing indicator, seen-by avatars/list,
  unread badge per conversation that clears on open.
- **Exit criteria**: presence dot updates live; typing shows/hides
  correctly; opening a conversation clears its badge and shows who's
  seen each message.

### Phase 7 — Search & push notifications (FR-28, 31)
- Backend: `search_vector` generated column + GIN index (ADR-0015),
  search endpoint; `push_subscriptions` table, VAPID setup, service-worker
  push send on offline-recipient message (ADR-0016).
- Frontend: search bar + results UI; service worker registration +
  notification-permission prompt.
- **Exit criteria**: searching a keyword finds a past message; closing
  the tab and having a friend message you triggers a real browser push.

### Phase 8 — Rate limiting & hardening (NFR-17..21)
- Backend: `RateLimiter` (Redis fixed-window, ADR-0017) wired into auth,
  friend-request, message-send, and upload paths; `429` responses with
  `Retry-After`.
- Tests: unit tests with a fake clock proving window/threshold behavior.
- **Exit criteria**: rapid-fire login attempts or friend requests get
  throttled with a proper error, not silently accepted or crashing.

### Phase 9 — Deployment
- Wire the GitHub Actions pipeline fully (both jobs required to pass),
  provision Render (API + Render Key Value) + Vercel (web) + confirm Supabase prod project,
  set all secrets per `architecture/deployment.md`.
- **Exit criteria**: pushing to `main` deploys automatically; a reviewer
  can open one public URL and use the full demo with no local setup.

### Notes on sequencing
- Each phase's "Tests" work happens alongside its features, not after —
  a phase isn't done when the UI looks right, it's done when its
  integration tests pass in CI (NFR-27).
- Phases 0–3 are the non-negotiable core (account → friends → direct
  messaging) — if time runs short, everything from Phase 4 onward is
  individually cuttable without breaking what's already demoable, which
  is exactly why they were sequenced last.