# Implementation Plan — Vertical Slices

Each phase includes migration/domain/API/security tests + React UI/state/tests. Documentation learning notes remain outside production UI.

## Phase 0 — Foundation (complete)
Java 21/Spring Boot, React/Vite/TypeScript, Docker Compose, PostgreSQL/Redis/API/web, Flyway baseline, CI smoke gates.

## Phase 1 — Authentication and user persistence
FR-1..5 plus role/account/token foundations required by FR-40+. Register/login/refresh/logout/profile; rotation/reuse detection; protected routes; integration tests.

## Phase 2 — Friends and blocking
FR-6..11. Relationship state machine and friend-gate service, people UI, comprehensive state-combination tests.

## Phase 3 — Direct messaging core
FR-12,14,15,29,30. Conversation/message persistence, STOMP, history, read pointers, unread badges, reconnect merge.

## Phase 4 — Attachments, lifecycle, reactions, search, push
FR-13,22..28,31. Private storage, presence/typing/receipts, edit/recall/reaction, FTS, Web Push.

## Phase 5 — Groups and group administration
FR-16..21. Single-admin transfer/succession, membership UI, invariant tests.

## Phase 6 — Reporting and notifications
FR-32..39. Reports/evidence/comments/notifications, report UI, user-facing status, retention jobs.

## Phase 7 — Administration foundation
FR-40..48. Portal shell/guards, dashboard, user directory/detail, account state/session/profile/role actions, hierarchy/audit tests.

## Phase 8 — Moderation, groups, audit
FR-49..56. Report queue/review/bounded context, outcomes, moderation tombstones, group close/reopen, audit log UI/security tests.

## Phase 9 — Production hardening and demo release
Rate limits, structured logs/metrics, accessibility, Playwright critical journeys, performance checks, backup/restore exercise, Render/Supabase deployment.

## Definition of done per slice
1. Requirement + trace row reviewed.
2. Flyway migration and rollback/forward-fix reasoning.
3. Domain/service with transaction and authorization.
4. REST/STOMP contract and safe errors.
5. Unit + integration/security tests.
6. React data/state/UI including loading/empty/error/permission states.
7. Frontend behavior tests; E2E where critical.
8. Docs/ADR/traceability updated if behavior changed.
9. Small conventional commit reviewed with no secrets/build artifacts.
