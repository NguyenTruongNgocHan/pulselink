# Complete Screen Inventory

## User application

| ID | Screen | Core responsibility |
|---|---|---|
| UI-U01 | Starter / landing | Product entry, theme/system mode, login/register navigation |
| UI-U02 | Login | Session creation, generic errors, deactivation-cancel notice |
| UI-U03 | Register | Account creation and validation |
| UI-U04 | Conversation list | Recent conversations, unread badges, offline state |
| UI-U05 | Conversation | History, composer, attachments, reactions, receipts, typing |
| UI-U06 | People | Friends, search, presence, start direct chat |
| UI-U07 | Friend requests | Incoming/outgoing and block flows |
| UI-U08 | Create group | Name/avatar, 2+ friends |
| UI-U09 | Group details | Metadata, members, leave/closed state |
| UI-U10 | Group administration | Add/remove, transfer admin |
| UI-U11 | Message search | Authorized FTS results |
| UI-U12 | Report dialog/page | Target, reason, description, confirmation |
| UI-U13 | My reports | Public status and clarification |
| UI-U14 | Notifications | Account/moderation notifications |
| UI-U15 | Profile | Display name and private avatar |
| UI-U16 | Security/devices | Password, push permission, sessions, deactivate |
| UI-U17 | Not found / access denied | Safe fallback |

## Administration portal

| ID | Screen | Minimum role | Core responsibility |
|---|---|---:|---|
| UI-A01 | Admin shell / forbidden | MODERATOR | Navigation, role boundary, session state |
| UI-A02 | Dashboard | MODERATOR | Metrics, report workload, recent actions |
| UI-A03 | User directory | MODERATOR | Search/filter/paginate users |
| UI-A04 | User detail | MODERATOR | Safe profile, account/session/moderation actions |
| UI-A05 | Report queue | MODERATOR | Filter, claim, status workload |
| UI-A06 | Report review | MODERATOR | Evidence, bounded context, resolution |
| UI-A07 | Group directory | MODERATOR | Search/filter groups |
| UI-A08 | Group detail | MODERATOR | Metadata/membership; Admin close/reopen |
| UI-A09 | Audit log | ADMIN | Filterable immutable history |
| UI-A10 | Admin not found | Staff | Safe route fallback |

## Production content rule

Empty states describe user intent (“No open reports”) rather than development state (“Phase 7 not implemented”). Metrics must come from API or show a genuine loading/error/empty state; no decorative fake production data.
