# API Reference — Search (Design, Design)

Implements FR-28, ADR-0015. Requires `Authorization: Bearer`.

### `GET /api/v1/search/messages?q=keyword&conversationId=optional&cursor=...&limit=20`
Full-text search across the caller's own message history.
- `q` (required): search keywords, matched via Postgres `plainto_tsquery`/
  `websearch_to_tsquery` against `messages.search_vector`.
- `conversationId` (optional): restrict to one conversation; omitted
  searches across every conversation the caller participates in.
- Results are always filtered to conversations the caller is an **active**
  participant of (server-side, not a client-supplied filter — a
  left/removed member can't search a group's history via this endpoint
  after leaving) and exclude tombstoned messages (`deleted_at IS NULL`).

`200 OK`
```json
{
  "results": [{
    "messageId": "uuid",
    "conversationId": "uuid",
    "conversationName": "Weekend Trip",
    "senderId": "uuid",
    "snippet": "...found the <b>keyword</b> right here...",
    "createdAt": "2026-07-01T10:00:00Z"
  }],
  "nextCursor": "..."
}
```
`snippet` uses Postgres `ts_headline` to bold the matched term(s) in
context — not the full message content.

Errors: `400` if `q` is blank.
