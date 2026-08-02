import { Link } from 'react-router-dom'

import { Icon } from '@/components/ui/Icon'
import { routes } from '@/shared/constants/routes'

export function LandingHeroCopy() {
  return (
    <div className="hero-copy reveal-up">
      <span className="kicker">
        <i aria-hidden="true" />
        Made for closer circles
      </span>

      <h1 id="landing-title">
        Share what matters with the people who matter.
      </h1>

      <p>
        PulseLink brings updates and conversations into one private space,
        so your circle can stay connected without the noise of a public feed.
      </p>

      <div className="hero-actions">
        <Link className="primary-button" to={routes.register}>
          Join PulseLink
          <Icon name="chevron" size={18} />
        </Link>

        <a className="secondary-button" href="#features">
          Discover PulseLink
        </a>
      </div>

      <div className="trust-row" aria-label="PulseLink highlights">
        <span>Your circle, not the crowd</span>
        <span>Privacy built in</span>
        <span>Conversations in real time</span>
      </div>
    </div>
  )
}