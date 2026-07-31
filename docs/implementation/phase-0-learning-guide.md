# Phase 0 Learning Guide — Project Skeleton

## Goal

Phase 0 does not implement product features. It creates a reliable workspace in which every later feature can be developed, tested, and run consistently.

## What you should learn in this phase

### Java and Spring Boot

- A Maven project is described by `pom.xml`.
- `PulseLinkApplication` is the application entry point.
- Spring scans packages below `com.pulselink` and creates managed objects called beans.
- A controller maps HTTP requests to Java methods.
- `application.yml` keeps environment-dependent configuration outside Java code.
- Flyway applies ordered SQL migrations and prevents ad-hoc schema drift.
- Spring Security denies protected requests by default; only health/status routes are public in Phase 0.

### React

- `main.tsx` mounts the React application.
- `App.tsx` defines route-level composition.
- Pages are route targets; features contain reusable business behavior.
- Zustand stores local client state.
- TanStack Query will own server state when APIs arrive in Phase 1.
- A protected route is a UI guard, not a security boundary. The backend remains authoritative.

### Infrastructure

- Docker images package each application.
- Docker Compose starts PostgreSQL, Redis, API, and web together.
- Service health checks prevent dependent services from starting too early.
- GitHub Actions repeats the same test/build checks on every push and pull request.

## Files worth reading first

1. `docker-compose.yml`
2. `apps/api/v1/pom.xml`
3. `apps/api/v1/src/main/resources/application.yml`
4. `apps/api/v1/src/main/java/com/pulselink/shared/config/SecurityConfig.java`
5. `apps/web/src/main.tsx`
6. `apps/web/src/app/App.tsx`
7. `.github/workflows/ci.yml`

## Hands-on exercises

1. Change the API status response field `phase` from `0` to another number, run the backend test, then restore it.
2. Add a temporary `/about` React route and a small test, then remove it.
3. Stop PostgreSQL while the API is running and observe why application startup or health changes.
4. Run `docker compose down` and then `docker compose up`; verify data volumes remain.
5. Run `docker compose down -v`; understand why this is destructive for local state.

## Phase 0 definition of done

- `docker compose up --build` starts four services.
- The web app opens at port 5173.
- The API health and status endpoints return successfully.
- Backend verification passes.
- Frontend lint, tests, and build pass.
- CI contains both backend and frontend jobs.
- Module boundaries and migration tooling exist before Phase 1 begins.
