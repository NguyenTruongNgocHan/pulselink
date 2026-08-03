# PulseLink Documentation — Full System Design (Production Baseline)

**Status: DESIGN COMPLETE.** This edition preserves the original user-application and group-administration design, then integrates the Administration Portal as a first-class system capability rather than an add-on. The documents are the implementation contract; implementation progress is tracked separately in `implementation/implementation-plan.md`.

## Production snapshot

- Frontend: https://pulselink-iota.vercel.app
- Backend API: https://pulselink-api.onrender.com
- Health check: https://pulselink-api.onrender.com/actuator/health
- Frontend hosting: Vercel
- Backend hosting: Render
- Database: Supabase PostgreSQL
- Cache/session store: Render Key Value

> The backend runs on a free Render instance. The first request after a period of inactivity may take 30-60 seconds while the service wakes up.

Current implementation status:

- Phase 0 - Architecture Refactor: complete
- Phase 1 - Core Application: substantially complete
- Phase 2 - Production Deployment: complete
- Remaining work: documented as next improvements, known limitations, future work, and post-deployment hardening

## Reading order

1. `requirements/product-brief.md`
2. `requirements/functional-requirements.md` (**56 FRs**) and `non-functional-requirements.md` (**44 NFRs**)
3. `requirements/traceability-matrix.csv`
4. `architecture/system-design.md`, `authorization-model.md`, `moderation-and-administration.md`, `deployment.md`
5. `database/schema.md` (**16 tables**) and `data-retention.md`
6. `api/` (**11 references**, including conventions, reports, notifications, and admin)
7. `decisions/` (**26 accepted ADRs, 0000–0025**)
8. `ui/information-architecture.md` and `screen-inventory.md`
9. `testing/strategy.md` and `acceptance-test-matrix.md`
10. `implementation/implementation-plan.md` and `design-readiness-checklist.md`

## Complete scope

- Account, custom JWT/rotating refresh tokens, profile/private avatar.
- Friend requests, block/unblock, friend-gated direct messaging.
- Direct/group chat, attachments, reactions, edit/recall, detailed receipts, unread counts, presence, typing, search, Web Push.
- Single group-admin transfer/automatic succession as already defined by ADR-0009.
- User reporting for user/message/group, immutable evidence, own report status, in-app account/moderation notifications.
- Administration Portal: dashboard, user directory/detail, suspension/ban/session/profile/role operations, report queue and bounded evidence review, moderation outcomes, group directory/close/reopen, immutable audit log.

## Final decisions

- System roles: `USER`, `MODERATOR`, `ADMIN`, `SUPER_ADMIN`; group admin is independent.
- Staff cannot act on equal/higher roles or remove the final active super admin.
- Staff never receive unrestricted private-conversation browsing.
- Report evidence includes at most five messages before/after a reported message; access is audited.
- Private Supabase Storage bucket; database stores object keys; signed URLs target five-minute TTL.
- PostgreSQL is durable truth; Redis/Render Key Value stores reconstructable presence/rate state.
- Web Push is best-effort; REST synchronization recovers missed realtime events.
- Flyway migrations are immutable; Hibernate validates schema.
- Kafka remains future consideration only after measured extraction/replay/consumer triggers.
- No development phase labels, skeleton copy, fake metrics, or implementation notes may appear in production UI.

## Baseline metrics

| Item | Count |
|---|---:|
| Functional requirements | 56 |
| Non-functional requirements | 44 |
| Durable PostgreSQL tables | 16 |
| Accepted ADRs | 26 |
| User-application screens | 17 |
| Administration screens | 10 |
| Traceability rows | 56 |
| Open design decisions | 0 |

Any change to behavior, schema, authorization, API, privacy, or tests requires a requirement/ADR revision and matching traceability update.
