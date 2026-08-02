import { useEffect, useState } from 'react'

import { Icon } from '@/components/ui/Icon'
import {
  downloadAttachment,
  fetchAttachmentBlob,
  previewAttachment,
} from '@/features/conversations/api/conversationsApi'
import type { MessageAttachment } from '@/features/conversations/types/conversation.types'

interface AuthenticatedAttachmentProps {
  attachment: MessageAttachment
}

function formatFileSize(sizeBytes: number): string {
  if (sizeBytes < 1_024) {
    return `${sizeBytes} B`
  }

  if (sizeBytes < 1_024 * 1_024) {
    return `${Math.max(1, Math.round(sizeBytes / 1_024))} KB`
  }

  return `${(sizeBytes / (1_024 * 1_024)).toFixed(1)} MB`
}

export function AuthenticatedAttachment({
  attachment,
}: AuthenticatedAttachmentProps) {
  const isImage = attachment.mimeType.startsWith('image/')
  const isPreviewable =
    isImage ||
    attachment.mimeType === 'application/pdf' ||
    attachment.mimeType.startsWith('text/')

  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(isImage)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isImage) {
      return
    }

    const controller = new AbortController()
    let objectUrl: string | null = null

    setIsLoading(true)
    setError(null)

    void fetchAttachmentBlob(
      attachment,
      controller.signal,
    )
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob)
        setImageUrl(objectUrl)
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) {
          return
        }

        console.error(
          'Unable to load attachment image',
          requestError,
        )

        setError('Unable to load image.')
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => {
      controller.abort()

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [
    attachment.id,
    attachment.downloadUrl,
    attachment.mimeType,
    isImage,
  ])

  const handlePreview = async () => {
    if (!isPreviewable) {
      return
    }

    setError(null)

    try {
      await previewAttachment(attachment)
    } catch (previewError) {
      console.error(
        'Unable to preview attachment',
        previewError,
      )

      setError('Unable to preview this file.')
    }
  }

  const handleDownload = async () => {
    if (isDownloading) {
      return
    }

    setIsDownloading(true)
    setError(null)

    try {
      await downloadAttachment(attachment)
    } catch (downloadError) {
      console.error(
        'Unable to download attachment',
        downloadError,
      )

      setError('Unable to download this file.')
    } finally {
      setIsDownloading(false)
    }
  }

  if (isImage) {
    return (
      <div className="image-attachment">
        <button
          type="button"
          className="image-attachment__preview"
          onClick={() => void handlePreview()}
          disabled={!imageUrl || isLoading}
          aria-label={`Preview ${attachment.fileName}`}
        >
          {isLoading ? (
            <span className="attachment-loading">
              Loading image…
            </span>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={attachment.fileName}
            />
          ) : (
            <span className="attachment-error">
              <Icon name="image" />
              {error ?? 'Image unavailable'}
            </span>
          )}
        </button>

        <button
          type="button"
          className="attachment-download-button"
          onClick={() => void handleDownload()}
          disabled={isDownloading}
          aria-label={`Download ${attachment.fileName}`}
          title={`Download ${attachment.fileName}`}
        >
          <Icon name="download" size={17} />
        </button>

        {error ? (
          <small className="attachment-error-message">
            {error}
          </small>
        ) : null}
      </div>
    )
  }

  return (
    <div className="file-attachment">
      <button
        type="button"
        className="file-attachment__content"
        onClick={() => void handlePreview()}
        disabled={!isPreviewable}
        aria-label={
          isPreviewable
            ? `Preview ${attachment.fileName}`
            : attachment.fileName
        }
      >
        <span className="file-attachment__icon">
          <Icon name="file" />
        </span>

        <span>
          <b>{attachment.fileName}</b>
          <small>{formatFileSize(attachment.sizeBytes)}</small>
        </span>
      </button>

      <button
        type="button"
        className="attachment-download-button"
        onClick={() => void handleDownload()}
        disabled={isDownloading}
        aria-label={`Download ${attachment.fileName}`}
        title={`Download ${attachment.fileName}`}
      >
        <Icon name="download" size={17} />
      </button>

      {error ? (
        <small className="attachment-error-message">
          {error}
        </small>
      ) : null}
    </div>
  )
}