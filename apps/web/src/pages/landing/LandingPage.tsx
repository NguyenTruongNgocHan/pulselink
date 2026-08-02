import { Link } from 'react-router-dom'

import { Icon } from '@/components/ui/Icon'
import { routes } from '@/shared/constants/routes'
import { LandingFeatures } from '@/pages/landing/components/LandingFeatures'
import { LandingFooter } from '@/pages/landing/components/LandingFooter'
import { LandingHeader } from '@/pages/landing/components/LandingHeader'
import { LandingHeroCopy } from '@/pages/landing/components/LandingHeroCopy'
import { LandingHeroPreview } from '@/pages/landing/components/LandingHeroPreview'

export function LandingPage() {
  return (
    <main className="landing-page">
      <LandingHeader />

      <section className="hero shell-width" aria-labelledby="landing-title">
        <LandingHeroCopy />
        <LandingHeroPreview />
      </section>

      <LandingFeatures />

      <section id="experience" className="focus-section">
        <div className="focus-section__content shell-width">
          <span className="section-eyebrow">
            <span aria-hidden="true" />
            Designed for calm
            <span aria-hidden="true" />
          </span>

          <h2>
            Everything you need to stay connected.
            <span>Nothing fighting for your attention.</span>
          </h2>

          <Link className="primary-button focus-section__cta" to={routes.register}>
            Create your space
            <Icon name="chevron" size={17} />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </main>
  )
}