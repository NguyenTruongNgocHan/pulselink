# API Reference — In-App Notifications (Design)

Base path: `/api/v1/notifications`. Requires `Authorization: Bearer`. Implements FR-37..39.

### `GET /api/v1/notifications?cursor=...&limit=30`
Returns cursor-paginated notifications and `unreadCount`.

### `PUT /api/v1/notifications/{id}/read`
Idempotently marks the caller's notification read. `204 No Content`.

### `PUT /api/v1/notifications/read-all`
Marks all current notifications read. `204 No Content`.

Notification payloads contain safe text and internal navigation targets; they never embed raw evidence, tokens, or signed object URLs.
