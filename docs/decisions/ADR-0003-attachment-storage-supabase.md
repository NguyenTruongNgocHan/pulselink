# ADR-0003: Private Supabase Storage for message attachments

**Status:** Accepted | **Date:** 2026-07-17

## Context
FR-13 requires image/file attachments. NFR-6 requires files to survive API
container replacement, and chat content must not become permanently public by
possession of a stable URL. The API must enforce the same conversation
membership and blocking rules for attachments as it does for message metadata.

## Decision
Use a **private Supabase Storage bucket** for attachment bytes. PostgreSQL stores
attachment metadata plus an immutable `object_key`; it does not store file bytes
or a permanent public URL.

Upload flow:
1. An authenticated participant uploads through the API.
2. The API validates membership, MIME type, size (NFR-5), and rate limit.
3. The API writes the object to the private bucket and stores its `object_key`.
4. The attachment is linked to a message only after the message transaction
   succeeds; unlinked temporary objects are eligible for scheduled cleanup.

Read flow:
1. The API loads a message/history response and verifies that the caller is an
   active conversation participant and is not denied by applicable block rules.
2. The API generates a **short-lived signed download URL** (target TTL: 5
   minutes) for each authorized attachment.
3. The browser downloads bytes directly from Supabase Storage using that URL.

The API never proxies the file body on normal reads, and clients must treat a
signed URL as ephemeral: after expiry they reload the message/history or call the
authorized attachment-download endpoint to receive a new URL.

## Alternatives Considered
- **Public bucket/permanent URL** — simplest, but anyone retaining the URL could
  access a private-conversation file indefinitely. Rejected.
- **Store bytes in PostgreSQL** — increases database size and backup/restore
  cost, and puts large transfers on the API/database path. Rejected.
- **API-container local disk** — lost on redeploy, violating NFR-6. Rejected.
- **AWS S3 or Cloudflare R2** — architecturally valid; Supabase is selected to
  reduce provider and credential overhead because PostgreSQL is already there.

## Trade-offs / Consequences
- Signed URLs can expire while a chat remains open; the client needs a refresh
  path and must not persist them as durable state.
- Storage authorization depends on API checks and secure service credentials.
- Orphan cleanup is required for uploads that never become attached to a
  persisted message.
- Virus/malware scanning and thumbnail generation remain explicitly out of
  scope for this stage.
