import { apiClient } from '@/shared/api/client'

import type {
  FriendRequest,
  FriendRequestsResponse,
  Person,
  RelationshipStatus,
} from '../types/people.types'

interface PersonDto {
  id: string
  username: string
  displayName?: string
  display_name?: string
  avatarUrl?: string | null
  avatar_url?: string | null
  avatar_object_key?: string | null
  bio?: string | null
  online?: boolean
  isOnline?: boolean
  relationshipStatus?: RelationshipStatus
  relationship_status?: RelationshipStatus
}

interface FriendRequestDto extends PersonDto {
  requestedAt?: string
  requested_at?: string
  created_at?: string
}

interface FriendRequestsDto {
  received: FriendRequestDto[]
  sent: FriendRequestDto[]
}

function mapPerson(dto: PersonDto): Person {
  return {
    id: dto.id,
    username: dto.username,
    displayName: dto.displayName ?? dto.display_name ?? dto.username,
    avatarUrl: dto.avatarUrl ?? dto.avatar_url ?? dto.avatar_object_key ?? null,
    bio: dto.bio ?? null,
    isOnline: dto.isOnline ?? dto.online ?? false,
    relationshipStatus:
      dto.relationshipStatus ?? dto.relationship_status ?? 'NONE',
  }
}

function mapFriendRequest(
  dto: FriendRequestDto,
  direction: FriendRequest['direction'],
): FriendRequest {
  const person = mapPerson(dto)
  return {
    id: person.id,
    username: person.username,
    displayName: person.displayName,
    avatarUrl: person.avatarUrl,
    requestedAt:
      dto.requestedAt ?? dto.requested_at ?? dto.created_at ?? new Date().toISOString(),
    direction,
  }
}

export async function searchPeople(query: string, signal?: AbortSignal): Promise<Person[]> {
  const { data } = await apiClient.get<PersonDto[]>('/api/v1/people', {
    params: { q: query.trim() },
    signal,
  })

  return data.map(mapPerson)
}

export async function getFriendRequests(): Promise<FriendRequestsResponse> {
  const { data } = await apiClient.get<FriendRequestsDto>('/api/v1/friend-requests')

  return {
    received: data.received.map((item) => mapFriendRequest(item, 'RECEIVED')),
    sent: data.sent.map((item) => mapFriendRequest(item, 'SENT')),
  }
}

export async function sendFriendRequest(personId: string): Promise<void> {
  await apiClient.post(`/api/v1/people/${personId}/friend-request`)
}

export async function acceptFriendRequest(personId: string): Promise<void> {
  await apiClient.post(`/api/v1/people/${personId}/friend-request/accept`)
}

export async function declineFriendRequest(personId: string): Promise<void> {
  await apiClient.delete(`/api/v1/friend-requests/${personId}`)
}

export async function cancelFriendRequest(personId: string): Promise<void> {
  await apiClient.delete(`/api/v1/friend-requests/${personId}`)
}

export async function removeFriend(personId: string): Promise<void> {
  await apiClient.delete(`/api/v1/people/${personId}/friendship`)
}

export async function blockPerson(personId: string): Promise<void> {
  await apiClient.post(`/api/v1/blocks/${personId}`)
}

export async function unblockPerson(personId: string): Promise<void> {
  await apiClient.delete(`/api/v1/blocks/${personId}`)
}
