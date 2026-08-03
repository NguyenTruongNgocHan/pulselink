import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Brand } from '../../components/ui/Brand'
import { Icon } from '../../components/ui/Icon'
import { routes } from '../../shared/constants/routes'
import { ThemeControl } from '../../theme'

type AuthLayoutProps = {
  mode: 'login' | 'register'
  children: ReactNode
}

const copy = {
  login: {
    title: 'Your circle is waiting.',
    description: 'Pick up where you left off with the people and conversations that matter.',
  },
  register: {
    title: 'A quieter place to stay connected.',
    description: 'Share moments, message friends, and build meaningful connections without the noise.',
  },
} as const

export function AuthLayout({ mode, children }: AuthLayoutProps) {
  const content = copy[mode]

  return (
    <main className="auth-page">
      <header className="auth-topbar">
        <Brand />
        <ThemeControl compact />
      </header>

      <section className="auth-story" aria-labelledby="auth-story-title">
        <div className="auth-orb orb-a" aria-hidden="true" />
        <div className="auth-orb orb-b" aria-hidden="true" />

        <div className="auth-story__inner">
          <div className="auth-story-copy reveal-up">
            <span className="kicker">
              <i aria-hidden="true" />
              Private conversations. Real connections.
            </span>

            <h1 id="auth-story-title">{content.title}</h1>
            <p>{content.description}</p>

            <div className="benefit-row" aria-label="PulseLink benefits">
              <span>Friends-first</span>
              <span>Realtime chat</span>
              <span>Private by default</span>
            </div>
          </div>

          <div className="social-preview reveal-up delay-1" aria-hidden="true">
            <article className="preview-card preview-post">
              <header className="preview-user">
                <span className="avatar avatar-green">SC</span>
                <span>
                  <b>Sarah Chen</b>
                  <small>2 min ago</small>
                </span>
              </header>

              <p>Golden hour and good company.</p>
              <div className="preview-photo"><span>pulselink</span></div>

              <footer className="preview-actions">
                <span><Icon name="heart" size={16} />24</span>
                <span><Icon name="comment" size={16} />8</span>
                <span><Icon name="share" size={16} /></span>
              </footer>
            </article>

            <div className="preview-card preview-message">
              <span className="avatar avatar-violet">EW</span>
              <span>
                <b>Emma Wilson</b>
                <small>That photo made my day ✨</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-panel" aria-label={mode === 'login' ? 'Sign in form' : 'Registration form'}>
        <div className="auth-panel-glow" aria-hidden="true" />
        {children}
      </section>
    </main>
  )
}