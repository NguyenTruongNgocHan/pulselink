# ADR-0002: PostgreSQL as the database, hostable on Supabase

**Status:** Accepted | **Date:** 2026-07-17

## Context
The domain is inherently relational: unique usernames/emails, a message
belongs to exactly one conversation and sender, group membership and
friendships are many-to-many relations. Separately, the demo needs to be
clickable without asking a recruiter to run Docker locally.

## Decision
PostgreSQL as the only structured datastore. Connection details
(`SPRING_DATASOURCE_URL/USERNAME/PASSWORD`) are fully environment-variable
driven, so the same codebase runs against a local `postgres:16` container
(dev) or a Supabase-hosted Postgres instance (persistent demo).

## Alternatives Considered
- **MongoDB** — schema-flexible, but the actual relations here (friend
  pairs, message↔sender↔conversation FKs, unique constraints) map more
  naturally to relational tables, and this project wants to demonstrate
  JPA/relational modeling specifically.
- **Firebase Firestore/Realtime DB** — realtime-native but not idiomatic
  with Spring/JPA; would sideline the Java backend work this project
  exists to showcase.

## Trade-offs / Consequences
- More upfront schema design (migrations, joins) than a document store.
- Supabase-specific quirks to remember: pooler on port `6543` (vs `5432`
  direct), requires `sslmode=require`; free tier pauses after inactivity
  (cold start on first request after a pause) — acceptable for a demo.
