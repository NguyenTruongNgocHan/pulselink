# ADR-0023 — Append-Only Administration Audit Log

**Status: Accepted.** Every privileged mutation and evidence read records actor, target, action, reason, request metadata, and selected before/after state. No application update/delete API exists. Audit writes are transactionally coupled to the privileged operation where practical and retained at least 365 days.
