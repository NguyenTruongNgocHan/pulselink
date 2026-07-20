# API Conventions — All REST Modules

Base path: `/api/v1`. JSON over HTTPS. Protected endpoints require `Authorization: Bearer <accessToken>` unless refresh-cookie semantics are explicitly documented.

## Success envelopes

Single resource: `{ "data": {...}, "meta": { "requestId": "uuid" } }`.
Collections use an opaque cursor and `nextCursor`; admin grids may use stable `page`, `size`, `sort` when total count is a product requirement.

## Error envelope

```json
{ "error": { "code": "REPORT_STATE_CONFLICT", "message": "...", "fieldErrors": [], "requestId": "uuid" } }
```

IDs are UUIDs. Timestamps are UTC ISO-8601. Clients must not parse opaque cursors. Mutation endpoints that may be retried accept `Idempotency-Key` or a domain key such as `clientMessageId`.

## HTTP semantics

`400` malformed request, `401` unauthenticated, `403` known forbidden action, `404` missing/hidden resource, `409` uniqueness/state conflict, `422` domain validation, `429` rate limited, `500` safe generic server error.
