# Data Retention, Account Deactivation, and Privacy

| Data | Retention | Final handling |
|---|---|---|
| Deactivation request | 30-day grace | Login may cancel; then anonymize PII |
| Messages | Preserve conversation integrity | Sender becomes anonymized; recalled/moderated body hidden |
| Private avatar | Until replacement/deactivation/moderation reset | Object deleted |
| Orphan attachment upload | Short scheduled window | Object/row deleted |
| Refresh-token security history | Expiry + 30 days | Hashes only; raw token never stored |
| Closed reports/evidence | 365 days | Delete/anonymize unless legal hold |
| Admin audit | Minimum 365 days | Append-only until retention job |
| Notifications | 180 days | Scheduled deletion |
| Redis presence/rate counters | Seconds/hours | TTL |

Deactivation completion replaces email/username with irreversible unique aliases, clears display/avatar PII, revokes sessions, and sets `DEACTIVATED`; it does not hard-delete message history or break foreign keys.
