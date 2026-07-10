# ADR-0011: A separate last-read pointer for unread badge counts

**Status:** Accepted | **Date:** 2026-07-09

## Context
FR-26/27 need a cheap per-conversation unread count for a badge UI. ADR-
0010 already tracks detailed per-message, per-reader receipts — but
computing "how many unread messages in this conversation" from that table
means counting messages with no matching receipt row for this user on
every conversation-list render, which gets more expensive as history
grows, for a UI element that's read constantly (every time the
conversation list renders).

## Decision
Add `conversation_participants.last_read_message_id` (nullable FK to
`messages`), updated whenever a user reads the latest visible message in
a conversation (same client event that also writes detailed receipts per
ADR-0010 — one user action, two writes). Unread count becomes:
`COUNT(messages WHERE conversation_id = X AND created_at >
(created_at of last_read_message_id))` — a single indexed range query,
not a join against the potentially-much-larger receipts table.

This is deliberately **two mechanisms for two different questions**:
`message_read_receipts` (ADR-0010) answers "who exactly has seen this
message" (detailed, per-message); `last_read_message_id` answers "how
many messages are unread here" (cheap, per-conversation). Neither
replaces the other.

## Alternatives Considered
- **Compute unread count from `message_read_receipts` alone** (no
  separate pointer) — one fewer column, but every conversation-list
  render would need, per conversation, an anti-join against a table
  that's the fastest-growing one in the schema (ADR-0010's own
  trade-off). Rejected on cost grounds specifically for a value read this
  frequently.
- **A denormalized `unread_count` integer, incremented/decremented on
  every send/read event** — fastest possible read, but requires careful
  concurrent-increment handling (race conditions between simultaneous
  sends) and can drift from reality if any code path forgets to update
  it. Rejected in favor of a value that's always *derived* (from
  `last_read_message_id` + a count query) and therefore can't drift,
  accepting a slightly more expensive read in exchange for correctness
  by construction.

## Trade-offs / Consequences
- Two separate writes happen on "user reads a conversation" (a receipt
  row per unseen message, per ADR-0010, plus one pointer update) —
  acceptable, since they answer genuinely different questions and a
  reviewer should be able to see both mechanisms are intentional, not
  duplicated effort.
- `last_read_message_id` needs to only ever move forward (never regress
  to an older message) — a service-layer invariant to enforce explicitly
  when writing it.
