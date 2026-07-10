# ADR-0014: Redis TTL keys for presence, driven by WebSocket lifecycle

**Status:** Accepted | **Date:** 2026-07-09

## Context
FR-20 needs to know who's online right now. Presence is ephemeral —
NFR-12 only requires *messages* to survive a restart, not presence — so
it lives in Redis, not Postgres.

## Decision
On STOMP `CONNECT` (valid access token), set `presence:{userId} =
"online"` in Redis with a short TTL (e.g. 60s), refreshed by a client
heartbeat (~every 20s) while connected. On clean `DISCONNECT`, delete the
key immediately rather than waiting for TTL expiry. Online = the key
exists. No intermediate "away/idle" state in this stage — connection
liveness only, not activity liveness.

## Alternatives Considered
- **`last_seen_at` column on `users`, computed "online" as recent** —
  avoids a Redis dependency, but turns every heartbeat into a Postgres
  write, exactly the high-frequency/low-value traffic Redis exists to
  absorb instead.
- **Rely solely on TTL expiry, no explicit delete on disconnect** —
  simpler, but a cleanly-closed tab still shows "online" for up to the
  full TTL window.
- **"Away/idle" intermediate state** — more realistic (Slack/Discord-
  style), but requires tracking actual user activity signals, not just
  connection liveness — a meaningfully bigger feature, not requested by
  FR-20 as confirmed.

## Trade-offs / Consequences
- Presence is connection-based, not activity-based — a user with the tab
  open but idle still shows "online." A visible, real product behavior
  difference from richer presence systems, worth flagging as a possible
  future ask rather than assuming it's permanently fine.
- Correctness depends on heartbeat/TTL tuning (too short → false
  "offline" flicker on network hiccups; too long → slow detection of a
  genuinely dropped connection) — needs real-world tuning once built.
- Assumes one Redis instance/one API instance sharing these keys,
  consistent with ADR-0000's single-instance scope.
