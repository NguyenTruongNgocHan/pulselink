# ADR-0021 — Fixed System Role Hierarchy

**Status: Accepted.** Use one `users.system_role`: `USER`, `MODERATOR`, `ADMIN`, `SUPER_ADMIN`. Group `ADMIN` remains a resource role in `conversation_participants` and grants no portal access. Dynamic RBAC is deferred because the fixed policy is clearer and sufficient. Staff cannot act on equal/higher roles; only super administrators assign roles.
