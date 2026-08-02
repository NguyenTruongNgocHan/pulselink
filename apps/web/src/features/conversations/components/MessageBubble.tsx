import { useState } from 'react'

import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
import type { Message } from '@/features/conversations/types/conversation.types'
import { getInitials } from '@/shared/utils/avatar'
import { formatMessageTime } from '@/shared/utils/date'

interface MessageBubbleProps {
  message: Message
  isMine: boolean
  onEdit: (content: string) => Promise<unknown>
  onDelete: () => Promise<unknown>
  onReact: (emoji: string) => Promise<unknown>
  onToggleSave: () => Promise<unknown>
}

const quickReactions = ['❤️', '👍', '😂', '🎉', '😮']

export function MessageBubble({
  message,
  isMine,
  onEdit,
  onDelete,
  onReact,
  onToggleSave,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(message.content ?? '')
  const isDeleted = Boolean(message.deletedAt || message.moderatedAt)

  const submitEdit = async () => {
    const nextContent = draft.trim()

    if (!nextContent || nextContent === message.content) {
      setIsEditing(false)
      return
    }

    await onEdit(nextContent)
    setIsEditing(false)
  }

  const deliveryLabel =
    isMine && message.receipts.length > 0 ? (
      <span
        className="message-delivery message-delivery--seen"
        title={`Seen by ${message.receipts
          .map((receipt) => receipt.displayName)
          .join(', ')}`}
      >
        <span aria-hidden="true">✓✓</span>
        Seen
      </span>
    ) : isMine ? (
      <span className="message-delivery" title="Sent">
        <span aria-hidden="true">✓</span>
        Sent
      </span>
    ) : null

  return (
    <article
      className={`bubble-row ${isMine ? 'outgoing' : 'incoming'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isMine ? (
        <Avatar
          initials={getInitials(message.senderName)}
          src={message.senderAvatarUrl}
          alt=""
          tone="violet"
          size="sm"
        />
      ) : null}

      <div className="message-cluster">
        {!isMine ? (
          <strong className="message-author">{message.senderName}</strong>
        ) : null}

        <div
          className={[
            'message-bubble',
            isDeleted ? 'message-bubble--deleted' : '',
            isEditing ? 'message-bubble--editing' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {isEditing ? (
            <div className="message-edit-form">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                maxLength={4_000}
                autoFocus
              />

              <div>
                <button type="button" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="button" onClick={() => void submitEdit()}>
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p>
              {isDeleted
                ? message.moderatedAt
                  ? 'Removed by moderation'
                  : 'Message deleted'
                : message.content}
            </p>
          )}

          {!isDeleted && message.attachments.length > 0 ? (
            <div className="message-attachments">
              {message.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={
                    attachment.mimeType.startsWith('image/')
                      ? 'image-attachment'
                      : 'file-attachment'
                  }
                >
                  {attachment.mimeType.startsWith('image/') ? (
                    <img
                      src={attachment.downloadUrl}
                      alt={attachment.fileName}
                    />
                  ) : (
                    <>
                      <span className="file-attachment__icon">
                        <Icon name="file" />
                      </span>
                      <span>
                        <b>{attachment.fileName}</b>
                        <small>
                          {Math.max(
                            1,
                            Math.round(attachment.sizeBytes / 1024),
                          )}{' '}
                          KB
                        </small>
                      </span>
                      <Icon name="download" size={17} />
                    </>
                  )}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div className="message-meta">
          <time>{formatMessageTime(message.createdAt)}</time>
          {message.editedAt ? <span>Edited</span> : null}
          {deliveryLabel}
        </div>

        {!isDeleted && message.reactions.length > 0 ? (
          <div className="reaction-summary">
            {message.reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                type="button"
                className={reaction.reactedByMe ? 'active' : undefined}
                onClick={() => void onReact(reaction.emoji)}
              >
                {reaction.emoji} {reaction.count}
              </button>
            ))}
          </div>
        ) : null}

        {showActions && !isDeleted ? (
          <div
            className={`message-actions ${
              isMine ? 'message-actions--mine' : ''
            }`}
          >
            {quickReactions.map((emoji) => (
              <button
                type="button"
                key={emoji}
                aria-label={`React ${emoji}`}
                onClick={() => void onReact(emoji)}
              >
                {emoji}
              </button>
            ))}

            <button
              type="button"
              aria-label={
                message.savedByMe
                  ? 'Remove from saved messages'
                  : 'Save message'
              }
              onClick={() => void onToggleSave()}
            >
              <Icon name="bookmark" size={16} />
            </button>

            {isMine ? (
              <>
                <button
                  type="button"
                  aria-label="Edit message"
                  onClick={() => setIsEditing(true)}
                >
                  <Icon name="edit" size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Delete message"
                  onClick={() => void onDelete()}
                >
                  <Icon name="trash" size={16} />
                </button>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )
}