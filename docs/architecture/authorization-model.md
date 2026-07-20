# Authorization Model — System Roles, Resource Roles, and Ownership

Authorization is deny-by-default and evaluated server-side. The React UI may hide actions for usability, but it is never an authorization boundary.

## System role hierarchy

| Capability | USER | MODERATOR | ADMIN | SUPER_ADMIN |
|---|---:|---:|---:|---:|
| Use user application | ✓ | ✓ | ✓ | ✓ |
| Enter administration portal | — | ✓ | ✓ | ✓ |
| Review/claim reports | — | ✓ | ✓ | ✓ |
| Warn/remove reported content | — | ✓ | ✓ | ✓ |
| Suspend lower-role account | — | ✓ | ✓ | ✓ |
| Ban/unban lower-role account | — | — | ✓ | ✓ |
| Close/reopen group | — | — | ✓ | ✓ |
| Query global audit log | — | — | ✓ | ✓ |
| Assign system roles | — | — | — | ✓ |

## Resource roles

A system role is independent from a group role. A normal `USER` may be the `ADMIN` of one group in the product sense, represented as `conversation_participants.role = ADMIN`; that does not grant portal access.

| Resource/action | Required rule |
|---|---|
| Read/send in conversation | Active participant; direct users must remain unblocked |
| Edit/delete message | Original sender; message not already tombstoned; policy window satisfied |
| Manage group membership | Current active group admin |
| Transfer group admin | Current group admin; target active member |
| View own report | Reporter only |
| Review report evidence | `MODERATOR+`, report-scoped; access audited |
| Suspend/force logout/reset profile | `MODERATOR+`, actor role strictly greater than target |
| Ban/group close/audit log | `ADMIN+`; hierarchy still applies |
| Assign role | `SUPER_ADMIN`; no self-promotion, no equal/higher target, preserve one active super admin |

## Existence hiding

For resources a caller must not enumerate, the API returns `404` rather than revealing that the resource exists. `403` is used when existence is already known and the missing permission is safe to disclose.

## Token/account enforcement

Account status and token version are checked for REST and STOMP `CONNECT`. Suspension, ban, force logout, password change, or role change revoke refresh tokens and increment token version so already-issued access tokens become invalid at the next authorization check.
