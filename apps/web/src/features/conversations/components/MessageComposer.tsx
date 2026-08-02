import type { FormEvent } from 'react'
import { useRef, useState } from 'react'

import { Icon } from '@/components/ui/Icon'
import type { MessageAttachment } from '@/features/conversations/types/conversation.types'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { getApiErrorMessage } from '@/shared/utils/apiError'

interface MessageComposerProps {
  disabled?: boolean
  isSending: boolean
  isUploading: boolean
  onSend: (content: string, attachmentIds: string[]) => Promise<unknown>
  onUpload: (file: File) => Promise<MessageAttachment>
  onTypingChange: (typing: boolean) => void
}

export function MessageComposer({
  disabled = false,
  isSending,
  isUploading,
  onSend,
  onUpload,
  onTypingChange,
}: MessageComposerProps) {
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState<MessageAttachment[]>([])
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeout = useRef<number | null>(null)

  const handleContentChange = (value: string) => {
    setContent(value)
    onTypingChange(Boolean(value.trim()))

    if (typingTimeout.current) {
      window.clearTimeout(typingTimeout.current)
    }

    typingTimeout.current = window.setTimeout(
      () => onTypingChange(false),
      1_500,
    )
  }

  const handleFile = async (file?: File) => {
    if (!file) return

    setError(null)

    try {
      const uploaded = await onUpload(file)
      setAttachments((current) => [...current, uploaded])
    } catch (uploadError) {
      setError(getApiErrorMessage(uploadError))
    } finally {
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (
      (!content.trim() && attachments.length === 0) ||
      disabled ||
      isSending
    ) {
      return
    }

    setError(null)

    try {
      await onSend(
        content.trim(),
        attachments.map((attachment) => attachment.id),
      )
      setContent('')
      setAttachments([])
      onTypingChange(false)
    } catch (sendError) {
      setError(getApiErrorMessage(sendError))
    }
  }

  return (
    <div className="composer-shell">
      {error ? <InlineAlert tone="danger">{error}</InlineAlert> : null}

      {attachments.length > 0 ? (
        <div className="composer-attachments">
          {attachments.map((attachment) => (
            <span key={attachment.id}>
              <Icon
                name={
                  attachment.mimeType.startsWith('image/') ? 'image' : 'file'
                }
                size={16}
              />
              <span>{attachment.fileName}</span>
              <button
                type="button"
                aria-label={`Remove ${attachment.fileName}`}
                onClick={() =>
                  setAttachments((current) =>
                    current.filter((item) => item.id !== attachment.id),
                  )
                }
              >
                <Icon name="x" size={14} />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <form className="composer-bar" onSubmit={handleSubmit}>
        <label
          className={`composer-file-button ${
            isUploading ? 'is-busy' : ''
          }`}
          aria-label={isUploading ? 'Uploading attachment' : 'Attach a file'}
        >
          <Icon name={isUploading ? 'loader' : 'paperclip'} />
          <input
            ref={inputRef}
            className="composer-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain,.doc,.docx"
            disabled={disabled || isUploading || attachments.length >= 4}
            onChange={(event) =>
              void handleFile(event.target.files?.[0])
            }
          />
        </label>

        <div className="composer-input">
          <input
            value={content}
            onChange={(event) => handleContentChange(event.target.value)}
            placeholder={
              disabled ? 'This conversation is closed' : 'Write a message…'
            }
            maxLength={4_000}
            disabled={disabled}
            aria-label="Message"
          />

          {content.length > 0 ? (
            <span className="composer-count">{content.length}/4000</span>
          ) : null}
        </div>

        <button
          type="submit"
          className={`composer-send ${isSending ? 'is-busy' : ''}`}
          disabled={
            disabled ||
            isSending ||
            isUploading ||
            (!content.trim() && attachments.length === 0)
          }
          aria-label="Send message"
        >
          <Icon name={isSending ? 'loader' : 'send'} />
        </button>
      </form>
    </div>
  )
}