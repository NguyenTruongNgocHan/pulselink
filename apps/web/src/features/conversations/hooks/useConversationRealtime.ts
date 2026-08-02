import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { mapMessage } from '@/features/conversations/api/conversationsApi'
import type { ConversationRealtimeEvent } from '@/features/conversations/types/conversation.types'
import { getWebSocketUrl } from '@/shared/api/urls'
import { useAuthStore } from '@/stores/authStore'

type MessageEventType =
  | 'MESSAGE_CREATED'
  | 'MESSAGE_UPDATED'
  | 'MESSAGE_DELETED'
  | 'REACTION_UPDATED'
  | 'READ_UPDATED'

interface UseConversationRealtimeOptions {
  conversationId: string
  onEvent: (event: ConversationRealtimeEvent) => void
}

function normalizeMessageEventType(value: string): MessageEventType {
  switch (value) {
    case 'MESSAGE_UPDATED':
    case 'MESSAGE_DELETED':
    case 'REACTION_UPDATED':
    case 'READ_UPDATED':
      return value
    default:
      return 'MESSAGE_CREATED'
  }
}

function parseEvent(frame: IMessage): ConversationRealtimeEvent | null {
  try {
    const raw = JSON.parse(frame.body) as Record<string, unknown>
    const type = String(raw.type ?? 'MESSAGE_CREATED')

    if (type === 'TYPING') {
      return {
        type: 'TYPING',
        conversationId: String(raw.conversationId ?? raw.conversation_id ?? ''),
        userId: String(raw.userId ?? raw.user_id ?? ''),
        displayName: String(raw.displayName ?? raw.display_name ?? 'Member'),
        typing: raw.typing === true,
      }
    }

    const messageSource = (raw.message ?? raw) as Record<string, unknown>
    return {
      type: normalizeMessageEventType(type),
      conversationId: String(
        raw.conversationId ??
          raw.conversation_id ??
          messageSource.conversationId ??
          messageSource.conversation_id ??
          '',
      ),
      message: mapMessage(messageSource),
    }
  } catch {
    return null
  }
}

export function useConversationRealtime({
  conversationId,
  onEvent,
}: UseConversationRealtimeOptions) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const [isConnected, setIsConnected] = useState(false)
  const clientRef = useRef<Client | null>(null)
  const subscriptionRef = useRef<StompSubscription | null>(null)
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  const brokerURL = useMemo(getWebSocketUrl, [])

  useEffect(() => {
    if (!conversationId || !accessToken) return undefined

    const client = new Client({
      brokerURL,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 2_000,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      onConnect: () => {
        setIsConnected(true)
        subscriptionRef.current = client.subscribe(
          `/topic/conversations/${conversationId}`,
          (frame) => {
            const event = parseEvent(frame)
            if (event) onEventRef.current(event)
          },
        )
      },
      onDisconnect: () => setIsConnected(false),
      onStompError: () => setIsConnected(false),
      onWebSocketClose: () => setIsConnected(false),
    })

    clientRef.current = client
    client.activate()

    return () => {
      subscriptionRef.current?.unsubscribe()
      subscriptionRef.current = null
      clientRef.current = null
      setIsConnected(false)
      void client.deactivate()
    }
  }, [accessToken, brokerURL, conversationId])

  const publishTyping = useCallback(
    (typing: boolean) => {
      const client = clientRef.current
      if (!client?.connected) return

      client.publish({
        destination: `/app/conversations/${conversationId}/typing`,
        body: JSON.stringify({ typing }),
      })
    },
    [conversationId],
  )

  return { isConnected, publishTyping }
}
