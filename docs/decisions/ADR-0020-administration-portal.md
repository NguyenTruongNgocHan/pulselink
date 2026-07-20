# ADR-0020 — Administration Portal in the Existing React App

**Status: Accepted.** Implement a lazy-loaded `/admin` route tree with a separate shell in `apps/web`. It reuses authentication, design tokens, API client, CI, and deployment; server-side authorization remains authoritative. Extract to a separate app only if team ownership or release cadence becomes independent.
