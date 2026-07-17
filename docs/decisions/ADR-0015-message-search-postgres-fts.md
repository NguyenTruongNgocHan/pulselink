# ADR-0015: PostgreSQL native full-text search, not a dedicated search engine

**Status:** Accepted | **Date:** 2026-07-17

## Context
FR-28 (confirmed in scope, round 2): search message history by keyword,
scoped to the caller's own conversations. NFR-14 (near-zero cost) and
NFR-4 (modest scale) both weigh against introducing a new piece of
infrastructure just for search.

## Decision
Use PostgreSQL's built-in full-text search: a generated `tsvector` column
on `messages.content` (via the `simple` text search configuration — see
Trade-offs for why not a language-specific one), indexed with a GIN
index. Search queries use `plainto_tsquery`/`websearch_to_tsquery` against
that column, filtered to conversations the caller participates in and
`deleted_at IS NULL` (tombstoned messages are excluded — their content is
already cleared per ADR-0012).

## Alternatives Considered
- **Elasticsearch / Meilisearch / OpenSearch** — meaningfully better
  relevance ranking, typo tolerance, and search-specific features, but
  is a whole additional service to run, operate, and keep in sync with
  Postgres (via CDC or dual-writes) — real operational overhead that
  directly contradicts NFR-14 and this project's single-instance-monolith
  posture (ADR-0000). Rejected for this stage; revisit only if search
  quality genuinely becomes a product complaint at real scale.
- **`LIKE '%term%'` queries instead of full-text search** — no new
  column/index needed, but can't use an index efficiently (forces a
  sequential scan as history grows) and has no concept of word
  boundaries/relevance at all. Rejected — this is the exact anti-pattern
  full-text search exists to replace.

## Trade-offs / Consequences
- **Language config trade-off**: Postgres ships linguistic
  stemming/stopword configs for major languages (English, etc.) but not
  Vietnamese out of the box. Using the `simple` config (tokenizes on
  whitespace/punctuation, no stemming, language-agnostic) means, e.g.,
  searching "chạy" won't also match "chạy bộ" the way an English stemmer
  would relate "run"/"running" — an honest limitation, not silently
  glossed over. The `unaccent` extension is worth adding at
  implementation time so a search without diacritics still matches
  accented content, which likely matters more for Vietnamese-language
  usage than stemming would.
- Explicitly not competing on search relevance quality (NFR's "out of
  scope" list already names this) — this is keyword matching, not a
  ranked-relevance product feature.
- The GIN index adds write overhead on every message insert/edit (the
  generated column must be recomputed) — acceptable at NFR-4's scale.
