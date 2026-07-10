# Real-Time Protocol — STOMP over WebSocket (Design, ⬜ Not Yet Implemented)

Implements ADR-0007 (transport), ADR-0010/0011 (receipts/unread), ADR-
0013 (reactions), ADR-0014 (presence). Covers FR-15, 17, 20..22, 25.

## Connecting
- Endpoint: `wss://<host>/ws` (SockJS fallback per ADR-0007).
- `Authorization: Bearer <accessToken>` sent as a STOMP `CONNECT` header,
  validated with the same `JwtService` as REST.
- On successful `CONNECT`: server marks the user present (ADR-0014).
  Client subscribes to `/topic/conversations/{id}` for every conversation
  it's part of, and `/user/queue/notifications` for account-level events
  (friend request received, added to a group).

## Sending a message
**Client → Server**: `/app/conversations/{id}/send`
```json
{ "content": "hey!", "attachmentIds": ["uuid-from-upload-endpoint"] }
```
Server: verify active participant → verify friendship/not-blocked
(ADR-0008, for `DIRECT`) → persist (NFR-12: before broadcast) → broadcast.

**Server → Client**: `/topic/conversations/{id}`
```json
{ "type": "MESSAGE_CREATED", "message": { "id": "...", "senderId": "...", "content": "...", "attachments": [...], "createdAt": "..." } }
```

## Edit / delete
Triggered by the REST endpoints (`messaging-api.md`), pushed live:
```json
{ "type": "MESSAGE_EDITED", "message": { "...": "..." } }
{ "type": "MESSAGE_DELETED", "messageId": "uuid" }
```

## Group admin change (ADR-0009)
Triggered by `POST /api/conversations/{id}/admin-transfer` or by the
automatic succession that runs when an admin leaves — pushed to
`/topic/conversations/{id}`:
```json
{ "type": "ADMIN_CHANGED", "newAdminUserId": "uuid", "reason": "TRANSFERRED" }
{ "type": "ADMIN_CHANGED", "newAdminUserId": "uuid", "reason": "AUTO_SUCCESSION" }
```
The `reason` field lets the client show a different message ("Alice made
Bob the admin" vs. "Bob is now the admin") without a second API call.

## Reactions (ADR-0013)
**Client → Server**: `/app/conversations/{id}/messages/{messageId}/react`
```json
{ "emoji": "👍" }
```
**Server → Client**: `/topic/conversations/{id}`
```json
{ "type": "REACTION_CHANGED", "messageId": "uuid", "userId": "uuid", "emoji": "👍" }
```
A `null` emoji in this event means the user removed their reaction — the
event always carries the reactor's *current* state (replace, not
append), consistent with ADR-0013's single-reaction model.

## Typing (FR-21)
**Client → Server**: `/app/conversations/{id}/typing` (debounced ≤once/2s,
no payload needed). **Server → Client**:
`/topic/conversations/{id}/typing` → `{ "userId": "uuid", "username": "alice" }`.
Fire-and-forget, nothing persisted (not even Redis) — client clears the
indicator itself after ~3s of silence.

## Read receipts & unread count (FR-22, 26/27; ADR-0010/0011)
**Client → Server**: `/app/conversations/{id}/read`
```json
{ "messageId": "uuid-of-latest-visible-message" }
```
Sent once per conversation view (debounced, not per message). Server
writes `message_read_receipts` rows for all newly-seen messages up to
that point, **and** advances `conversation_participants.last_read_message_id`
in the same transaction (ADR-0011 — one user action, two purposes).

**Server → Client**: `/topic/conversations/{id}/receipts`
```json
{ "messageId": "uuid", "userId": "uuid-of-reader", "seenAt": "..." }
```

## Presence (FR-20, ADR-0014)
Global per user, not conversation-scoped. Subscribe:
`/topic/presence/{userId}` → `{ "userId": "uuid", "online": true }`.
Emitted on `CONNECT`/`DISCONNECT` and on Redis TTL expiry (a lightweight
scheduled check or keyspace notification publishes `online: false`).
Presence for a blocked relationship is never emitted to the blocking
party (NFR-11) — enforced at the publish step, not just the UI.

## Errors
A malformed frame, sending to a conversation the user isn't in, or an
expired token mid-connection → a STOMP `ERROR` frame to that client only
(never broadcast). Expired/invalid token → connection closed; client
refreshes (`POST /api/auth/refresh`) and reconnects.

## What this design deliberately does not solve yet
- Multi-instance broadcast (ADR-0007's named future trigger).
- Delivery retry/ack if a client is offline when sent — the message is
  safely persisted (NFR-12); the client fetches it via REST on next
  connect. No push-to-closed-client mechanism (explicit non-goal).
