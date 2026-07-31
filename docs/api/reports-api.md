# API Reference — Reports (Design)

Base path: `/api/v1/reports`. Requires `Authorization: Bearer`. Implements FR-32..36.

### `POST /api/v1/reports`
```json
{ "targetType": "MESSAGE", "targetId": "uuid", "reason": "HARASSMENT", "description": "optional" }
```
`201 Created` creates the report and immutable evidence in one transaction. `409` duplicate open report; `422` invalid target/reason.

### `GET /api/v1/reports?cursor=...&limit=20`
Returns only the caller's reports with public status, outcome summary, and timestamps. Staff identity/internal notes are excluded.

### `GET /api/v1/reports/{id}`
Reporter-only detail. Inaccessible IDs return `404`.

### `POST /api/v1/reports/{id}/comments`
Adds reporter-visible clarification only while status is `OPEN`. `409` after review starts.
