import { Brand } from '@/components/ui/Brand'

export function LandingFooter() {
  return (
    <footer id="privacy" className="landing-footer">
      <div className="landing-footer__inner shell-width">
        <Brand className="landing-footer__brand" />

        <div className="landing-footer__meta">
          <p>A quieter social network for meaningful conversations.</p>
          <p>© 2026 PulseLink</p>
        </div>
      </div>
    </footer>
  )
}