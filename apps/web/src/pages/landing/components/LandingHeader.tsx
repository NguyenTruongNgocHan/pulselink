import { Link } from 'react-router-dom'

import { Brand } from '@/components/ui/Brand'
import { routes } from '@/shared/constants/routes'
import { ThemeControl } from '@/theme'

export function LandingHeader() {
  return (
    <header className="landing-header">
      <div className="landing-nav shell-width">
        <Brand className="landing-brand" />

        <nav className="landing-navigation" aria-label="Landing navigation">
          <a href="#features">Features</a>
          <a href="#experience">Experience</a>
          <a href="#privacy">Privacy</a>
        </nav>

        <div className="landing-actions">
          <ThemeControl compact />

          <Link className="landing-sign-in" to={routes.login}>
            Sign in
          </Link>

          <Link
            className="primary-button compact-button landing-get-started"
            to={routes.register}
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}