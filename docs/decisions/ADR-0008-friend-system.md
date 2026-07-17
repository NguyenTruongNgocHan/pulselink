# ADR-0008: Friend-gated messaging with a dedicated friendship system

**Status:** Accepted | **Date:** 2026-07-17

## Context
Product owner confirmed (2026-07-17): a real friend list (send/accept/
decline requests) is required, not open "message anyone by username"
(Telegram-style). This decision determines *who can create a direct
conversation with whom* — a gate every messaging feature sits behind.

## Decision
A `friendships` table models a directional request with a status:
`PENDING` → `ACCEPTED` | `DECLINED`, keyed by `(requester_id,
addressee_id)`. A direct conversation (FR-12) can only be created between
two users with an `ACCEPTED` friendship in either direction. Group invites
(FR-16/18) are restricted to the admin's existing accepted friends —
consistent with the same gate, not a separate rule.

Blocking (FR-10/11) is modeled as a **separate** `user_blocks` table
(`blocker_id`, `blocked_id`), independent of friendship status — see
Alternatives for why. Blocking someone with an existing `ACCEPTED`
friendship does not delete the friendship row; it's simply checked first
and short-circuits everything (NFR-11).

## Alternatives Considered
- **Open messaging by username (no friend gate)** — simplest, closest to
  Telegram. Rejected: product owner explicitly asked for a friend-list
  model, likely because it fits the "small community/team" framing in
  the product brief better than open contact.
- **Model blocking as a friendship status (`BLOCKED`) instead of a
  separate table** — fewer tables, but conflates two different concepts:
  you can block a stranger you were *never* friends with (no friendship
  row would exist to hold that status), and un-blocking shouldn't
  silently restore a prior friendship. A separate table handles both
  cases without special-casing. Rejected the merged approach for that
  reason.
- **Single row per friend pair with a mutable status field visible to
  both sides** (instead of directional requester/addressee) — harder to
  correctly express "who sent the request" (needed for the
  accept/decline UI showing "X wants to be your friend"), so the
  directional model was kept.

## Trade-offs / Consequences
- Every direct-message-send and group-invite path needs a friendship
  check — a cross-cutting concern touching multiple endpoints/WebSocket
  handlers, not just one. Needs a shared `FriendshipService.areFriends()`
  helper used consistently, or the gate will have gaps (see
  `system-design.md` module boundary notes).
- No "message requests from non-friends" inbox (unlike Messenger's actual
  behavior of allowing a filtered/limited message before acceptance) —
  simpler, but a real behavioral difference from the app this system is
  modeled after. Named here rather than assumed away.
- Service-layer responsibility (not a DB constraint): prevent duplicate
  pending requests in both directions between the same two users before
  insert.
