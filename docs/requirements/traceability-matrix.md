# End-to-End Traceability Matrix

Normative mapping: requirement → owning module → API/protocol → durable/ephemeral data → ADR → UI → acceptance test. No implementation slice is complete until its row is satisfied.

| Requirement | Module | API / protocol | Data | Decision | UI | Acceptance test |
|---|---|---|---|---|---|---|
| FR-1 | auth/user | auth-api.md | users | ADR-0004 | UI-U03 | AT-FR-001 |
| FR-2 | auth | auth-api.md | users, refresh_tokens | ADR-0004/0005 | UI-U02 | AT-FR-002 |
| FR-3 | auth | auth-api.md | refresh_tokens | ADR-0005 | UI-U00 | AT-FR-003 |
| FR-4 | auth | auth-api.md | refresh_tokens | ADR-0005 | UI-U16 | AT-FR-004 |
| FR-5 | user | auth-api.md | users | ADR-0002/0003 | UI-U15 | AT-FR-005 |
| FR-6 | friend | friends-api.md | users | ADR-0008 | UI-U06 | AT-FR-006 |
| FR-7 | friend | friends-api.md | friendships,user_blocks | ADR-0008 | UI-U06/U07 | AT-FR-007 |
| FR-8 | friend | friends-api.md | friendships | ADR-0008 | UI-U07 | AT-FR-008 |
| FR-9 | friend | friends-api.md | friendships | ADR-0008 | UI-U06 | AT-FR-009 |
| FR-10 | friend | friends-api.md | user_blocks | ADR-0008 | UI-U06/U07 | AT-FR-010 |
| FR-11 | friend | friends-api.md | user_blocks | ADR-0008 | UI-U06/U07 | AT-FR-011 |
| FR-12 | message | messaging-api.md/realtime-protocol.md | conversations,participants,messages | ADR-0007/0008 | UI-U05 | AT-FR-012 |
| FR-13 | message/attachment | messaging-api.md | message_attachments | ADR-0003 | UI-U05 | AT-FR-013 |
| FR-14 | message | messaging-api.md | messages,participants | ADR-0011 | UI-U05 | AT-FR-014 |
| FR-15 | message | realtime-protocol.md | messages | ADR-0007 | UI-U05 | AT-FR-015 |
| FR-16 | message/group | messaging-api.md | conversations,participants | ADR-0009 | UI-U08 | AT-FR-016 |
| FR-17 | message/group | realtime-protocol.md | messages | ADR-0007/0009 | UI-U05 | AT-FR-017 |
| FR-18 | message/group | messaging-api.md | participants | ADR-0009 | UI-U10 | AT-FR-018 |
| FR-19 | message/group | messaging-api.md | participants | ADR-0009 | UI-U09 | AT-FR-019 |
| FR-20 | message/group | messaging-api.md/realtime-protocol.md | participants | ADR-0009 | UI-U10 | AT-FR-020 |
| FR-21 | message/group | messaging-api.md/realtime-protocol.md | participants | ADR-0009 | UI-U09 | AT-FR-021 |
| FR-22 | presence | realtime-protocol.md | Redis | ADR-0014 | UI-U06 | AT-FR-022 |
| FR-23 | presence | realtime-protocol.md | none (ephemeral relay) | ADR-0014 | UI-U05 | AT-FR-023 |
| FR-24 | message | realtime-protocol.md | message_read_receipts | ADR-0010 | UI-U05 | AT-FR-024 |
| FR-25 | message | messaging-api.md/realtime-protocol.md | messages | ADR-0012 | UI-U05 | AT-FR-025 |
| FR-26 | message | messaging-api.md/realtime-protocol.md | messages | ADR-0012 | UI-U05 | AT-FR-026 |
| FR-27 | message | messaging-api.md/realtime-protocol.md | message_reactions | ADR-0013 | UI-U05 | AT-FR-027 |
| FR-28 | search | search-api.md | messages,participants | ADR-0015 | UI-U11 | AT-FR-028 |
| FR-29 | message | messaging-api.md | participants,messages | ADR-0011 | UI-U04 | AT-FR-029 |
| FR-30 | message | realtime-protocol.md | participants,read_receipts | ADR-0011 | UI-U04/U05 | AT-FR-030 |
| FR-31 | push | push-api.md | push_subscriptions,messages | ADR-0016 | UI-U16 | AT-FR-031 |
| FR-32 | report | reports-api.md | reports,report_evidence | ADR-0022 | UI-U12 | AT-FR-032 |
| FR-33 | report | reports-api.md | report_evidence | ADR-0022 | UI-U12 | AT-FR-033 |
| FR-34 | report | reports-api.md | reports | ADR-0022 | UI-U12 | AT-FR-034 |
| FR-35 | report | reports-api.md | reports | ADR-0022 | UI-U13 | AT-FR-035 |
| FR-36 | report | reports-api.md | report_comments | ADR-0022 | UI-U13 | AT-FR-036 |
| FR-37 | notification | notifications-api.md | notifications | ADR-0025 | UI-U14 | AT-FR-037 |
| FR-38 | notification | notifications-api.md | notifications | ADR-0025 | UI-U14 | AT-FR-038 |
| FR-39 | notification | notifications-api.md | notifications | ADR-0025 | UI-U14 | AT-FR-039 |
| FR-40 | admin/auth | admin-api.md | users | ADR-0020/0021 | UI-A01 | AT-FR-040 |
| FR-41 | admin | admin-api.md | users,conversations,messages,reports | ADR-0020 | UI-A02 | AT-FR-041 |
| FR-42 | admin/user | admin-api.md | users | ADR-0021 | UI-A03 | AT-FR-042 |
| FR-43 | admin/user | admin-api.md | users,refresh_tokens,reports,audit | ADR-0021/0023 | UI-A04 | AT-FR-043 |
| FR-44 | admin/user | admin-api.md | users,refresh_tokens,notifications,audit | ADR-0021/0023/0024 | UI-A04 | AT-FR-044 |
| FR-45 | admin/user | admin-api.md | users,refresh_tokens,notifications,audit | ADR-0021/0023/0024 | UI-A04 | AT-FR-045 |
| FR-46 | admin/user | admin-api.md | refresh_tokens,audit | ADR-0021/0023 | UI-A04 | AT-FR-046 |
| FR-47 | admin/user | admin-api.md | users,notifications,audit | ADR-0023/0025 | UI-A04 | AT-FR-047 |
| FR-48 | admin/user | admin-api.md | users,audit | ADR-0021/0023 | UI-A04 | AT-FR-048 |
| FR-49 | admin/report | admin-api.md | reports,audit | ADR-0022/0023 | UI-A05/A06 | AT-FR-049 |
| FR-50 | admin/report | admin-api.md | report_evidence,messages,audit | ADR-0022/0023 | UI-A06 | AT-FR-050 |
| FR-51 | admin/report | admin-api.md | reports,users,messages,conversations,notifications,audit | ADR-0021/0022/0023/0025 | UI-A06 | AT-FR-051 |
| FR-52 | admin/message | admin-api.md | messages,audit | ADR-0012/0023 | UI-A06 | AT-FR-052 |
| FR-53 | admin/group | admin-api.md | conversations,participants | ADR-0020/0022 | UI-A07/A08 | AT-FR-053 |
| FR-54 | admin/group | admin-api.md | conversations,notifications,audit | ADR-0021/0023/0025 | UI-A08 | AT-FR-054 |
| FR-55 | admin/audit | admin-api.md | admin_audit_logs | ADR-0023 | UI-A09 | AT-FR-055 |
| FR-56 | admin/audit | admin-api.md | admin_audit_logs | ADR-0023 | UI-A00 | AT-FR-056 |

## Coverage
- Functional requirements: **56**
- API/protocol mappings: **56/56**
- Data mappings: **56/56**
- UI mappings: **56/56**
- Acceptance-test identifiers: **56/56**
- Unmapped/duplicate IDs: **0**
