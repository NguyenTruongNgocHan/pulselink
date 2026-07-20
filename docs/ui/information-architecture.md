# UI Information Architecture — Design Input

UI visual design starts only after this inventory is accepted. Product screens must never display internal phase labels, “skeleton”, implementation notes, fake metrics, or explanatory text that belongs in documentation.

## User application navigation

Public: starter → login → register.
Authenticated: conversations, people/friend requests, message search, notifications, profile/security. Conversation routes include direct/group messaging; group settings expose member administration only to the current group admin.

## Administration portal navigation

Protected `/admin`: dashboard, users, reports, groups, audit log. It uses a separate shell and denser tablet/desktop layout but shares design tokens/themes with PulseLink. Ordinary users do not see the portal entry.

## Required state coverage

Every data screen specifies loading, empty, error, unauthorized/not-found, stale/offline, success, destructive-confirmation, and optimistic/retry states where applicable. Portal mutations require a reason field and confirmation summary.
