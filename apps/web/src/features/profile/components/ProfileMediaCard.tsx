import { useEffect, useState } from 'react'

import { Icon } from '@/components/ui/Icon'
import type { ProfileMedia } from '@/features/profile/types/profile.types'
import { apiClient } from '@/shared/api/client'

interface ProfileMediaCardProps {
  media: ProfileMedia[]
}

interface AuthenticatedImageProps {
  item: ProfileMedia
}

function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

function getFileLabel(mimeType: string): string {
  const [, subtype = 'file'] = mimeType.split('/')

  return subtype
    .replaceAll('.', ' ')
    .replaceAll('-', ' ')
    .toUpperCase()
}

function normalizeFileUrl(url: string): string {
  if (!url) {
    return ''
  }

  try {
    const parsedUrl = new URL(url, window.location.origin)

    return `${parsedUrl.pathname}${parsedUrl.search}`
  } catch {
    return url
  }
}

async function fetchPrivateFile(
  item: ProfileMedia,
  signal?: AbortSignal,
): Promise<Blob> {
  const response = await apiClient.get<Blob>(
    normalizeFileUrl(item.url),
    {
      responseType: 'blob',
      signal,
    },
  )

  return response.data
}

async function previewPrivateFile(item: ProfileMedia): Promise<void> {
  /*
   * Mở tab trống ngay trong click event để tránh popup blocker.
   * Sau đó mới tải Blob có Authorization.
   */
  const previewWindow = window.open('', '_blank')

  if (!previewWindow) {
    throw new Error('The browser blocked the preview window.')
  }

  try {
    previewWindow.document.title = item.fileName
    previewWindow.document.body.innerHTML =
      '<p style="font-family: sans-serif; padding: 24px;">Loading file…</p>'

    const blob = await fetchPrivateFile(item)
    const objectUrl = URL.createObjectURL(blob)

    previewWindow.location.href = objectUrl

    window.setTimeout(() => {
      URL.revokeObjectURL(objectUrl)
    }, 5 * 60 * 1_000)
  } catch (error) {
    previewWindow.close()
    throw error
  }
}

async function downloadPrivateFile(item: ProfileMedia): Promise<void> {
  const blob = await fetchPrivateFile(item)
  const objectUrl = URL.createObjectURL(blob)

  const anchor = document.createElement('a')

  anchor.href = objectUrl
  anchor.download = item.fileName || 'download'
  anchor.style.display = 'none'

  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl)
  }, 1_000)
}

function AuthenticatedImage({
  item,
}: AuthenticatedImageProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    let generatedUrl: string | null = null

    setIsLoading(true)
    setError(null)
    setObjectUrl(null)

    void fetchPrivateFile(item, controller.signal)
      .then((blob) => {
        generatedUrl = URL.createObjectURL(blob)
        setObjectUrl(generatedUrl)
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) {
          return
        }

        console.error(
          `Unable to load profile media ${item.id}`,
          requestError,
        )

        setError('Image unavailable')
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => {
      controller.abort()

      if (generatedUrl) {
        URL.revokeObjectURL(generatedUrl)
      }
    }
  }, [item.id, item.url])

  const handlePreview = async () => {
    setError(null)

    try {
      await previewPrivateFile(item)
    } catch (previewError) {
      console.error(
        `Unable to preview profile media ${item.id}`,
        previewError,
      )

      setError('Unable to preview image')
    }
  }

  const handleDownload = async () => {
    if (isDownloading) {
      return
    }

    setIsDownloading(true)
    setError(null)

    try {
      await downloadPrivateFile(item)
    } catch (downloadError) {
      console.error(
        `Unable to download profile media ${item.id}`,
        downloadError,
      )

      setError('Unable to download image')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <article
      className="profile-media-v2__image-item"
      title={item.fileName}
    >
      <button
        type="button"
        className="profile-media-v2__image-preview"
        onClick={() => void handlePreview()}
        disabled={!objectUrl || isLoading}
        aria-label={`Preview ${item.fileName}`}
      >
        {objectUrl ? (
          <img
            src={objectUrl}
            alt={item.fileName}
            loading="lazy"
          />
        ) : (
          <span className="profile-media-v2__image-state">
            <Icon name="file" size={22} />

            <small>
              {isLoading
                ? 'Loading…'
                : error ?? 'Image unavailable'}
            </small>
          </span>
        )}

        <span className="profile-media-v2__image-name">
          {item.fileName}
        </span>
      </button>

      <button
        type="button"
        className="profile-media-v2__image-download"
        onClick={() => void handleDownload()}
        disabled={isDownloading}
        aria-label={`Download ${item.fileName}`}
        title={`Download ${item.fileName}`}
      >
        <Icon
          name={isDownloading ? 'loader' : 'download'}
          size={16}
          className={isDownloading ? 'icon-spin' : undefined}
        />
      </button>
    </article>
  )
}

interface AuthenticatedFileRowProps {
  item: ProfileMedia
}

function AuthenticatedFileRow({
  item,
}: AuthenticatedFileRowProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canPreview =
    item.mimeType === 'application/pdf' ||
    item.mimeType.startsWith('text/') ||
    item.mimeType.startsWith('image/')

  const handlePreview = async () => {
    if (!canPreview) {
      await handleDownload()
      return
    }

    setError(null)

    try {
      await previewPrivateFile(item)
    } catch (previewError) {
      console.error(
        `Unable to preview profile file ${item.id}`,
        previewError,
      )

      setError('Unable to preview file')
    }
  }

  const handleDownload = async () => {
    if (isDownloading) {
      return
    }

    setIsDownloading(true)
    setError(null)

    try {
      await downloadPrivateFile(item)
    } catch (downloadError) {
      console.error(
        `Unable to download profile file ${item.id}`,
        downloadError,
      )

      setError('Unable to download file')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <article className="profile-media-v2__file-row">
      <button
        type="button"
        className="profile-media-v2__file-main"
        onClick={() => void handlePreview()}
        aria-label={
          canPreview
            ? `Preview ${item.fileName}`
            : `Download ${item.fileName}`
        }
      >
        <span className="profile-media-v2__file-icon">
          <Icon name="file" size={20} />
        </span>

        <span className="profile-media-v2__file-copy">
          <strong>{item.fileName}</strong>

          <small>
            {error ?? getFileLabel(item.mimeType)}
          </small>
        </span>

        <Icon name="chevron" size={16} />
      </button>

      <button
        type="button"
        className="profile-media-v2__file-download"
        onClick={() => void handleDownload()}
        disabled={isDownloading}
        aria-label={`Download ${item.fileName}`}
        title={`Download ${item.fileName}`}
      >
        <Icon
          name={isDownloading ? 'loader' : 'download'}
          size={17}
          className={isDownloading ? 'icon-spin' : undefined}
        />
      </button>
    </article>
  )
}

export function ProfileMediaCard({
  media,
}: ProfileMediaCardProps) {
  const images = media.filter((item) =>
    isImage(item.mimeType),
  )

  const files = media.filter(
    (item) => !isImage(item.mimeType),
  )

  return (
    <section className="profile-card-v2 profile-media-v2">
      <header className="profile-card-v2__header">
        <div>
          <span className="profile-card-v2__icon">
            <Icon name="file" size={17} />
          </span>

          <span>
            <h2>Recent media</h2>
            <p>Images and files you recently shared.</p>
          </span>
        </div>

        <span className="profile-card-v2__count">
          {media.length}
        </span>
      </header>

      {media.length === 0 ? (
        <div className="profile-card-v2__empty">
          <span>
            <Icon name="file" size={20} />
          </span>

          <strong>No shared media yet</strong>

          <p>
            Files and images you share will appear here.
          </p>
        </div>
      ) : (
        <div className="profile-media-v2__body">
          {images.length > 0 ? (
            <section className="profile-media-v2__section">
              <header>
                <strong>Images</strong>
                <small>{images.length}</small>
              </header>

              <div className="profile-media-v2__image-grid">
                {images.map((item) => (
                  <AuthenticatedImage
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {files.length > 0 ? (
            <section className="profile-media-v2__section">
              <header>
                <strong>Files</strong>
                <small>{files.length}</small>
              </header>

              <div className="profile-media-v2__file-list">
                {files.map((item) => (
                  <AuthenticatedFileRow
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </section>
  )
}