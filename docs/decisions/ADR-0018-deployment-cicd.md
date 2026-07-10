# ADR-0018: Render (API) + Vercel (web) + Supabase (DB/Storage), GitHub Actions CI

**Status:** Accepted | **Date:** 2026-07-09

## Context
ADR-0002 deferred choosing an actual deployment target. NFR-28 requires a
single public URL a reviewer can open with no setup. NFR-14 requires
near-zero cost. NFR-27 requires tests to gate every deploy.

> **Caveat**: free-tier terms for any hosting provider change over time.
> The specific choice below should be re-verified against each provider's
> current free-tier terms at the moment of actually deploying, not
> assumed to match exactly what's written here indefinitely.

## Decision
- **API** (`apps/api`, Docker image from ADR-0006's Dockerfile) →
  **Render** as a Web Service, auto-deploying from the `main` branch.
- **Web** (`apps/web`, static Vite build) → **Vercel**, connected directly
  to the GitHub repo — Vercel builds and deploys automatically on push,
  including a unique preview URL per pull request (a genuinely useful
  side benefit: a reviewer can see a PR's frontend changes live before
  merge, without extra pipeline work).
- **Database + attachment storage** → Supabase (already decided in
  ADR-0002/0003) — no change here, just confirming it's part of the same
  deployment picture.
- **CI**: a GitHub Actions workflow on every push/PR to `main`:
  1. Backend job: `mvn test` (unit + Testcontainers integration tests,
     ADR-0019) against a Postgres service container.
  2. Frontend job: `npm ci && npm run lint && npm run build`.
  3. Only if both jobs pass does Render's deploy hook get triggered for
     the API (Vercel's own GitHub integration handles the frontend
     deploy natively, gated on its own build succeeding).
- Secrets (JWT signing key, Supabase credentials, Render deploy hook URL,
  VAPID keys for ADR-0016) live in GitHub Actions secrets and each
  platform's own environment variable settings — never committed (already
  enforced by the existing `.gitignore` rule for `.env*`).

## Alternatives Considered
- **Railway / Fly.io instead of Render** — comparable Docker-based hosts;
  either would satisfy the same requirements. Render is chosen mainly for
  straightforward GitHub-push-to-deploy simplicity matching NFR-15's
  "quick to get running" spirit; this is a low-stakes choice among
  similar options, not a decision with deep architectural consequences —
  worth re-evaluating freely if pricing/limits change.
- **Deploying the frontend from the same host as the API** (e.g. serve
  the built static files from Spring Boot itself) — one fewer service to
  configure, but loses Vercel's per-PR preview deployments and its
  purpose-built static-site CDN/caching, for no real benefit given the
  frontend and backend are already independently deployable (ADR-0001).
- **A full container orchestration deploy (Kubernetes-hosted)** — same
  rejection as ADR-0000/ADR-0006: no scale justification yet.

## Trade-offs / Consequences
- Two different hosting dashboards (Render + Vercel) to manage instead of
  one — an acceptable split given the genuinely different needs of a
  long-running API process vs. a static frontend build.
- Render's free tier (and similarly Supabase's) may spin down after
  inactivity, meaning a cold-start delay on the first request after idle
  time — a real, named demo-experience quirk (already noted for Supabase
  in ADR-0002), not something to be surprised by later.
- CI only runs backend + frontend build/lint/test — no automated
  end-to-end (browser-level) test stage yet; see `testing/strategy.md`
  for why that's an explicit, later addition rather than a silent gap.
