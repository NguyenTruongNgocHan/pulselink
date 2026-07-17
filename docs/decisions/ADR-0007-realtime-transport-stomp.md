# ADR-0007: STOMP over WebSocket (with SockJS fallback)

**Status:** Accepted | **Date:** 2026-07-17

## Context
FR-15/17/20/21/23/24/27 need pushing events to specific clients (a direct
message to its recipient) and groups of clients (a group message to every
member, a typing/reaction event to everyone in a conversation). NFR-1
requires <500ms delivery.

## Decision
STOMP messaging over WebSocket, SockJS fallback for restrictive networks.
Clients connect once (`/ws`), **send** to app destinations (e.g.
`/app/conversations/{id}/send`), **subscribe** to topic destinations for
broadcasts (`/topic/conversations/{id}`), and receive account-level events
on a per-user queue (`/user/queue/notifications`). Spring's built-in
simple broker is used for now (see Trade-offs).

## Alternatives Considered
- **Raw WebSocket, hand-rolled protocol** — reimplements what STOMP
  already provides (topic pub/sub, per-user routing) as bespoke code.
- **Socket.IO (via a Java port)** — great client DX, but not JVM-native;
  sits awkwardly next to Spring Security instead of using STOMP's
  built-in `ChannelInterceptor` support.
- **SSE + REST for sending** — one-directional; FR-23 (typing) is
  inherently bidirectional, the wrong fit for SSE.
- **Long polling** — works everywhere but fights NFR-1/NFR-4 directly.

## Trade-offs / Consequences
- Spring's in-memory simple broker keeps state in the API process —
  consistent with ADR-0000's single-instance assumption, but the exact
  thing that would need to become a real broker (RabbitMQ, Redis relay)
  if the system ever ran more than one instance.
- SockJS fallback means the underlying transport isn't always a true
  WebSocket in restrictive networks — an accepted trade for reach.
