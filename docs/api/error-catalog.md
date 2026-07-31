# API Error Catalog

| Code | HTTP | Meaning |
|---|---:|---|
| AUTH_INVALID_CREDENTIALS | 401 | Generic sign-in failure |
| AUTH_REFRESH_REUSE_DETECTED | 401 | Token family revoked |
| ACCOUNT_SUSPENDED | 403 | Suspension still active |
| ACCOUNT_BANNED | 403 | Account banned |
| RESOURCE_NOT_FOUND | 404 | Missing or intentionally hidden |
| VALIDATION_FAILED | 422 | Field/domain validation |
| REPORT_ALREADY_OPEN | 409 | Duplicate open report |
| REPORT_STATE_CONFLICT | 409 | Illegal report transition |
| STAFF_HIERARCHY_VIOLATION | 403 | Equal/higher target or forbidden self-action |
| LAST_SUPER_ADMIN | 409 | Operation would remove final active super admin |
| GROUP_CLOSED | 409 | Messaging/membership mutation blocked |
| LAST_GROUP_ADMIN | 409 | Group invariant would be violated |
| MESSAGE_ALREADY_REMOVED | 409 | Tombstone/moderation conflict |
| RATE_LIMITED | 429 | Retry after header supplied |
| INTERNAL_ERROR | 500 | Safe generic failure |
