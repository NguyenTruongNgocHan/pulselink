# ADR-0012: In-place edit, soft-delete tombstone

**Status:** Accepted | **Date:** 2026-07-09

## Context
FR-23/24: both edit and delete confirmed in scope.

## Decision
**Edit**: `messages.content` is overwritten, `edited_at` set to now. No
version history retained — UI shows an "edited" label only.
**Delete**: `messages.deleted_at` set to now, `content` overwritten with a
tombstone value server-side. The row is kept (not hard-deleted) so
ordering and existing read receipts/reactions referencing that
`message_id` stay valid. A deleted message cannot subsequently be edited.

## Alternatives Considered
- **Full edit history table** — more transparent, but nothing in the
  confirmed requirements asked for it ("mark as edited," not "show
  history"). Additive later if ever needed — doesn't require changing
  `messages` itself.
- **Hard delete** — breaks referential integrity for read receipts
  (ADR-0010) and reactions (ADR-0013) already pointing at that
  `message_id`; makes pagination logic handle gaps. Rejected.
- **Client-side-only delete** — doesn't actually remove content from
  other participants' view; defeats the point of "recall."

## Trade-offs / Consequences
- Original text is genuinely gone after an edit or delete — a real,
  permanent loss, not just a display choice, and no requirement asked for
  recoverability.
- `deleted_at IS NOT NULL` must be filtered wherever content is displayed
  or (eventually) searched — an easy detail to forget in a new query.
- No moderation/audit trail — a real gap for content-moderation needs,
  named honestly rather than ignored.
