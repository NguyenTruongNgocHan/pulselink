# ADR-0013: One reaction per user per message (Messenger-style)

**Status:** Accepted | **Date:** 2026-07-09

## Context
FR-25 confirmed in scope: react to any message with an emoji. Two common
real-world models exist: Messenger's (one reaction per person per
message — picking a new emoji replaces your previous one) and Slack's
(a person can stack multiple different emoji reactions on the same
message). The product brief frames PulseLink against Messenger
specifically.

## Decision
`message_reactions` table, composite PK `(message_id, user_id)` — at most
one reaction row per user per message. Reacting again with a different
emoji **updates** the existing row (`emoji`, `created_at` change) rather
than inserting a second one. Removing a reaction deletes the row.

## Alternatives Considered
- **Slack-style multiple reactions per user per message** — richer
  expression, but the composite key would need to include `emoji`
  (`(message_id, user_id, emoji)`), and the UI/aggregation logic ("show
  counts per emoji, plus who reacted with which") is more involved.
  Rejected for this stage since the product's stated reference point
  (Messenger) uses the simpler single-reaction model — matching that
  reduces both schema and UI complexity without contradicting any
  confirmed requirement.

## Trade-offs / Consequences
- Simpler to query ("who reacted, with what") and simpler to render (one
  reaction bubble per person), but a real feature ceiling if the product
  ever wanted Slack-style multi-reaction — would need a migration
  widening the PK to include `emoji`, not just a config flag.
- Broadcast on reaction change should carry the full current reaction
  (or its removal), not a delta, since a user's reaction is a
  replace-in-place operation, not an additive one — relevant to the
  WebSocket payload design in `realtime-protocol.md`.
