import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/shared/api/queryKeys'

import { getSavedMessages, removeSavedMessage } from '../api/savedMessagesApi'

export function useSavedMessages() {
  const queryClient = useQueryClient()
  const savedMessagesQuery = useQuery({
    queryKey: queryKeys.savedMessages,
    queryFn: getSavedMessages,
  })

  const removeMutation = useMutation({
    mutationFn: removeSavedMessage,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.savedMessages })
    },
  })

  return { savedMessagesQuery, removeMutation }
}
