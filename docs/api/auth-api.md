# API Reference — Auth (Design, Design)

Base path: `/api/v1/auth`. No `Authorization` header required (these
endpoints are how you *get* a token). Errors follow the shared shape:
```json
{ "timestamp": "...", "status": 409, "error": "Conflict", "message": "...", "details": [] }
```

### `POST /api/v1/auth/register`
```json
{ "email": "alice@example.com", "username": "alice", "password": "at-least-8-chars" }
```
`201 Created` →
```json
{ "accessToken": "...", "refreshToken": "...", "expiresInMs": 900000,
  "user": { "id": "uuid", "email": "...", "username": "alice", "displayName": "alice", "avatarUrl": null } }
```
Errors: `409` email/username taken, `400` validation.

### `POST /api/v1/auth/login`
```json
{ "email": "alice@example.com", "password": "..." }
```
`200 OK` → same shape as register. Errors: `401` (generic — doesn't
reveal whether the email exists).

### `POST /api/v1/auth/refresh`
```json
{ "refreshToken": "..." }
```
`200 OK` → new `accessToken` **and** new `refreshToken` (rotation, ADR-
0005 — old one is now invalid). Errors: `401` not recognized/expired/
already used.

### `POST /api/v1/auth/logout`
```json
{ "refreshToken": "..." }
```
`204 No Content`. Revokes the refresh token; any still-valid access token
remains usable until its own (≤15min) expiry — no access-token blocklist.

### `PATCH /api/v1/auth/me`
```json
{ "displayName": "Alice B.", "avatarUrl": "https://..." }
```
`200 OK` → updated user object. Requires `Authorization: Bearer`. (FR-5)
