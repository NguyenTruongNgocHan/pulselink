# API Reference — Conversations & Messages (Design, Design)

Base path: `/api/v1/conversations`. All require `Authorization: Bearer`.
Implements FR-12..21 and FR-24..27. Live delivery is over WebSocket — see
`realtime-protocol.md`; these endpoints cover creation, history, uploads,
edit/delete, and reactions. For searching message history, see
`search-api.md`. For offline push delivery, see `push-api.md`.

### `POST /api/v1/conversations`
```json
// Direct — requires an accepted friendship (ADR-0008), else 403
{ "type": "DIRECT", "participantId": "uuid" }
// Group — all participantIds must be accepted friends of the caller
{ "type": "GROUP", "name": "Weekend Trip", "participantIds": ["uuid1", "uuid2"] }
```
`201 Created` (or `200 OK` if a matching `DIRECT` conversation already
exists) → conversation object with participants (including `role`).
Errors: `403` not-friends / blocked; `400` group missing name or <2 members.

### `GET /api/v1/conversations`
List the caller's conversations, most recent first, each with
`lastMessagePreview` and `unreadCount` (ADR-0011). `200 OK`.

### `GET /api/v1/conversations/{id}/messages?cursor=...&limit=50`
Cursor-paginated history, newest-first.
```json
{ "messages": [{
    "id": "uuid", "senderId": "uuid", "content": "hey!",
    "createdAt": "...", "editedAt": null, "deletedAt": null,
    "attachments": [{ "downloadUrl": "short-lived-signed-url", "fileName": "photo.jpg", "mimeType": "image/jpeg" }],
    "reactions": [{ "userId": "uuid", "emoji": "👍" }],
    "seenBy": [{ "userId": "uuid", "seenAt": "..." }]
  }],
  "nextCursor": "..." }
```
A deleted message is still returned (tombstoned, `content` already
cleared server-side) so the UI can render it in place.
Errors: `403` if caller isn't a participant.

### `POST /api/v1/conversations/{id}/attachments`
`multipart/form-data` upload (FR-13). Uploads to the private Supabase Storage bucket
(ADR-0003), returns metadata to attach to the next WebSocket `send`.
`201 Created` → `{ "downloadUrl": "short-lived-signed-url", "fileName": "...", "mimeType": "...", "sizeBytes": 123456 }`.
Errors: `413` if over NFR-5's 10MB cap.

### `PATCH /api/v1/conversations/{conversationId}/messages/{messageId}`
```json
{ "content": "updated text" }
```
`200 OK` → updated message. Errors: `403` not the sender; `409` already
deleted (can't edit a tombstone, ADR-0012).

### `DELETE /api/v1/conversations/{conversationId}/messages/{messageId}`
`204 No Content`. Errors: `403` not the sender.

### `PUT /api/v1/conversations/{conversationId}/messages/{messageId}/reactions`
```json
{ "emoji": "👍" }
```
`200 OK`. Replaces the caller's existing reaction on this message if any
(ADR-0013), rather than adding a second one.

### `DELETE /api/v1/conversations/{conversationId}/messages/{messageId}/reactions`
Removes the caller's own reaction. `204 No Content`.

---

## Group membership

### `POST /api/v1/conversations/{id}/participants`
Admin only. `{ "userIds": ["uuid3"] }` — each must already be the
caller's accepted friend. `200 OK` → updated participant list.
Errors: `403` not admin, or target isn't caller's friend.

### `DELETE /api/v1/conversations/{id}/participants/{userId}`
Leave (self) or remove (admin only, per ADR-0009). `204 No Content`.
If the admin leaves without having transferred first, the automatic
succession algorithm (ADR-0009: earliest `joined_at`, random tie-break)
applies.

### `POST /api/v1/conversations/{id}/admin-transfer`
Admin only. Hand off the admin role to another current active member —
no consent required from the recipient (ADR-0009).
```json
{ "newAdminUserId": "uuid" }
```
`200 OK` → updated participant list. Errors: `403` caller isn't the
current admin; `400` target isn't an active participant of this group.

Edit/delete/reaction/membership changes also broadcast over the
conversation's WebSocket topic — see `realtime-protocol.md`.
