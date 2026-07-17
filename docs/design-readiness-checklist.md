# Design Readiness Checklist — Phase 0 Entry Gate

**Baseline date:** 2026-07-17  
**Decision:** READY FOR PHASE 0

This checklist is the final cross-document gate. It does not claim the system is
implemented; it confirms that implementation can start without an unresolved
product or architecture decision.

## Scope and traceability

- [x] Product brief defines target users, problem, in-scope, and out-of-scope.
- [x] Functional requirements are frozen at FR-1..FR-31.
- [x] Non-functional requirements are frozen at NFR-1..NFR-28.
- [x] Module ownership is consistent:
  - `auth/user`: FR-1..5
  - `friend`: FR-6..11
  - `message`: FR-12..21, FR-24..30
  - `presence`: FR-22..23 and online-state support for FR-31
  - `push`: FR-31
  - rate limiter: cross-cutting NFR-17..21
- [x] ADR references, API references, and implementation phases use the same FR
  numbering.

## Architecture and data

- [x] Deployment unit is a Spring Boot modular monolith with a React SPA.
- [x] PostgreSQL is the durable source of truth.
- [x] The durable schema contains 11 tables.
- [x] Redis-compatible state is limited to reconstructable presence and
  rate-limit windows; typing is relayed and not persisted.
- [x] Local Redis runs in Docker Compose.
- [x] Demo Redis provider is Render Key Value (Valkey, Redis-compatible),
  configured through `REDIS_URL`.
- [x] Message persistence occurs before ACK and before delivery side effects.

## Realtime and offline behavior

- [x] Online recipients receive STOMP/WebSocket events.
- [x] Offline recipients receive best-effort Web Push when a valid subscription
  exists.
- [x] Web Push has no guaranteed retry/dead-letter queue in this stage.
- [x] REST history reconciles state after reconnect or notification open.
- [x] PostgreSQL, not WebSocket or Push, remains the delivery source of truth.

## Attachment security

- [x] Supabase Storage bucket is private.
- [x] PostgreSQL stores an immutable `object_key`, not a permanent public URL.
- [x] API checks active conversation membership before generating download URLs.
- [x] Signed URL target TTL is 5 minutes.
- [x] Browser downloads file bytes directly from storage after authorization.
- [x] Expired URLs are refreshed through an authorized API path.
- [x] Orphaned unlinked uploads are eligible for cleanup.

## Testing and CI

- [x] Backend service logic targets at least 80% line coverage.
- [x] Every REST endpoint and STOMP destination receives an integration test.
- [x] PostgreSQL and Redis-compatible integration behavior uses Testcontainers.
- [x] Frontend minimum uses Vitest + React Testing Library for auth, protected
  routes, message states, realtime merging, and unread behavior.
- [x] CI runs backend tests plus frontend lint, tests, and build.
- [x] Failed CI blocks deployment.
- [x] Browser E2E and load testing remain explicitly deferred, not silently
  assumed complete.

## Scope control and future triggers

- [x] Kafka is not a Phase-0 dependency or roadmap checkbox.
- [x] An event broker is reconsidered only when service extraction, event replay,
  independent consumers, or durable asynchronous retries create a concrete need.
- [x] Multi-instance WebSocket fan-out is deferred until horizontal scaling is
  required.
- [x] Any post-freeze architecture change requires a new/revised ADR and matching
  updates to requirements, API/schema, tests, and implementation plan.

## Phase 0 entry criteria

Phase 0 may start when work follows `docs/README.md` and produces:

1. Spring Boot and React/Vite project skeletons with declared module boundaries.
2. PostgreSQL, Redis, API, and web running through Docker Compose.
3. Flyway baseline for the 11-table target schema.
4. Vitest/React Testing Library and Spring/Testcontainers test foundations.
5. GitHub Actions running backend tests and frontend lint/test/build.
6. `.env.example` documenting local variables without committing secrets.

No further design confirmation is required before starting these tasks.
