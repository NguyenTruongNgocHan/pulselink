# PulseLink

Real-time social messaging platform focused on scalable communication systems.

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Zustand
- TanStack Query

### Backend
- Java 21
- Spring Boot
- Spring Security
- WebSocket
- JPA

### Infrastructure
- PostgreSQL
- Redis
- Docker

## Architecture

Client
↓
REST API / WebSocket
↓
Spring Boot
↓
PostgreSQL + Redis

## Features

- JWT Authentication
- Direct Messaging
- Online Presence
- Typing Indicator
- Seen Status
- Group Chat

## Roadmap

- [ ] Authentication
- [ ] Direct Messaging
- [ ] Presence Tracking
- [ ] Group Chat
- [ ] Redis Integration
- [ ] Future consideration: event broker (Kafka only if service extraction, replay, or independent async consumers become necessary)
