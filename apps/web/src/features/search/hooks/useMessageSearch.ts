import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '@/shared/api/queryKeys'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'

import { searchMessages } from '../api/searchApi'

export function useMessageSearch(query: string, conversationId?: string) {
  const debouncedQuery = useDebouncedValue(query.trim(), 350)

  return useQuery({
    queryKey: queryKeys.messageSearch(debouncedQuery, conversationId),
    queryFn: () => searchMessages(debouncedQuery, conversationId),
    enabled: debouncedQuery.length >= 2,
  })
}
