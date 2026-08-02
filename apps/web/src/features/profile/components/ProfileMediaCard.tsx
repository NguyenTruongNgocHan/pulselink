import { Icon } from '@/components/ui/Icon'
import type { ProfileMedia } from '@/features/profile/types/profile.types'

interface ProfileMediaCardProps {
  media: ProfileMedia[]
}

export function ProfileMediaCard({ media }: ProfileMediaCardProps) {
  return (
    <section className="profile-section-card">
      <header>
        <div>
          <h2>Recent media</h2>
          <p>Files and images you recently shared.</p>
        </div>
      </header>

      {media.length > 0 ? (
        <div className="profile-media-grid">
          {media.map((item) => (
            <a key={item.id} href={item.url} target="_blank" rel="noreferrer">
              {item.mimeType.startsWith('image/') ? (
                <img src={item.url} alt={item.fileName} loading="lazy" />
              ) : (
                <span>
                  <Icon name="file" />
                  {item.fileName}
                </span>
              )}
            </a>
          ))}
        </div>
      ) : (
        <p className="muted-copy">No shared media yet.</p>
      )}
    </section>
  )
}
