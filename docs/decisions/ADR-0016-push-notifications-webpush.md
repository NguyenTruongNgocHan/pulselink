# ADR-0016: Web Push API (VAPID), not Firebase Cloud Messaging

**Status:** Accepted | **Date:** 2026-07-09

## Context
FR-31 (confirmed in scope, round 2): notify a user of a new message even
when they have no active WebSocket connection (tab closed/backgrounded).
No native mobile app exists (product brief non-goal), so this is
browser-delivered push only.

## Decision
Use the standards-based **Web Push API** with VAPID (Voluntary
Application Server Identification) keys — no third-party push vendor.
Flow: the client's service worker registers a push subscription
(endpoint + encryption keys) with the browser's push service, sends that
subscription to the API (`POST /api/push/subscriptions`, see
`push-api.md`), and the API stores it in `push_subscriptions`. When a
message is created (per `realtime-protocol.md`'s send flow) and the
recipient has no active presence (ADR-0014's `isOnline()` check), the API
sends an encrypted push payload directly to the browser's push service
using a server-side web-push library.

## Alternatives Considered
- **Firebase Cloud Messaging (FCM)** — simpler abstraction, handles
  cross-browser quirks, and would extend naturally to a future native
  mobile app. Rejected for this stage: it's a third-party vendor
  dependency for something the W3C standard (Web Push) already solves
  without one, and this project has generally preferred owning
  standards-based mechanisms itself where the "managed vendor" trade-off
  isn't clearly worth it (same reasoning direction as ADR-0004's stance
  on auth, applied here to notification delivery). If native mobile is
  ever built, FCM becomes a much stronger case — not rejected forever,
  just not needed yet.
- **Polling from the client for new messages** — would work without any
  push infrastructure, but only while the app is open, which is the
  exact case FR-31 doesn't need to solve (an open app already gets
  messages over the existing WebSocket).

## Trade-offs / Consequences
- Browser/OS support varies: full support on Chrome/Firefox/Edge
  (desktop + Android); Safari on macOS supports it, but iOS Safari only
  supports Web Push for a site added to the home screen (installed as a
  PWA) — a real, named limitation given "no native app," not silently
  assumed to work everywhere.
- Best-effort delivery only (NFR-24) — no retry queue if the push
  service itself fails or the subscription has gone stale (browsers
  invalidate subscriptions periodically; a failed send should mark that
  subscription inactive rather than retry indefinitely).
- One user can have multiple subscriptions (multiple browsers/devices) —
  `push_subscriptions` allows several rows per `user_id`; a send fans out
  to all of them.
- Payload is intentionally minimal (sender name, short preview, a link to
  the conversation) — the full message content is fetched over the
  existing REST/WebSocket path once the user opens the notification, not
  duplicated into the push payload.
