# API Reference — Administration Portal (Design)

Base path: `/api/v1/admin`. All endpoints require staff role and server-side hierarchy/resource checks. Every mutation requires `reason` and writes an audit record.

## Dashboard
- `GET /dashboard?range=7d|30d` — `MODERATOR+`; user/conversation/message/report/account-status metrics.

## Users
- `GET /users?q=&role=&status=&createdFrom=&createdTo=&page=0&size=25&sort=createdAt,desc`
- `GET /users/{id}` — safe profile, status timeline, session summary, report/moderation summary.
- `POST /users/{id}/suspend` `{ "until": "...", "reason": "..." }` — `MODERATOR+`.
- `POST /users/{id}/unsuspend` `{ "reason": "..." }` — `MODERATOR+`.
- `POST /users/{id}/ban` / `unban` — `ADMIN+`.
- `POST /users/{id}/force-logout` — `MODERATOR+`.
- `POST /users/{id}/profile-reset` `{ "resetDisplayName": true, "removeAvatar": true, "reason": "..." }`.
- `PUT /users/{id}/role` `{ "role": "ADMIN", "reason": "..." }` — `SUPER_ADMIN` only.

## Reports
- `GET /reports?...` — queue filters/status/assignee/reason/target/date.
- `GET /reports/{id}` — review summary.
- `POST /reports/{id}/claim` — `OPEN → IN_REVIEW`.
- `GET /reports/{id}/evidence` — immutable snapshot + bounded context; access audited.
- `POST /reports/{id}/resolve` `{ "outcome": "CONTENT_REMOVED", "reason": "...", "suspendUntil": null }`.
- `POST /reports/{id}/reject` `{ "reason": "..." }`.

## Groups
- `GET /groups?q=&status=&page=&size=` — metadata only.
- `GET /groups/{id}` — metadata and active membership; no general history endpoint.
- `POST /groups/{id}/close` / `reopen` `{ "reason": "..." }` — `ADMIN+`.

## Audit
- `GET /audit-logs?actorId=&action=&targetType=&targetId=&from=&to=&page=&size=` — `ADMIN+`, read-only.

Conflicts return `409`; hierarchy violations return `403`; hidden resources return `404`. No endpoint permits staff impersonation or arbitrary conversation browsing.
