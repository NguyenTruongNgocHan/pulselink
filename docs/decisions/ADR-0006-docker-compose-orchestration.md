# ADR-0006: Docker Compose for local orchestration (not Kubernetes)

**Status:** Accepted | **Date:** 2026-07-17

## Context
Local dev needs Postgres, Redis, the API, and the Vite dev server running
together reproducibly on any machine (NFR-15).

## Decision
One `docker-compose.yml` at the repo root: `postgres`, `redis`, `api`,
`web` services, health checks, start-order dependencies, all
configuration via environment variables.

## Alternatives Considered
- **Kubernetes/Helm** — looks "enterprise," but a 4-container demo app
  doesn't need a scheduler; building K8s manifests before any chat
  feature exists optimizes the wrong layer first.
- **No containers, native local install** — fewer moving parts, not
  reproducible across machines, loses the one-command setup experience.

## Trade-offs / Consequences
- Doesn't demonstrate Kubernetes/Helm skill — a deliberate, named
  deferral, not an oversight.
- The `web` service runs Vite's dev server, not a production build — a
  separate production Dockerfile is needed before any real deployment.
