import { apiClient } from '@/shared/api/client'

import type { ConversationSummary } from '@/features/conversations/types/conversation.types'
import type { CreateGroupInput, GroupDetails } from '../types/group.types'

type UnknownRecord = Record<string, unknown>

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function mapMember(dto: UnknownRecord) {
  return {
    id: stringValue(dto.id),
    username: stringValue(dto.username),
    displayName: stringValue(dto.displayName ?? dto.display_name, stringValue(dto.username)),
    avatarUrl: (dto.avatarUrl ?? dto.avatar_url ?? dto.avatar_object_key ?? null) as string | null,
    role: stringValue(dto.role) === 'ADMIN' ? ('ADMIN' as const) : ('MEMBER' as const),
    isOnline: dto.isOnline === true || dto.online === true,
  }
}

function mapGroup(dto: UnknownRecord): GroupDetails {
  const members = Array.isArray(dto.members)
    ? dto.members.map((member) => mapMember(member as UnknownRecord))
    : []

  return {
    id: stringValue(dto.id),
    name: stringValue(dto.name, 'Untitled group'),
    avatarUrl: (dto.avatarUrl ?? dto.avatar_url ?? dto.avatar_object_key ?? null) as string | null,
    status: stringValue(dto.status) === 'CLOSED' ? 'CLOSED' : 'ACTIVE',
    createdAt: stringValue(dto.createdAt ?? dto.created_at),
    createdBy: stringValue(dto.createdBy ?? dto.created_by),
    members,
    currentUserRole:
      stringValue(dto.currentUserRole ?? dto.current_user_role) === 'ADMIN'
        ? 'ADMIN'
        : 'MEMBER',
  }
}

export async function createGroup(input: CreateGroupInput): Promise<ConversationSummary> {
  const { data } = await apiClient.post<UnknownRecord>('/api/v1/conversations/groups', input)

  return {
    id: stringValue(data.id),
    type: 'GROUP',
    name: stringValue(data.name, input.name),
    avatarUrl: null,
    status: 'ACTIVE',
    preview: null,
    latestMessageAt: null,
    unreadCount: 0,
    memberCount: input.memberIds.length + 1,
    participants: [],
  }
}

export async function getGroup(groupId: string): Promise<GroupDetails> {
  const { data } = await apiClient.get<UnknownRecord>(`/api/v1/groups/${groupId}`)
  return mapGroup(data)
}

export async function addGroupMembers(groupId: string, memberIds: string[]): Promise<void> {
  await apiClient.post(`/api/v1/groups/${groupId}/members`, { memberIds })
}

export async function removeGroupMember(groupId: string, memberId: string): Promise<void> {
  await apiClient.delete(`/api/v1/groups/${groupId}/members/${memberId}`)
}

export async function transferGroupAdmin(groupId: string, memberId: string): Promise<void> {
  await apiClient.post(`/api/v1/groups/${groupId}/transfer-admin/${memberId}`)
}

export async function leaveGroup(groupId: string): Promise<void> {
  await apiClient.post(`/api/v1/groups/${groupId}/leave`)
}

export async function updateGroup(
  groupId: string,
  input: { name?: string; avatarObjectKey?: string | null },
): Promise<GroupDetails> {
  const { data } = await apiClient.patch<UnknownRecord>(`/api/v1/groups/${groupId}`, input)
  return mapGroup(data)
}
