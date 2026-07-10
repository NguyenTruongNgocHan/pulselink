# ADR-0019: Testcontainers (real Postgres) for integration tests, not H2

**Status:** Accepted | **Date:** 2026-07-09

## Context
NFR-26 requires integration tests against a real database. A common
shortcut is an in-memory database (H2) configured in "Postgres
compatibility mode" for speed. This project's schema now includes
Postgres-specific features — `tsvector`/GIN full-text search (ADR-0015)
and UUID generation — that H2 does not faithfully emulate.

## Decision
Integration tests spin up a real `postgres:16` container via
Testcontainers (JUnit 5 extension), matching the exact engine/version
used in `docker-compose.yml` (ADR-0006) and production (ADR-0002).

## Alternatives Considered
- **H2 in-memory database** — much faster test startup, no Docker
  dependency in CI. Rejected specifically because ADR-0015's full-text
  search relies on genuinely Postgres-specific SQL (`tsvector`,
  `to_tsquery`, GIN indexes) that H2 cannot run at all, not just
  "slightly differently" — any test covering FR-28 would have to be
  skipped or faked under H2, defeating the point of an integration test.
- **Mocking the repository layer entirely for what are called
  "integration" tests** — fast, but then nothing actually verifies the
  JPA mappings, constraints, or SQL are correct — exactly the risk
  integration tests exist to catch. Rejected; this is what unit tests
  with Mockito are already for (see `testing/strategy.md`), not a
  substitute for a real integration layer.

## Trade-offs / Consequences
- Slower test suite startup (container boot time) and a Docker
  dependency in the CI environment — GitHub Actions supports this
  natively (service containers / Testcontainers' own Docker support), so
  this is a solvable CI configuration detail, not a blocker, but worth
  naming as the direct cost of this choice.
- Test containers should be reused across a test run (not restarted per
  test class) where possible, to keep the speed cost from compounding —
  a concrete implementation detail flagged for whoever writes the first
  integration test, not left implicit.
