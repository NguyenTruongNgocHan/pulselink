# API Reference — Friends & Blocking (Design, Design)

Base path: `/api/v1/friends` and `/api/v1/blocks`. All require `Authorization:
Bearer`. Implements FR-6..11, ADR-0008.

### `GET /api/v1/users/search?username=ali`
Search users by username prefix (excludes the caller, and excludes users
who have blocked the caller or whom the caller has blocked).
`200 OK` → `[{ "id": "uuid", "username": "alice", "displayName": "...", "avatarUrl": "..." }]`

### `POST /api/v1/friends/requests`
Send a friend request.
```json
{ "addresseeId": "uuid" }
```
`201 Created` → the created `friendships` row (`status: "PENDING"`).
Errors: `409` if a pending/accepted relationship already exists in either
direction; `403` if either party has blocked the other.

### `GET /api/v1/friends/requests?direction=incoming|outgoing`
List pending requests. `200 OK` → array of friendship rows with the other
user's public profile embedded.

### `POST /api/v1/friends/requests/{id}/accept`
### `POST /api/v1/friends/requests/{id}/decline`
`200 OK` → updated friendship (`status: "ACCEPTED"` or `"DECLINED"`).
Errors: `403` if caller isn't the `addressee_id` of that request.

### `GET /api/v1/friends`
List accepted friends. `200 OK` → array of user profiles.

### `DELETE /api/v1/friends/{userId}`
Remove an existing friend (FR-9). `204 No Content`.

### `POST /api/v1/blocks`
```json
{ "blockedId": "uuid" }
```
`204 No Content`. Also implicitly removes the ability to message/friend-
request in either direction (checked live, not by deleting the
friendship row — see `schema.md`).

### `DELETE /api/v1/blocks/{userId}`
Unblock (FR-11). `204 No Content`. Does **not** restore a prior
friendship — a new request must be sent if desired (ADR-0008).
