# Functional Requirements

All items below are ⬜ **Not started** — the repository currently contains
no business logic (verified 2026-07-17). Numbered so ADRs/code/tests can
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

## Traceability
- FR-1–5 (account) are the prerequisite for everything else.
- FR-6–11 (friends) exist because messaging is friend-gated (ADR-0008) —
  a user must be an accepted friend before FR-12 applies.
- FR-12–15 (direct messaging) is the core value proposition, and comes
  before group chat, which builds on the same message/attachment model.
- FR-16–21 (groups) depend on FR-12–15's message model. FR-20/21
  (admin transfer/succession) are last within this group because they're
  an edge-case management concern on top of a group that must already
  exist — see ADR-0009 for the full succession algorithm, added in this
  revision after a scenario walkthrough surfaced the need for explicit
  transfer, not just automatic succession.
- FR-22–24 (presence) depend on messages/conversations already existing.
- FR-25–27 (edit/delete/react) are message-level enhancements.
- FR-28 (search) depends on messages already existing to search over —
  correctly sequenced after the core message model, per ADR-0015.
- FR-29–31 (notifications) depend on FR-24's read-tracking (ADR-0011 for
  unread counts) and, for FR-31, on knowing whether a user is connected
  (ADR-0014 presence) to decide whether a push is even needed — see
  ADR-0016.
