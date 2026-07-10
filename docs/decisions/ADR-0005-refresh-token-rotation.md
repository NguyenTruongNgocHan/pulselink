# ADR-0005: Opaque, DB-backed, rotating refresh tokens

**Status:** Accepted | **Date:** 2026-07-09

## Context
Short-lived (15 min, NFR-8) JWT access tokens need renewal without forcing
re-login every 15 minutes, while supporting real logout and limiting
damage from a stolen token.

## Decision
Refresh tokens are **not** JWTs — they're random opaque strings
(`SecureRandom`, base64url) stored in a `refresh_tokens` table, linked to
one user, with an expiry and a `revoked` flag. Every refresh call
validates, revokes the used token (single-use), and issues a new one
("rotation").

## Alternatives Considered
- **Long-lived refresh JWT (stateless)** — no DB lookup needed, but can't
  be revoked before natural expiry; logout would be purely client-side
  while the token stays valid if intercepted.
- **Single non-rotating DB-backed token** — revocable, simpler than
  rotation, but a leaked token is valid for the full lifetime with no
  reuse detection.

## Trade-offs / Consequences
- One extra DB write per refresh — negligible at this scale.
- Reuse of an already-rotated token is currently just rejected as
  "invalid," not treated as an active theft signal that revokes the whole
  token family — a known, named gap, not a silent one.
- Needs an eventual cleanup job for expired/revoked rows, or the table
  grows unbounded — not yet built.
