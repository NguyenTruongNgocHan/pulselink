import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Brand } from '../components/ui/Brand'
import { Icon } from '../components/ui/Icon'
import { ThemeControl } from '../theme'

type AuthLayoutProps = {
  mode: 'login' | 'register'
  children: ReactNode
}

export function AuthLayout({
  mode,
  children,
}: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <header className="auth-topbar">
        <Link
          to="/"
          aria-label="pulselink home"
        >
          <Brand />
        </Link>

        <ThemeControl compact />
      </header>

      <section className="auth-story">
        <div className="auth-orb orb-a" />
        <div className="auth-orb orb-b" />

        <div className="auth-story-copy reveal-up">
          <span className="kicker">
            <i />
            Private conversations. Real connections.
          </span>

          <h1>
            {mode === 'login'
              ? 'Your circle is waiting.'
              : 'A quieter place to stay connected.'}
          </h1>

          <p>
            {mode === 'login'
              ? 'Pick up where you left off with the people and conversations that matter.'
              : 'Share moments, message friends and build meaningful connections without the noise.'}
          </p>

          <div className="benefit-row">
            <span>Friends-first</span>
            <span>Realtime chat</span>
            <span>Private by default</span>
          </div>
        </div>

        <div
          className="social-preview reveal-up delay-1"
          aria-hidden="true"
        >
          <div className="preview-card preview-post">
            <div className="preview-user">
              <span className="avatar avatar-green">
                SC
              </span>

              <span>
                <b>Sarah Chen</b>
                <small>2 min ago</small>
              </span>
            </div>

            <p>Golden hour and good company.</p>

            <div className="preview-photo">
              <span>pulselink</span>
            </div>

            <div className="preview-actions">
              <span>
                <Icon name="heart" size={16} />
                24
              </span>

              <span>
                <Icon name="comment" size={16} />
                8
              </span>

              <span>
                <Icon name="share" size={16} />
              </span>
            </div>
          </div>

          <div className="preview-card preview-message">
            <span className="avatar avatar-violet">
              EW
            </span>

            <span>
              <b>Emma Wilson</b>
              <small>That photo made my day ✨</small>
            </span>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-glow" />
        {children}
      </section>
    </main>
  )
}