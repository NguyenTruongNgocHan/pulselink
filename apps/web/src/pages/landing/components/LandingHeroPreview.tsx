import { Icon } from '@/components/ui/Icon'

export function LandingHeroPreview() {
  return (
    <div
      className="hero-visual reveal-up delay-1"
      aria-label="Preview of PulseLink"
    >
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="app-window">
        <div className="window-bar">
          <span />
          <span />
          <span />
          <em>pulselink</em>
        </div>

        <div className="window-body">
          <aside className="mini-sidebar" aria-label="Preview navigation">
            <div className="mini-logo">
              <img src="/pulselink_logo_1.png" alt="PulseLink" />
            </div>

            <button type="button" className="selected" aria-label="Home">
              <Icon name="home" size={18} />
            </button>

            <button type="button" aria-label="People">
              <Icon name="users" size={18} />
            </button>

            <button type="button" aria-label="Messages">
              <Icon name="message" size={18} />
            </button>

            <button type="button" aria-label="Notifications">
              <Icon name="bell" size={18} />
            </button>
          </aside>

          <div className="mini-feed">
            <div className="mini-top">
              <span>Home</span>
              <div className="mini-search" />
            </div>

            <article className="showcase-post">
              <header>
                <span className="avatar avatar-green">SC</span>

                <span>
                  <b>Sarah Chen</b>
                  <small>2 minutes ago</small>
                </span>

                <i>•••</i>
              </header>

              <p>Took the long way home and found this quiet little corner.</p>

              <div className="showcase-photo">
                <span>after the rain</span>
              </div>

              <footer>
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
              </footer>
            </article>

            <article className="mini-message">
              <span className="avatar avatar-violet">EW</span>

              <span>
                <b>Emma Wilson</b>
                <small>Adding this to our weekend list.</small>
              </span>
            </article>
          </div>
        </div>
      </div>

      <div className="floating-note note-one">
        <span className="status-dot" />

        <span>
          <b>Weekend plans</b>
          <small>3 friends are chatting</small>
        </span>
      </div>

      <div className="floating-note note-two">
        <Icon name="heart" size={18} />

        <span>
          <b>Moments from your circle</b>
          <small>Shared with close friends</small>
        </span>
      </div>
    </div>
  )
}