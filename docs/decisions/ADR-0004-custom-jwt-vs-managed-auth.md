# ADR-0004: Hand-rolled Spring Security + JWT, not a managed auth provider

**Status:** Accepted | **Date:** 2026-07-17

## Context
Managed identity providers (Supabase Auth, Auth0, Firebase Auth) exist so
apps don't implement auth themselves — the right default for most
production apps. This project's purpose is different: demonstrating
Java/Spring backend skill to prospective employers.

## Decision
Implement authentication in `apps/api`: BCrypt password hashing,
short-lived signed JWT access tokens (validated via a custom
`OncePerRequestFilter`), and opaque DB-backed rotating refresh tokens
(ADR-0005). `SecurityConfig` wires stateless sessions, CORS, and the
filter chain explicitly.

## Alternatives Considered
- **Supabase Auth / Auth0 / Firebase Auth** — fast, production-grade, free
  social login. Rejected: the backend would then contain zero
  authentication logic — exactly the skill this project exists to
  display.
- **Session-cookie auth (Redis-backed sessions)** — simpler revocation
  (delete the session), legitimate for a same-origin app. Rejected for
  now: JWT + a separate React SPA is the more common pattern recruiters
  expect, and exercises stateless-auth design (a common interview topic).

## Trade-offs / Consequences
- We own every security bug in this path (token expiry, BCrypt cost,
  CORS, refresh rotation edge cases) that a managed provider would
  otherwise own.
- No social login, no built-in email verification/password reset yet —
  would need to be designed and built explicitly later.
