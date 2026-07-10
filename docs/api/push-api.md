# API Reference — Push Notifications (Design, ⬜ Not Yet Implemented)

Implements FR-31, ADR-0016. Requires `Authorization: Bearer`.

### `POST /api/push/subscriptions`
Registers a browser push subscription obtained client-side from the
service worker's `PushManager.subscribe()` call.
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": { "p256dh": "...", "auth": "..." }
}
```
`201 Created` (or `200 OK` if this exact `endpoint` is already
registered — idempotent). Stores a `push_subscriptions` row for the
caller.

### `DELETE /api/push/subscriptions`
```json
{ "endpoint": "https://fcm.googleapis.com/fcm/send/..." }
```
`204 No Content`. Called when the user revokes notification permission or
logs out on that device — removes that one subscription (not all of the
user's subscriptions, since they may be logged in on multiple devices).

### `GET /api/push/vapid-public-key`
No auth required (this is a public key, safe to expose). Returns the
server's VAPID public key so the client can pass it to
`PushManager.subscribe()`.
```json
{ "publicKey": "..." }
```

## Server-side trigger (not a client-facing endpoint)
When a message is persisted (`realtime-protocol.md`'s send flow) and the
recipient's `PresenceService.isOnline()` returns false (ADR-0014), the
`message` module calls a `PushNotificationService` which:
1. Loads all `push_subscriptions` rows for that recipient.
2. Sends an encrypted payload (sender's display name, a short content
   preview, the conversation ID) to each subscription's `endpoint` via a
   server-side web-push library.
3. On a `410 Gone` response from the push service (subscription expired/
   revoked by the browser), deletes that `push_subscriptions` row —
   self-cleaning, no separate cron job needed for stale subscriptions.
