# Functional Requirements

Items below define the approved product baseline. Implementation status is tracked in the implementation plan, not in the requirement wording. Numbered so ADRs/code/tests can
reference them (e.g. "implements FR-12"). Expanded 2026-07-17 (round 2):
message search, push notifications, admin hand-off.

## Account
| ID | Requirement |
|---|---|
| FR-1 | Register with email + username + password. |
| FR-2 | Log in and receive a session (tokens). |
| FR-3 | Renew a session without re-entering a password (up to a max inactive period). |
| FR-4 | Log out, invalidating the ability to renew the session. |
| FR-5 | Edit own profile (display name, avatar). |

## Friends
| ID | Requirement |
|---|---|
| FR-6 | Search for another user by username. |
| FR-7 | Send a friend request to another user. |
| FR-8 | Accept or decline a pending friend request. |
| FR-9 | Remove an existing friend. |
| FR-10 | Block a user — stops them from messaging, friend-requesting, or seeing this user's presence. |
| FR-11 | Unblock a previously blocked user. |

## Direct Messaging
| ID | Requirement |
|---|---|
| FR-12 | Send a direct text message to a friend. |
| FR-13 | Attach an image or file to a message. |
| FR-14 | Retrieve message history for a conversation, in order, paginated. |
| FR-15 | A message sent while the recipient is online is delivered in real time. |

## Group Chat
| ID | Requirement |
|---|---|
| FR-16 | Create a group with a name and 2+ friends. |
| FR-17 | Send/receive messages in a group, same real-time guarantee as FR-15. |
| FR-18 | Group admin (creator, or current admin) adds or removes members. |
| FR-19 | Any member can leave a group. |
| FR-20 | Admin can transfer their role to another current active member at any time, without that member's prior consent (see ADR-0009). |
| FR-21 | When an admin leaves without transferring first, a successor is chosen automatically (see ADR-0009's succession algorithm). |

## Presence & Liveness
| ID | Requirement |
|---|---|
| FR-22 | See which friends are currently online. |
| FR-23 | See a "typing..." indicator while the other party composes a message. |
| FR-24 | See per-person "seen" status on a message (who has seen it, and when). |

## Message Lifecycle
| ID | Requirement |
|---|---|
| FR-25 | Edit a message already sent; others see an "edited" marker. |
| FR-26 | Delete (recall) a sent message; it's replaced with a tombstone for everyone. |
| FR-27 | React to any message with an emoji; one reaction per user per message (choosing a new emoji replaces the old one). |

## Search
| ID | Requirement |
|---|---|
| FR-28 | Search message history by keyword, scoped to conversations the caller is a participant of. |

## Notifications
| ID | Requirement |
|---|---|
| FR-29 | See an unread-message count/badge per conversation. |
| FR-30 | Unread count clears when the conversation is opened and messages are read. |
| FR-31 | Receive a browser push notification for a new message when not actively connected (tab closed/backgrounded), given notification permission was granted. |

## Reporting & User Safety
| ID | Requirement |
|---|---|
| FR-32 | Report a user, message, or group using a standardized reason and optional description; `OTHER` requires a description. |
| FR-33 | Capture an immutable, minimized evidence snapshot when a report is submitted so later deletion cannot erase the moderation basis. |
| FR-34 | Prevent the same reporter from creating duplicate open reports against the same target. |
| FR-35 | View the caller's submitted reports and their public status without exposing internal staff notes or identities. |
| FR-36 | Add clarification to the caller's report while it is still `OPEN`; clarification is immutable once submitted. |

## In-App Notifications
| ID | Requirement |
|---|---|
| FR-37 | Receive an in-app notification for account-security and moderation events (warning, suspension, ban, profile reset, report resolution, group closure). |
| FR-38 | List notifications with cursor pagination and an unread count. |
| FR-39 | Mark one notification or all notifications as read. |

## Administration Portal — Access & Dashboard
| ID | Requirement |
|---|---|
| FR-40 | A user with `MODERATOR`, `ADMIN`, or `SUPER_ADMIN` system role can enter a protected administration portal; ordinary users cannot discover or access its routes or APIs. |
| FR-41 | Authorized staff can view operational dashboard cards for users, active users, conversations, messages, open reports, suspended/banned users, and recent moderation workload. |

## Administration Portal — User Management
| ID | Requirement |
|---|---|
| FR-42 | Authorized staff can search/filter users by email, username, role, account status, and creation date with stable pagination. |
| FR-43 | Authorized staff can view a user's safe profile, account status/history, session summary, reports, and moderation history without seeing passwords, raw tokens, or arbitrary private messages. |
| FR-44 | A moderator or higher can suspend a lower-privileged user until a specified time, with a mandatory reason; all sessions are revoked immediately. |
| FR-45 | An admin or higher can ban/unban a lower-privileged user with a mandatory reason; all sessions are revoked immediately. |
| FR-46 | A moderator or higher can force logout all sessions for a lower-privileged user. |
| FR-47 | A moderator or higher can reset a violating display name and/or avatar to a safe default, with notification and audit. |
| FR-48 | Only a super administrator can assign system roles; no staff member may act on an equal/higher role, self-promote, or remove the last active super administrator. |

## Administration Portal — Reports & Moderation
| ID | Requirement |
|---|---|
| FR-49 | Moderators can list, filter, claim, and transition reports through `OPEN → IN_REVIEW → RESOLVED|REJECTED`. |
| FR-50 | During review, staff can view the immutable evidence and, for a reported message, at most five messages before and five after it; arbitrary private-conversation browsing is forbidden. |
| FR-51 | Staff can resolve a report with `NO_ACTION`, `WARNING`, `CONTENT_REMOVED`, `USER_SUSPENDED`, `USER_BANNED`, or `GROUP_CLOSED`, subject to role authority. |
| FR-52 | Administrative content removal is distinct from user recall and records moderator, timestamp, and reason while preserving a tombstone for participants. |

## Administration Portal — Group Operations & Audit
| ID | Requirement |
|---|---|
| FR-53 | Authorized staff can search groups and inspect metadata and active membership without unrestricted access to message history. |
| FR-54 | An admin or higher can close or reopen a group with a mandatory reason; a closed group preserves history but blocks new messages and membership changes. |
| FR-55 | An admin or higher can query an immutable, filterable audit log of privileged actions. |
| FR-56 | Every privileged mutation records actor, action, target, mandatory reason, request/correlation ID, timestamp, IP/user-agent hashes, and selected before/after state. |

## Requirement dependency trace
- FR-1–5 establish identity/profile; FR-6–11 establish the social boundary.
- FR-12–31 retain the original messaging, group, presence, lifecycle, search, unread, and Web Push baseline.
- FR-32–36 add user reporting and evidence creation; they precede portal moderation because the portal consumes those reports.
- FR-37–39 provide the user-visible channel for moderation/account outcomes.
- FR-40–41 establish staff access and operational overview.
- FR-42–48 define account administration and role hierarchy.
- FR-49–52 define report workflow, privacy-bounded evidence access, and moderation outcomes.
- FR-53–54 define group-level system administration independently from group-admin membership powers in FR-18–21.
- FR-55–56 make privileged operations reviewable and are cross-cutting dependencies of FR-44–54.
- The normative row-by-row mapping is in `traceability-matrix.md`; permission rules are in `../architecture/authorization-model.md`.
