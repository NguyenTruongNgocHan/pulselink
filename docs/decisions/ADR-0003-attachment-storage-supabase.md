# ADR-0003: Supabase Storage (S3-compatible) for message attachments

**Status:** Accepted | **Date:** 2026-07-09

## Context
FR-13 requires attaching images/files to messages (confirmed in scope,
2026-07-09). NFR-6 requires attachment storage to survive container
restarts/redeploys — the API container's local disk is not durable.
ADR-0002 already established Supabase for Postgres hosting.

## Decision
Store attachment **files** in Supabase Storage (an S3-compatible object
store bundled with the same Supabase project as the database). Store only
**metadata** in Postgres (`message_attachments` table: URL, filename, MIME
type, size — see `schema.md`), never the file bytes themselves.

The API uploads to Supabase Storage via its S3-compatible API, gets back a
public or signed URL, and saves that URL alongside the message. The
frontend fetches attachments directly from Supabase Storage's URL, not
proxied through the API — the API is only in the write/metadata path.

## Alternatives Considered
- **Store file bytes in Postgres (`bytea`/large objects)** — one fewer
  external dependency, but bloats the database with binary data,
  degrades backup/restore times, and works against NFR-2's API latency
  target once files are large. Rejected outright — this is a well-known
  anti-pattern for exactly this reason.
- **Local disk on the API container** — simplest to code, but directly
  violates NFR-6: a redeploy or restart (container replaced, not just
  rebooted) loses every uploaded file. Rejected.
- **AWS S3 / Cloudflare R2 directly** — equally valid S3-compatible
  choices, and either would work with the same design. Supabase Storage
  is chosen specifically because it's already the same account/project as
  the database (ADR-0002) — one less service to separately provision,
  bill, and manage credentials for, which matters more here than any
  feature difference between the providers at this scale.

## Trade-offs / Consequences
- Couples attachment storage to the same vendor as the database — if
  Supabase's free tier limits are hit for storage specifically (separate
  quota from the DB), that's a second constraint to watch, not just one.
- Public/signed URL strategy needs a real decision at implementation
  time: public URLs are simpler but mean "anyone with the link" can view
  a file indefinitely; signed URLs (time-limited) are more correct for
  private conversations but add expiry-handling complexity. Flagged here
  as an open implementation detail, leaning toward signed URLs given
  NFR-11's blocking/privacy requirements — worth confirming before
  building.
- No virus/malware scanning of uploads (noted as an explicit NFR
  exclusion) — a real gap if this became a production system with
  untrusted users.
