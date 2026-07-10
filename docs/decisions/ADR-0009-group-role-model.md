# ADR-0009: Single-admin group role model, with explicit hand-off + succession

**Status:** Accepted (revised 2026-07-09, round 2)
**Date:** 2026-07-09

## Revision note
The original version of this ADR (round 1) explicitly rejected admin
hand-off/ownership transfer as unnecessary complexity. A concrete scenario
walkthrough with the product owner (round 2) showed transfer is actually
required to resolve the auto-succession tie-break case cleanly (see
Decision below) — this revision reverses that specific call while keeping
everything else (single admin, no multi-admin) unchanged. Recorded here
rather than silently edited, per this project's own ADR practice.

## Context
FR-16, 18–21 need to know who can add/remove group members, and what
happens when that person leaves. Product owner confirmed (round 1): one
admin at a time, the creator by default. Product owner then walked
through a concrete scenario (round 2): if a creator adds 3 members in one
batch action and later leaves without designating anyone, there's no
clear "next" member by join order alone (all 3 joined at the same time) —
and even after a successor is picked, that person might not want the
role.

## Decision
- `conversation_participants.role` stays `ADMIN` | `MEMBER`, exactly one
  `ADMIN` per `GROUP` conversation at all times (while the group has any
  active members at all — see edge case below).
- **Explicit hand-off (FR-20)**: the current admin can transfer the role
  to any other **currently active** member at any time via a dedicated
  action — no consent required from the recipient (see Alternatives for
  why). This single mechanism covers both "I'm about to leave and want to
  pick my successor" and "I was auto-promoted and don't want this" (the
  newly-promoted admin just uses the same transfer action immediately).
- **Automatic succession (FR-21)**, used only when the admin leaves
  *without* having transferred first:
  1. Among remaining active members, pick the one with the earliest
     `joined_at`.
  2. **Tie-break**: if multiple members share the same earliest
     `joined_at` (e.g. added together in one batch call), pick uniformly
     at random among those tied.
  3. The newly-promoted admin may immediately use the explicit hand-off
     mechanism above if they don't want the role — no separate
     "decline" flow is needed, since hand-off already covers it.
- **Edge case — last member leaves**: if the admin leaves and no other
  active members remain, the group simply has zero active participants
  (all rows in `conversation_participants` have `left_at` set). No
  special deletion logic — this falls out naturally from the existing
  soft-leave pattern; the conversation is never surfaced again to anyone
  since no active participant row points to it.
- **Validation**: the hand-off target must be a current active
  participant (not already left) — enforced at the service layer,
  returns an error otherwise.

## Alternatives Considered
- **No transfer capability, auto-succession only** (round-1 decision) —
  simpler, but the batch-add tie-break scenario above has no clean
  resolution without either transfer or a genuinely arbitrary pick with
  no recourse if the picked person doesn't want it. Reversed for this
  reason.
- **Require the recipient's consent for hand-off** (an invite/accept flow
  like friend requests) — more realistic for a high-stakes transfer in a
  real product, but adds a pending-state concept and a second async flow
  to build for a scenario the product owner explicitly resolved with "if
  they don't want it, they just pass it on" — i.e., the immediate,
  no-consent transfer already matches the stated desired behavior.
  Rejected as unneeded complexity given that explicit guidance.
- **Multi-admin** — still rejected, unchanged from round 1; the
  batch-add scenario is resolved by tie-break + transfer, not by allowing
  more than one admin at once.
- **Deterministic tie-break (e.g. lowest user ID) instead of random** —
  removes the need for a random draw, but is an arbitrary, meaningless
  ordering dressed up as deterministic; random was chosen because it's
  honest about being an arbitrary choice among equals, and the transfer
  mechanism exists precisely so an arbitrary outcome is never final.

## Trade-offs / Consequences
- `role` is still only meaningful for `GROUP` conversations (unused
  column for `DIRECT`) — unchanged trade-off from round 1.
- Auto-promotion (including the random tie-break) and the "leave" action
  must run in the same transaction, to avoid a window where a group
  briefly has zero admins.
- No-consent transfer means a malicious or careless admin could transfer
  to someone unwilling and disappear — mitigated in practice by the
  recipient being able to immediately transfer again themselves, but
  worth naming as a real (small) trust assumption rather than ignoring
  it.
- Random tie-break introduces non-determinism into an otherwise
  deterministic system — acceptable here since the outcome is corrigible
  (transfer fixes it) and the alternative (fake determinism via ID
  ordering) doesn't actually resolve the underlying "who should it be"
  question any better.
