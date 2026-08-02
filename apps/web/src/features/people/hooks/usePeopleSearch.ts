import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createDirectConversation } from '@/features/conversations/api/conversationsApi'
import { queryKeys } from '@/shared/api/queryKeys'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'

import {
  acceptFriendRequest,
  blockPerson,
  declineFriendRequest,
  removeFriend,
  searchPeople,
  sendFriendRequest,
} from '../api/peopleApi'

export function usePeopleSearch(query: string) {
  const debouncedQuery = useDebouncedValue(query.trim(), 300)
  const queryClient = useQueryClient()

  const peopleQuery = useQuery({
    queryKey: queryKeys.people(debouncedQuery),
    queryFn: ({ signal }) => searchPeople(debouncedQuery, signal),
  })

  const refreshPeople = async () => {
    await queryClient.invalidateQueries({ queryKey: ['people'] })
    await queryClient.invalidateQueries({ queryKey: queryKeys.friendRequests })
  }

  const sendRequestMutation = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: refreshPeople,
  })

  const acceptRequestMutation = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: refreshPeople,
  })

  const declineRequestMutation = useMutation({
    mutationFn: declineFriendRequest,
    onSuccess: refreshPeople,
  })

  const removeFriendMutation = useMutation({
    mutationFn: removeFriend,
    onSuccess: refreshPeople,
  })

  const blockMutation = useMutation({
    mutationFn: blockPerson,
    onSuccess: refreshPeople,
  })

  const conversationMutation = useMutation({
    mutationFn: createDirectConversation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  return {
    peopleQuery,
    sendRequestMutation,
    acceptRequestMutation,
    declineRequestMutation,
    removeFriendMutation,
    blockMutation,
    conversationMutation,
  }
}
