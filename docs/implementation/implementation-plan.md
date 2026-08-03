# Implementation Plan — Current Status

Each phase includes migration/domain/API/security tests plus React UI/state/tests. Documentation learning notes remain outside production UI.

## Phase 0 - Architecture Refactor (complete)

Feature-first frontend architecture, route constants, providers, shared layouts, shared UI components, theme light/dark/system, supporting mock or data-layer structure, frontend lint/test/production build, and React Router fallback for Vercel.

## Phase 1 - Core Application (substantially complete)

Implemented surfaces in the codebase include authentication, registration/login/refresh/logout/profile, password change and security sessions, people and friend flows, blocking/unblocking, direct and group conversations, realtime messaging, notifications, privacy settings, saved messages, reports, admin-related screens and APIs, and private attachment and avatar upload-download flows.

- Auth and account: register, login, refresh, logout, profile, password change, session review, deactivation flow.
- Social and messaging: people search, friend requests, direct chats, group chats, read pointers, reactions, save and unsave, search.
- Safety and moderation: report creation, report clarification, user-facing status, admin dashboard, user review, report review, group moderation, audit log.
- Media: upload and download attachments and avatar images.

## Phase 2 - Production Deployment (complete)

Frontend production build, frontend deployment on Vercel, backend Docker deployment on Render, PostgreSQL on Supabase, Redis on Render Key Value, environment-based API configuration, production CORS, HTTPS endpoints, actuator health check, and live frontend/backend integration.

## Next improvements

- Migrate attachment storage to Supabase Storage or another persistent object store.
- Add persistent file storage for production uploads.
- Split large bundles and review route-level code splitting.
- Clear remaining React hook lint warnings and improve React Compiler readiness.
- Expand automated test coverage, especially user journeys and production regressions.
- Add stronger observability and production monitoring.
- Add a CI/CD validation pipeline with stronger deploy gates.

## Known limitations

- The backend runs on a free Render instance, so the first request after inactivity may take 30-60 seconds because of cold start.
- Attachments still use local storage path `/data/uploads`; this is not yet persistent production storage if Render does not provide a persistent disk.
- No custom domain is configured yet.
- No production-grade Redis persistence is required for the current demo setup, but it would matter if the Redis data became authoritative.

## Future work

- Email verification or password reset if those flows are required next.
- Web Push hardening if the current implementation needs broader reach or reliability.
- Reconsider an event broker only if service extraction, event replay, or independent asynchronous consumers become real requirements.

## Post-deployment hardening

- Rate-limit hardening.
- Structured logs and metrics.
- Accessibility and performance checks.
- Playwright critical journey coverage.
- Backup and restore exercise.
- Custom domain rollout when the production footprint is stable.
