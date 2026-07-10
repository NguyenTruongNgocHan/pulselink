# Non-Functional Requirements

Concrete, testable targets — sized to this project's actual context
(early-stage demo, near-zero budget), with the reasoning stated wherever a
target is deliberately modest.

## Performance & real-time delivery
- **NFR-1**: A message between two online users is delivered within
  **500ms** end-to-end (server + network), excluding client render.
- **NFR-2**: A REST API call responds within **300ms** at p95 under
  normal load (NFR-4).

## Scalability
- **NFR-3**: At least **500 concurrent WebSocket connections** on the
  smallest viable single-instance deployment, without redesign.
- **NFR-4**: Normal load assumed ≤50 requests/second REST traffic — sized
  to "demo to early users," not production social-network scale.

## Storage & media (new — driven by FR-13 attachments)
- **NFR-5**: A single attachment is capped at **10 MB**. Larger files are
  rejected client-side and server-side, not silently truncated.
- **NFR-6**: Attachment storage must not live on the API container's local
  disk — containers are ephemeral/replaceable (consistent with ADR-0000's
  containerized deployment), so a restart or redeploy must not lose
  uploaded files. Drives ADR-0003 (external object storage).

## Security
- **NFR-7**: Passwords never stored in plaintext or reversible form
  (BCrypt).
- **NFR-8**: Access tokens expire within **15 minutes** if leaked.
- **NFR-9**: A user can revoke their own session (logout) without waiting
  for natural token expiry.
- **NFR-10**: All client-server traffic over HTTPS/WSS in any non-local
  environment.
- **NFR-11**: A blocked user (FR-10) cannot send messages, friend
  requests, or observe presence for the blocking user, enforced
  server-side.

## Rate limiting (new — closes the previously-named gap)
- **NFR-17**: Friend requests — max **20 sent per hour** per user.
- **NFR-18**: Messages — max **60 sent per minute** per user (across all
  conversations combined, not per-conversation — a single fast typist
  shouldn't be penalized for messaging one busy group, but a script
  blasting messages across many conversations at once should still be
  caught).
- **NFR-19**: Login attempts — max **5 per 15 minutes** per email +
  per IP combination (brute-force protection).
- **NFR-20**: Registration — max **5 per hour** per IP (anti mass
  fake-account creation).
- **NFR-21**: Attachment uploads — max **20 per hour** per user (protects
  both NFR-5's per-file cap and overall storage cost, NFR-14).
- All limits return `429 Too Many Requests` with a `Retry-After` header,
  not a silent drop — see ADR-0017 for the mechanism.

## Search (new — driven by FR-28)
- **NFR-22**: A search query returns results within **1 second** for a
  user's message history at this project's expected scale (NFR-4) — not
  a hard guarantee at arbitrary scale, see ADR-0015.

## Push notifications (new — driven by FR-31)
- **NFR-23**: A push notification is only sent if the recipient has no
  active WebSocket connection at send time (no duplicate ping to someone
  already looking at the conversation).
- **NFR-24**: Push delivery is best-effort — if the browser/OS drops it,
  no retry queue is built for this stage (see ADR-0016).

## Testing (new)
- **NFR-25**: Every service-layer class implementing an FR has unit test
  coverage; target **≥80% line coverage** on the `service` packages
  across all modules — not a company-wide blanket number, deliberately
  scoped to business logic, not DTOs/getters/config classes (see
  `../testing/strategy.md`).
- **NFR-26**: Every REST endpoint and WebSocket destination has at least
  one integration test exercising it against a real Postgres instance
  (Testcontainers, ADR-0019) — not just unit-tested with mocks.

## Deployment & CI (new)
- **NFR-27**: Every push to the main branch runs the full test suite
  before any deploy step executes — a failing test blocks deployment,
  not just a warning (see ADR-0018).
- **NFR-28**: The deployed demo environment must be reachable via a
  single public URL with no manual setup required from a reviewer.

## Availability & durability
- **NFR-12**: A message, once acknowledged as sent, survives an API
  process restart (persisted before ack — no in-memory-only source of
  truth).
- **NFR-13**: No formal uptime SLA at this stage — portfolio demo, not a
  paid product.

## Cost
- **NFR-14**: The full stack (DB + object storage + API + web + CI) must
  run on free-tier or near-zero-cost infrastructure during the demo
  phase.

## Maintainability
- **NFR-15**: A new contributor can clone the repo and run the full stack
  locally within 5 minutes, given Docker installed.
- **NFR-16**: Every architecturally-significant decision has a
  corresponding ADR in `docs/decisions/`.

## Explicitly out of scope for this stage
- Horizontal scaling / multi-instance WebSocket fan-out.
- Observability/monitoring dashboard (structured logging only).
- Virus/malware scanning on uploaded attachments.
- CDN/image transcoding for attachments.
- Retry/dead-letter handling for failed push notifications (NFR-24).
- Fuzzy/typo-tolerant search relevance ranking (FR-28 is exact/prefix
  keyword matching via Postgres full-text search, not a dedicated search
  engine's relevance model — see ADR-0015).
