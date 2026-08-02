import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/shared/api/queryKeys'

import {
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  getFriendRequests,
} from '../api/peopleApi'

export function useFriendRequests() {
  const queryClient = useQueryClient()

  const requestsQuery = useQuery({
    queryKey: queryKeys.friendRequests,
    queryFn: getFriendRequests,
  })

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.friendRequests }),
      queryClient.invalidateQueries({ queryKey: ['people'] }),
    ])
  }

  const acceptMutation = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: refresh,
  })

  const declineMutation = useMutation({
    mutationFn: declineFriendRequest,
    onSuccess: refresh,
  })

  const cancelMutation = useMutation({
    mutationFn: cancelFriendRequest,
    onSuccess: refresh,
  })

  return {
    requestsQuery,
    acceptMutation,
    declineMutation,
    cancelMutation,
  }
}
