# ADR-0001: Monorepo with `apps/api` + `apps/web`

**Status:** Accepted | **Date:** 2026-07-09

## Context
One person builds and reviews both frontend and backend; needs one PR to
touch a new API field and the UI consuming it together.

## Decision
Single repo, `apps/api` (Spring Boot) + `apps/web` (React/Vite), one
`docker-compose.yml` at the root orchestrating everything.

## Alternatives Considered
- **Separate repos per app** — the right call once multiple teams/release
  cadences exist; for one person it's just two READMEs to keep in sync
  and no cross-cutting PRs.
- **Single full-stack app (server-rendered)** — would drop the
  React/TypeScript half entirely, defeating the fullstack-demo purpose.

## Trade-offs / Consequences
- Shared git history is noisier, trivially filterable by path.
- Deploys are organizationally coupled (one repo) but not architecturally
  coupled — `api` and `web` remain independently deployable containers
  (ADR-0006).
