import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '@/shared/api/queryKeys'

import { getConversations } from '../api/conversationsApi'

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations(),
    queryFn: getConversations,
  })
}
