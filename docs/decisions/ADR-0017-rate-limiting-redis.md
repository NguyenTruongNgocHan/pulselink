# ADR-0017: Redis fixed-window counters for rate limiting

**Status:** Accepted | **Date:** 2026-07-17

## Context
NFR-17–21 specify concrete per-action limits (friend requests, messages,
login attempts, registration, uploads). Redis already exists in the stack
for presence (ADR-0014) — reusing it avoids a new piece of
infrastructure.

## Decision
A rate-limit check is a Redis key per `(action, identity)` pair (e.g.
`ratelimit:login:{email}:{ip}`, `ratelimit:friend-request:{userId}`),
incremented (`INCR`) on each attempt with an expiry (`EXPIRE`) set on
first increment to the window length. If the counter exceeds the
configured threshold before the window expires, the request is rejected
with `429 Too Many Requests` and a `Retry-After` header computed from the
key's remaining TTL. Implemented as a Spring `HandlerInterceptor` (REST)
and a STOMP `ChannelInterceptor` (WebSocket sends), both delegating to one
shared `RateLimiter` service so the logic isn't duplicated per protocol.

## Alternatives Considered
- **Sliding-window or token-bucket algorithm** (e.g. via Bucket4j) — more
  accurate (fixed windows allow a burst of up to 2x the limit right at a
  window boundary — e.g. a user could send the limit at 0:59 and again at
  1:00, getting 2x throughput across that boundary). Rejected for this
  stage on the grounds that the *exact* precision doesn't matter at
  NFR-4's scale — the goal is "stop obvious abuse/spam," not perfectly
  smooth throttling — but named here as the concrete mechanism that would
  replace this if abuse patterns ever showed the boundary-burst gap being
  exploited.
- **A dedicated API gateway with built-in rate limiting** (e.g. Kong,
  or a cloud API gateway) — real production pattern, but a whole new
  piece of infrastructure sitting in front of a single-instance monolith
  (ADR-0000) that doesn't need one yet. Rejected for the same reason
  ADR-0000 rejected microservices infrastructure generally.
- **In-memory counters (no Redis)** — would work for a single instance
  (which is all this project runs, per ADR-0000/NFR-3), removing a Redis
  round-trip. Rejected anyway: Redis is already a running dependency, and
  keeping rate-limit state there rather than in-process means the limits
  would keep working correctly if the API ever did scale to more than one
  instance later, at no extra cost now.

## Trade-offs / Consequences
- Fixed-window boundary-burst issue named above is accepted, not solved,
  at this stage.
- Every rate-limited action now makes an extra Redis round-trip — small,
  consistent overhead, acceptable against NFR-2's latency budget.
- Limits are currently hardcoded per NFR-17–21's values, not
  configurable per-environment without a code change — acceptable for a
  single demo deployment; would need externalizing to config if this
  supported multiple environments with different thresholds.
