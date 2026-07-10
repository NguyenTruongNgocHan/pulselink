# ADR-0000: Modular monolith, not microservices

**Status:** Accepted | **Date:** 2026-07-09

## Context
Solo developer, greenfield, near-zero budget (NFR-14), needs a demo within
weeks, but the client "expects to grow if it takes off" (product brief).

## Decision
One deployable Spring Boot application, internally divided into modules
by bounded context: `auth`/`user`, `friend`, `message` (incl. groups,
attachments, reactions), `presence`. No module reaches another's
repository directly — cross-module access goes through a small service
interface, so a future extraction is a deployment change, not a rewrite.

## Alternatives Considered
- **Microservices from day one** — solves scale/team-autonomy problems
  this project doesn't have; would need service discovery, inter-service
  auth, distributed tracing; violates NFR-14/NFR-15; risks hiding the
  actual skill being demonstrated under infra plumbing.
- **Unstructured monolith** (no module boundaries) — faster short-term,
  forecloses the "grow later" requirement.
- **Serverless functions** — fits REST well, but persistent WebSocket
  connections (FR-15/FR-21) don't fit the typical short-lived-invocation
  model without extra managed infra.

## Trade-offs / Consequences
- No distributed-systems patterns demonstrated (service mesh, per-service
  scaling) — an honest gap for that specific hiring signal.
- Concrete future trigger: if a single instance can't hold the required
  WebSocket connections (NFR-3), the first real change is Redis Pub/Sub
  for cross-instance fan-out — still one deployable, multiple instances —
  before any service extraction.
