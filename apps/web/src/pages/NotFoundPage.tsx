import { Link } from 'react-router-dom'

import { Brand } from '../components/ui/Brand'
import { Icon } from '../components/ui/Icon'
import { routes } from '../shared/constants/routes'
import { ThemeControl } from '../theme'

export function NotFoundPage() {
  return (
    <main className="not-found">
      <header className="not-found__header shell-width">
        <Link to={routes.landing} aria-label="PulseLink home">
          <Brand />
        </Link>
        <ThemeControl compact />
      </header>

      <section className="not-found__content" aria-labelledby="not-found-title">
        <span className="error-code" aria-hidden="true">404</span>
        <span className="kicker">Page not found</span>
        <h1 id="not-found-title">This page slipped out of the circle.</h1>
        <p>The link may be outdated, or the page may have moved somewhere new.</p>

        <div className="not-found__actions">
          <Link className="primary-button" to={routes.landing}>
            Return home
            <Icon name="chevron" size={17} />
          </Link>
          <Link className="secondary-button" to={routes.login}>Sign in</Link>
        </div>
      </section>
    </main>
  )
}