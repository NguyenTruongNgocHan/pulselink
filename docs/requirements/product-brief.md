# Product Brief

> **Framing note:** PulseLink is a solo portfolio project, not a real
> client engagement — but it's designed the way a real client requirement
> would be, so every technical decision traces back to something concrete.
> Scope confirmed with product owner on 2026-07-17, expanded on 2026-07-17
> (round 2) to add message search, push notifications, and admin
> hand-off — see `functional-requirements.md` for the full current list.

## The problem
A small startup ("the client") is building a community/team messaging
product — a full-featured chat app (direct messages, groups, media,
reactions), comparable in core capability to Messenger/Telegram/Zalo.
Constraints:
- Greenfield, no existing backend.
- One developer.
- Needs a demoable version within weeks.
- Near-zero infrastructure budget during the demo phase.
- Growth is possible but unconfirmed — architecture shouldn't block
  scaling later, but shouldn't over-build for it now either.

## Target users
1. **End users** — chat 1-1 or in groups, expect real-time delivery,
   presence, message status, and the ability to control who can message
   them (friends only, with blocking).
2. **Moderation staff** — moderators and administrators who protect the community,
   resolve reports, act on abusive accounts/content, and need every privileged
   action to be explainable and auditable.
3. **Product owner** — cares about time-to-demo, safe operations, and not being
   locked into a rewrite if the product grows.

## Core user stories
- As a user, I can create an account, log in, and set up my profile
  (avatar, display name).
- As a user, I can find another user by username and send a friend
  request; they can accept or decline.
- As a user, I can block another user, stopping them from messaging or
  re-requesting friendship.
- As a user, I can send a direct message — text and/or an image/file — to
  a friend, and it arrives in real time.
- As a user, I can react to any message with an emoji.
- As a user, I can see who's online, who's typing, and whether my message
  has been seen (and by whom, in a group).
- As a user, I can edit or recall a message I sent.
- As a user, I can create a group with several friends, with one admin
  who manages membership, and the admin can hand off their role to
  another member at any time.
- As a user, I see an unread-message badge per conversation so I know
  what's new without opening every chat.
- As a user, I can search my message history by keyword.
- As a user, I get notified (even if I've closed the app/tab) when I
  receive a new message, so I don't have to keep it open to stay
  reachable.
- As a user, I can report a user, message, or group and later see a safe,
  high-level status of that report.
- As a user, I receive in-app notifications for account and moderation events.
- As a moderator, I can review a report queue, inspect only the reported evidence
  plus bounded context, and apply outcomes allowed by my role.
- As an administrator, I can search users/groups, suspend or ban lower-privileged
  accounts, close abusive groups, force logout sessions, and review an immutable
  audit trail.
- As a super administrator, I can assign staff roles without being able to
  silently bypass hierarchy or remove the last active super administrator.
- As the product owner, messages must survive a server restart — nothing
  message-critical lives only in memory, and every privileged mutation is
  attributable to an actor and reason.

## Explicit non-goals (unchanged)
- No voice/video calling.
- No end-to-end encryption (flagged as a real gap if this were ever
  handling sensitive conversations).
- No native mobile app — web client only (push notifications are
  delivered via the browser's Web Push API, not a native OS channel).
- No unrestricted administrator access to private conversations; moderation
  access is report-scoped and bounded.
- No dynamic permission editor, user impersonation, AI moderation, billing,
  multi-tenancy, or support-ticket subsystem in this baseline.

See `functional-requirements.md` and `non-functional-requirements.md` for
what this translates into, and `../architecture/system-design.md` for how
it shapes the system.
