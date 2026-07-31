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
- Attachment objects are private; access is granted only through short-lived
  signed URLs generated after server-side conversation authorization.

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
  (Testcontainers, ADR-0019). The React app also has automated
  Vitest/React Testing Library coverage for the auth store and refresh behavior,
  protected routing, chat message/tombstone/attachment rendering, and unread
  badge clearing; CI runs these tests before build/deploy.

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

## Administration security & privacy
- **NFR-29**: System roles are a fixed hierarchy: `USER < MODERATOR < ADMIN < SUPER_ADMIN`; every portal API enforces role and object-level checks server-side.
- **NFR-30**: Staff cannot mutate an equal/higher-privileged account, self-promote, or remove the last active `SUPER_ADMIN`.
- **NFR-31**: Every privileged mutation requires a non-blank reason and creates an append-only audit record; an operation must not succeed silently without its audit record.
- **NFR-32**: Staff cannot browse arbitrary private conversations. A message report exposes only its evidence snapshot and at most five preceding/five following messages, and each evidence access is audited.
- **NFR-33**: Report responses never expose reporter identity to the reported user/group or expose staff-only notes to the reporter.
- **NFR-34**: Administration routes and bundles are lazy-loaded and hidden from ordinary navigation; this is UX only and never replaces server authorization.
- **NFR-35**: Privileged endpoints use stricter rate limits than ordinary reads and return `429` with `Retry-After`.

## Account lifecycle & retention
- **NFR-36**: Account states are `ACTIVE`, `SUSPENDED`, `BANNED`, `DEACTIVATION_PENDING`, `DEACTIVATED`; non-active accounts cannot create new authenticated REST/WebSocket sessions.
- **NFR-37**: User-requested deactivation has a **30-day grace period**. Completion anonymizes personally identifying profile fields and removes private avatar objects while preserving conversation integrity.
- **NFR-38**: Closed reports/evidence and admin audit records are retained for at least **365 days** in the baseline; in-app notifications are retained for **180 days**.
- **NFR-39**: Raw refresh tokens, access tokens, signed URLs, passwords, report evidence bodies, and private message bodies are never written to application logs.

## Administration usability, observability & tests
- **NFR-40**: Admin directory/report endpoints return within **500ms p95** under NFR-4 load, excluding intentionally bounded evidence retrieval.
- **NFR-41**: Portal tables use stable pagination/filtering and preserve filters in the URL so review state is reproducible and shareable among authorized staff.
- **NFR-42**: Core user UI targets WCAG 2.1 AA from 360px upward; administration UI targets keyboard-accessible tablet/desktop layouts from 768px upward, with visible focus and reduced-motion support.
- **NFR-43**: Backend integration/security tests cover every role boundary, staff hierarchy, report transition, bounded-context query, group-close state, and audit write.
- **NFR-44**: Frontend Vitest/React Testing Library coverage includes admin route guards, permission-based actions, report queue/review states, user/group management confirmations, and audit filters; Playwright critical admin journeys are required before demo release.

## Explicitly out of scope for this baseline
- Horizontal scaling / multi-instance WebSocket fan-out.
- AI moderation or automated policy decisions.
- Unrestricted administrator access to private conversations.
- Dynamic RBAC/permission editor, staff impersonation, multi-tenancy, billing, and support tickets.
- Virus/malware scanning and media transcoding (named production hardening items).
- Kafka/event-broker infrastructure until durable replay, independent consumers, or service extraction creates a measured need.
