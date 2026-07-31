# ADR-0024 — Account Lifecycle and Anonymizing Deactivation

**Status: Accepted.** Accounts use `ACTIVE`, `SUSPENDED`, `BANNED`, `DEACTIVATION_PENDING`, `DEACTIVATED`. User deactivation has a 30-day grace period; completion anonymizes PII/removes avatar while preserving conversation history. Suspension/ban/force logout revoke sessions and invalidate token version.
