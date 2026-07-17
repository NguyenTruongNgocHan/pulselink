# PulseLink

PulseLink is a real-time social messaging platform implemented as a React + Spring Boot modular monolith.

## Phase status

- **Design baseline:** complete
- **Phase 0 — Project skeleton:** implemented
- **Next:** Phase 1 — Authentication

## Stack

- Frontend: React 19, TypeScript, Vite, React Router, Zustand, TanStack Query
- Backend: Java 21, Spring Boot, Spring Security, JPA, WebSocket/STOMP, Flyway
- Data: PostgreSQL 16, Redis 7 locally; Render Key Value for the demo environment
- Verification: JUnit, Spring Boot Test, Vitest, React Testing Library, GitHub Actions

## Repository layout

```text
apps/
├── api/  Spring Boot API
└── web/  React web client
docs/     product and system design baseline
```

Backend module boundaries are `auth`, `friend`, `message`, `presence`, `push`, and `shared`.

## Run with Docker

Prerequisite: Docker Desktop with Docker Compose.

```bash
docker compose up --build
```

Then open:

- Web: http://localhost:5173
- API status: http://localhost:8080/api/v1/system/status
- API health: http://localhost:8080/actuator/health

Stop services with:

```bash
docker compose down
```

Use `docker compose down -v` only when you intentionally want to delete local database and Redis data.

## Run without Docker

Start PostgreSQL and Redis first, then:

```bash
cd apps/api
./mvnw spring-boot:run
```

In another terminal:

```bash
cd apps/web
npm ci
npm run dev
```

## Verify Phase 0

Backend:

```bash
cd apps/api
./mvnw verify
```

Frontend:

```bash
cd apps/web
npm ci
npm run lint
npm test
npm run build
```

## Learning path

Read `docs/implementation/phase-0-learning-guide.md` before changing the skeleton. Phase 1 will introduce authentication as the first complete vertical slice.

## Future architecture trigger

Kafka is not part of the current roadmap. Reconsider an event broker only when service extraction, event replay, or independent asynchronous consumers become real requirements.
