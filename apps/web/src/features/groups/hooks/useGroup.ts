import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/shared/api/queryKeys'

import {
  addGroupMembers,
  getGroup,
  leaveGroup,
  removeGroupMember,
  transferGroupAdmin,
  updateGroup,
} from '../api/groupsApi'

export function useGroup(groupId: string) {
  const queryClient = useQueryClient()

  const groupQuery = useQuery({
    queryKey: queryKeys.group(groupId),
    queryFn: () => getGroup(groupId),
    enabled: Boolean(groupId),
  })

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.conversation(groupId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations() }),
    ])
  }

  const addMembersMutation = useMutation({
    mutationFn: (memberIds: string[]) => addGroupMembers(groupId, memberIds),
    onSuccess: refresh,
  })

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => removeGroupMember(groupId, memberId),
    onSuccess: refresh,
  })

  const transferAdminMutation = useMutation({
    mutationFn: (memberId: string) => transferGroupAdmin(groupId, memberId),
    onSuccess: refresh,
  })

  const leaveMutation = useMutation({
    mutationFn: () => leaveGroup(groupId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.conversations() })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (input: { name?: string; avatarObjectKey?: string | null }) =>
      updateGroup(groupId, input),
    onSuccess: refresh,
  })

  return {
    groupQuery,
    addMembersMutation,
    removeMemberMutation,
    transferAdminMutation,
    leaveMutation,
    updateMutation,
  }
}
