import { Link } from 'react-router-dom'
import { Brand, Icon } from '../components'
import { ThemeControl } from '../theme'

export function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-nav shell-width">
        <Brand />
        <nav aria-label="Landing navigation">
          <a href="#features">Features</a>
          <a href="#experience">Experience</a>
          <a href="#privacy">Privacy</a>
        </nav>
        <div className="landing-actions">
          <ThemeControl compact />
          <Link className="nav-link" to="/login">Sign in</Link>
          <Link className="primary-button compact-button" to="/register">Get started</Link>
        </div>
      </header>

      <section className="hero shell-width">
        <div className="hero-copy reveal-up">
          <span className="kicker"><i /> Your people. Your space.</span>
          <h1>Stay close without all the noise.</h1>
          <p>pulselink is a private social space for meaningful updates, focused conversations, and the people you actually care about.</p>
          <div className="hero-actions">
            <Link className="primary-button" to="/register">Create your space <Icon name="chevron" size={18} /></Link>
            <Link className="secondary-button" to="/login">Explore the experience</Link>
          </div>
          <div className="trust-row"><span>Friends-first</span><span>Private by default</span><span>Realtime messaging</span></div>
        </div>

        <div className="hero-visual reveal-up delay-1" aria-label="Preview of pulselink application">
          <div className="ambient ambient-one" /><div className="ambient ambient-two" />
          <div className="app-window">
            <div className="window-bar"><span/><span/><span/><em>pulselink</em></div>
            <div className="window-body">
              <aside className="mini-sidebar"><div className="mini-logo">p</div><button className="selected"><Icon name="home" size={18}/></button><button><Icon name="users" size={18}/></button><button><Icon name="message" size={18}/></button><button><Icon name="bell" size={18}/></button></aside>
              <div className="mini-feed">
                <div className="mini-top"><span>Home</span><div className="mini-search" /></div>
                <article className="showcase-post">
                  <header><span className="avatar avatar-green">SC</span><span><b>Sarah Chen</b><small>2 minutes ago</small></span><i>•••</i></header>
                  <p>Found a quiet corner of the city today.</p>
                  <div className="showcase-photo"><span>slow mornings</span></div>
                  <footer><span><Icon name="heart" size={16}/> 24</span><span><Icon name="comment" size={16}/> 8</span><span><Icon name="share" size={16}/></span></footer>
                </article>
                <article className="mini-message"><span className="avatar avatar-violet">EW</span><span><b>Emma Wilson</b><small>That looks peaceful ✨</small></span></article>
              </div>
            </div>
          </div>
          <div className="floating-note note-one"><span className="status-dot"/><span><b>Michael is online</b><small>Open conversation</small></span></div>
          <div className="floating-note note-two"><Icon name="heart" size={18}/><span><b>12 new reactions</b><small>from your closest friends</small></span></div>
        </div>
      </section>

      <section id="features" className="feature-grid shell-width">
        <article><span className="feature-icon"><Icon name="users"/></span><h2>A feed that feels personal</h2><p>No strangers, no viral clutter. Just updates from the people in your circle.</p></article>
        <article><span className="feature-icon"><Icon name="message"/></span><h2>Conversation without friction</h2><p>Move naturally from a post to a direct or group conversation in real time.</p></article>
        <article><span className="feature-icon"><Icon name="lock"/></span><h2>Control comes standard</h2><p>Privacy-first defaults, clear audience controls, and no attention-hacking patterns.</p></article>
      </section>

      <section id="experience" className="focus-section shell-width">
        <span className="kicker">Designed for calm</span><h2>Everything you need to stay connected.<br/>Nothing fighting for your attention.</h2>
      </section>
      <footer id="privacy" className="landing-footer shell-width"><Brand/><p>© 2026 pulselink. Built for meaningful connections.</p><div><a href="#privacy">Privacy</a><a href="#terms">Terms</a></div></footer>
    </main>
  )
}
