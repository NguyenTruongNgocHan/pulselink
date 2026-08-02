import { Icon, type IconName } from '@/components/ui/Icon'

const features: ReadonlyArray<{
  icon: IconName
  title: string
  description: string
}> = [
  {
    icon: 'users',
    title: 'Updates from people you chose',
    description:
      'Keep up with friends and the moments they share, without a public feed deciding what deserves your attention.',
  },
  {
    icon: 'message',
    title: 'Conversations that stay connected',
    description:
      'Move naturally from an update into a direct or group conversation, all within the same familiar space.',
  },
  {
    icon: 'lock',
    title: 'A more private way to share',
    description:
      'Clear audience controls and privacy-first defaults help every update reach the people it was meant for.',
  },
]

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="features-section"
      aria-labelledby="features-title"
    >
      <div className="feature-grid shell-width">
        <h2 id="features-title" className="sr-only">
          What makes PulseLink different
        </h2>

        {features.map((feature) => (
          <article key={feature.title}>
            <span className="feature-icon" aria-hidden="true">
              <Icon name={feature.icon} size={20} />
            </span>

            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}