# Deployment & CI/CD

Implements ADR-0018. See that ADR for the reasoning; this document is the
concrete pipeline/topology.

## Current production deployment

- Frontend production: https://pulselink-iota.vercel.app
- Backend API: https://pulselink-api.onrender.com
- Backend health check: https://pulselink-api.onrender.com/actuator/health
- Frontend hosting: Vercel
- Backend hosting: Render
- Database: Supabase PostgreSQL
- Redis: Render Key Value

> The backend runs on a free Render instance. The first request after a period of inactivity may take 30-60 seconds while the service wakes up.

Attachments currently use the local path `/data/uploads`; that is acceptable for the current demo deployment, but it is not persistent production storage without a persistent disk or object storage.

## Deployment topology

```mermaid
flowchart LR
    Dev["Developer<br/>git push to main"]
    GH["GitHub repo"]
    Actions["GitHub Actions<br/>test + build"]
    Render["Render<br/>apps/api (Docker)"]
    Vercel["Vercel<br/>apps/web (static build)"]
    Supabase[("Supabase<br/>PostgreSQL")]
    KeyValue[("Render Key Value<br/>Valkey / Redis-compatible")]
    User(("End user / reviewer<br/>browser"))

    Dev --> GH
    GH --> Actions
    Actions -->|"tests pass to deploy hook"| Render
    GH -->|"native integration, own build"| Vercel
    Render --> Supabase
    Render --> KeyValue
    User -->|"HTTPS"| Vercel
    User -->|"HTTPS/WSS"| Render
```

## CI pipeline (GitHub Actions)

```mermaid
flowchart TB
    Trigger["push / PR to main"]
    Backend["Backend job:<br/>mvn test<br/>(unit + Testcontainers integration, ADR-0019)"]
    Frontend["Frontend job:<br/>npm ci then lint then Vitest then build"]
    Gate{"Both pass?"}
    DeployAPI["Trigger Render deploy hook"]
    DeployWeb["Vercel auto-deploys<br/>(its own build, gated separately)"]
    Block["Deploy blocked (NFR-27)"]

    Trigger --> Backend
    Trigger --> Frontend
    Backend --> Gate
    Frontend --> Gate
    Gate -->|yes| DeployAPI
    Gate -->|yes| DeployWeb
    Gate -->|no| Block
```

Backend and frontend jobs run in parallel (independent, per ADR-0001's
monorepo path separation) — a frontend-only change doesn't wait on a
Postgres Testcontainers boot, and vice versa.

## Environments
Two, for this stage:
- **Local** — `docker-compose.yml` (ADR-0006): local Postgres/Redis
  containers, `.env`-driven config.
- **Demo/production** — Render API + Render Key Value, Vercel, and Supabase, as above. No separate
  "staging" environment yet — acceptable for a solo-developer portfolio
  project (NFR-13 already disclaims a formal SLA); would be a real gap to
  close before any team or paying users existed.

## Secrets
| Secret | Lives in |
|---|---|
| `JWT_SECRET` | Render environment variables + GitHub Actions secret (test env uses a separate throwaway value) |
| Supabase DB/Storage credentials | Render environment variables |
| `REDIS_URL` (Render Key Value internal URL) | Render environment variables |
| Render deploy hook URL | GitHub Actions secret |
| VAPID keys (ADR-0016) | Render environment variables |

Never committed — enforced by the existing `.gitignore` rule
(`.env*` ignored, `.env.example` explicitly whitelisted as a template).

## Known gaps (named, not silently skipped)
- No staging environment / blue-green or canary deploys — a direct
  push-to-main-deploys-to-prod pipeline, acceptable at this project's
  stage (NFR-13).
- No automated rollback on a bad deploy — would need to be added before
  this handled real user traffic.
- No end-to-end (browser-level) Playwright stage in CI yet; critical React components and state are still covered by Vitest/React Testing Library — see
  `../testing/strategy.md` for why that's called out as a deliberate,
  later addition.


## Administration portal deployment/security

The portal ships in the same static web artifact but is route-level lazy-loaded. CDN/static hosting is not a trust boundary. `/api/v1/admin/**` is protected by Spring Security and domain authorization. Production secrets include an initial super-admin bootstrap mechanism that is disabled after provisioning; no default password is committed. Admin actions and evidence reads emit structured audit/security metrics without sensitive content.
