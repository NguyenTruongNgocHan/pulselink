# ADR-0010: Unified per-participant read receipts (direct + group)

**Status:** Accepted | **Date:** 2026-07-09

## Context
FR-22 requires detailed group seen-status — *which* participants have
seen a message, not just a count (product owner confirmed, 2026-07-09).
Needs to work identically for direct (1 other participant) and group (N
participants) conversations.

## Decision
One table, `message_read_receipts`, one row per `(message_id, user_id)`,
written the moment that user has seen that message. "Seen by" is a query
over this table — no special-casing for direct vs group, no boolean
`seen` column on `messages`.

## Alternatives Considered
- **Boolean `seen` on `messages`** — trivial for direct messages, doesn't
  extend to groups without a second mechanism anyway.
- **`last_read_message_id` pointer per participant** (instead of one row
  per message read) — cheaper at scale, but can't answer "list everyone
  who has seen *this exact* message" once messages are read out of order
  across sessions/devices. (This pattern is still used — see ADR-0011 —
  but for unread *counts*, not for detailed "seen by" display, which is
  what FR-22 specifically asks for.)

## Trade-offs / Consequences
- `message_read_receipts` grows as
  `O(messages × participants who've seen each)` — faster than `messages`
  itself in busy groups; the direct cost of the "detailed, per-person"
  requirement. Acceptable at NFR-4's scale.
- Needs a composite PK/index on `(message_id, user_id)`.
- Client should batch/debounce "mark as seen" (once per conversation
  view, not once per message on scroll) rather than firing an event per
  message rendered.
