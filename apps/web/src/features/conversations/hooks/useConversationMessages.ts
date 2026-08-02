import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'

import { queryKeys } from '@/shared/api/queryKeys'

import {
  deleteMessage,
  editMessage,
  getConversation,
  getMessages,
  markConversationRead,
  reactToMessage,
  removeReaction,
  saveMessage,
  sendMessage,
  unsaveMessage,
  uploadAttachment,
} from '../api/conversationsApi'
import type {
  ConversationRealtimeEvent,
  Message,
  SendMessageInput,
} from '../types/conversation.types'
import { useConversationRealtime } from './useConversationRealtime'

function upsertMessage(messages: Message[], nextMessage: Message): Message[] {
  const existingIndex = messages.findIndex((message) => message.id === nextMessage.id)
  if (existingIndex === -1) return [...messages, nextMessage]

  return messages.map((message) => (message.id === nextMessage.id ? nextMessage : message))
}

export function useConversationMessages(conversationId: string) {
  const queryClient = useQueryClient()
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({})
  const typingTimeouts = useRef<Record<string, number>>({})

  const conversationQuery = useQuery({
    queryKey: queryKeys.conversation(conversationId),
    queryFn: () => getConversation(conversationId),
    enabled: Boolean(conversationId),
  })

  const messagesQuery = useQuery({
    queryKey: queryKeys.messages(conversationId),
    queryFn: () => getMessages(conversationId),
    enabled: Boolean(conversationId),
  })

  const handleRealtimeEvent = useCallback(
    (event: ConversationRealtimeEvent) => {
      if (event.type === 'TYPING') {
        window.clearTimeout(typingTimeouts.current[event.userId])
        setTypingUsers((current) => {
          if (!event.typing) {
            const next = { ...current }
            delete next[event.userId]
            return next
          }
          return { ...current, [event.userId]: event.displayName }
        })

        if (event.typing) {
          typingTimeouts.current[event.userId] = window.setTimeout(() => {
            setTypingUsers((current) => {
              const next = { ...current }
              delete next[event.userId]
              return next
            })
          }, 4_000)
        }
        return
      }

      queryClient.setQueryData<Message[]>(
        queryKeys.messages(conversationId),
        (current = []) => upsertMessage(current, event.message),
      )
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations() })
    },
    [conversationId, queryClient],
  )

  const realtime = useConversationRealtime({
    conversationId,
    onEvent: handleRealtimeEvent,
  })

  useEffect(() => {
    if (!conversationId || !messagesQuery.data) return
    void markConversationRead(conversationId).then(() => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations() })
    })
  }, [conversationId, messagesQuery.data, queryClient])

  useEffect(
    () => () => {
      Object.values(typingTimeouts.current).forEach(window.clearTimeout)
    },
    [],
  )

  const sendMutation = useMutation({
    mutationFn: (input: Omit<SendMessageInput, 'conversationId'>) =>
      sendMessage({ ...input, conversationId }),
    onSuccess: (message) => {
      queryClient.setQueryData<Message[]>(
        queryKeys.messages(conversationId),
        (current = []) => upsertMessage(current, message),
      )
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations() })
    },
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadAttachment(file, conversationId),
  })

  const editMutation = useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      editMessage(messageId, content),
  })

  const deleteMutation = useMutation({ mutationFn: deleteMessage })
  const reactMutation = useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      reactToMessage(messageId, emoji),
  })
  const removeReactionMutation = useMutation({ mutationFn: removeReaction })
  const saveMutation = useMutation({ mutationFn: saveMessage })
  const unsaveMutation = useMutation({ mutationFn: unsaveMessage })

  const invalidateMessages = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.messages(conversationId) })
  }

  useEffect(() => {
    if (
      editMutation.isSuccess ||
      deleteMutation.isSuccess ||
      reactMutation.isSuccess ||
      removeReactionMutation.isSuccess ||
      saveMutation.isSuccess ||
      unsaveMutation.isSuccess
    ) {
      void invalidateMessages()
    }
  }, [
    deleteMutation.isSuccess,
    editMutation.isSuccess,
    reactMutation.isSuccess,
    removeReactionMutation.isSuccess,
    saveMutation.isSuccess,
    unsaveMutation.isSuccess,
  ])

  return {
    conversationQuery,
    messagesQuery,
    typingNames: Object.values(typingUsers),
    realtime,
    sendMutation,
    uploadMutation,
    editMutation,
    deleteMutation,
    reactMutation,
    removeReactionMutation,
    saveMutation,
    unsaveMutation,
  }
}
