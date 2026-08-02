import { Fragment, useEffect, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'

import { ConversationHeader } from '@/features/conversations/components/ConversationHeader'
import { MessageBubble } from '@/features/conversations/components/MessageBubble'
import { MessageComposer } from '@/features/conversations/components/MessageComposer'
import { useConversationMessages } from '@/features/conversations/hooks/useConversationMessages'
import type { Message } from '@/features/conversations/types/conversation.types'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { useAuthStore } from '@/stores/authStore'

function getDateKey(value: string): string {
  const date = new Date(value)

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function formatMessageDate(value: string): string {
  const date = new Date(value)

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function groupMessagesByDate(messages: Message[]) {
  return messages.reduce<
    Array<{ key: string; label: string; messages: Message[] }>
  >((groups, message) => {
    const key = getDateKey(message.createdAt)
    const current = groups.at(-1)

    if (current?.key === key) {
      current.messages.push(message)
      return groups
    }

    groups.push({
      key,
      label: formatMessageDate(message.createdAt),
      messages: [message],
    })

    return groups
  }, [])
}

export function ConversationPage() {
  const { conversationId = '' } = useParams()
  const currentUser = useAuthStore((state) => state.user)
  const endRef = useRef<HTMLDivElement>(null)

  const {
    conversationQuery,
    messagesQuery,
    typingNames,
    realtime,
    sendMutation,
    uploadMutation,
    editMutation,
    deleteMutation,
    reactMutation,
    removeReactionMutation,
    saveMutation,
    unsaveMutation,
  } = useConversationMessages(conversationId)

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [messagesQuery.data?.length])

  const groupedMessages = useMemo(
    () => groupMessagesByDate(messagesQuery.data ?? []),
    [messagesQuery.data],
  )

  if (conversationQuery.isLoading || messagesQuery.isLoading) {
    return (
      <section className="conversation-pane conversation-pane--loading">
        <LoadingState rows={8} label="Loading conversation" />
      </section>
    )
  }

  const error = conversationQuery.error ?? messagesQuery.error

  if (error || !conversationQuery.data) {
    return (
      <section className="conversation-pane conversation-pane--error">
        <InlineAlert tone="danger">
          {error
            ? getApiErrorMessage(error)
            : 'Conversation not found.'}
        </InlineAlert>
      </section>
    )
  }

  const conversation = conversationQuery.data
  const messages = messagesQuery.data ?? []

  return (
    <section className="conversation-pane">
      <ConversationHeader
        conversation={conversation}
        isRealtimeConnected={realtime.isConnected}
        typingNames={typingNames.filter(
          (name) => name !== currentUser?.displayName,
        )}
      />

      <div className="message-history" aria-live="polite">
        {messages.length === 0 ? (
          <EmptyState
            compact
            icon="chat"
            title="No messages yet"
            description="The first message can be yours."
          />
        ) : null}

        <div className="message-stream">
          {groupedMessages.map((group) => (
            <Fragment key={group.key}>
              <div className="message-date-separator">
                <span>{group.label}</span>
              </div>

              {group.messages.map((message) => {
                const reactedByMe = message.reactions.find(
                  (reaction) => reaction.reactedByMe,
                )

                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isMine={message.senderId === currentUser?.id}
                    onEdit={(content) =>
                      editMutation.mutateAsync({
                        messageId: message.id,
                        content,
                      })
                    }
                    onDelete={() =>
                      deleteMutation.mutateAsync(message.id)
                    }
                    onReact={(emoji) =>
                      reactedByMe?.emoji === emoji
                        ? removeReactionMutation.mutateAsync(message.id)
                        : reactMutation.mutateAsync({
                            messageId: message.id,
                            emoji,
                          })
                    }
                    onToggleSave={() =>
                      message.savedByMe
                        ? unsaveMutation.mutateAsync(message.id)
                        : saveMutation.mutateAsync(message.id)
                    }
                  />
                )
              })}
            </Fragment>
          ))}
        </div>

        <div ref={endRef} />
      </div>

      <MessageComposer
        disabled={conversation.status === 'CLOSED'}
        isSending={sendMutation.isPending}
        isUploading={uploadMutation.isPending}
        onUpload={(file) => uploadMutation.mutateAsync(file)}
        onTypingChange={realtime.publishTyping}
        onSend={(content, attachmentIds) =>
          sendMutation.mutateAsync({
            content,
            attachmentIds,
            clientMessageId: crypto.randomUUID(),
          })
        }
      />
    </section>
  )
}