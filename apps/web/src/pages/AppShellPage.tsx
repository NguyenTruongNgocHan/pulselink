import { Brand, Icon, type IconName } from '../components'
import { ThemeControl } from '../theme'

const nav: Array<[IconName, string, boolean?]> = [['home','Home',true],['users','Friends'],['message','Messages'],['bell','Notifications'],['user','Profile']]
const contacts = [['EW','Emma Wilson','Online','violet'],['MT','Michael Torres','12 min','blue'],['AJ','Alex Johnson','1 hr','orange'],['JL','Jordan Lee','3 hr','rose']]

export function AppShellPage() {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Brand />
        <nav className="side-nav" aria-label="Primary navigation">{nav.map(([icon,label,active]) => <button key={label} className={active ? 'active' : ''}><Icon name={icon}/><span>{label}</span>{label === 'Notifications' && <em>3</em>}</button>)}</nav>
        <div className="sidebar-footer"><button><Icon name="settings"/><span>Settings</span></button><button><Icon name="logout"/><span>Log out</span></button></div>
      </aside>
      <section className="app-main">
        <header className="topbar">
          <div className="global-search"><Icon name="search" size={18}/><input aria-label="Search pulselink" placeholder="Search pulselink..."/></div>
          <div className="top-actions"><ThemeControl compact/><button className="icon-button notification-button"><Icon name="bell" size={19}/><span/></button><button className="profile-button"><span className="avatar avatar-green">SC</span><Icon name="chevron" size={15}/></button></div>
        </header>
        <div className="dashboard-grid">
          <section className="feed-column">
            <div className="feed-heading"><div><span className="kicker">Your circle</span><h1>Good afternoon, Sarah</h1><p>See what your friends have been sharing.</p></div><button className="primary-button small"><Icon name="plus" size={18}/>Create post</button></div>
            <div className="composer card-surface"><span className="avatar avatar-green">SC</span><button className="composer-input">Share something with your circle...</button><button className="icon-button"><Icon name="image" size={19}/></button></div>
            <article className="post-card card-surface">
              <header><div className="preview-user"><span className="avatar avatar-blue">MT</span><span><b>Michael Torres</b><small>18 minutes ago · Friends</small></span></div><button className="more-button" aria-label="Post options">•••</button></header>
              <p>Morning ride before the city wakes up. Definitely worth the early alarm.</p>
              <div className="post-image"><div className="image-label">Quiet roads, clear mind.</div></div>
              <footer><button><Icon name="heart" size={19}/>24</button><button><Icon name="comment" size={19}/>8 comments</button><button><Icon name="share" size={19}/>Share</button></footer>
            </article>
            <article className="post-card text-post card-surface"><header><div className="preview-user"><span className="avatar avatar-violet">EW</span><span><b>Emma Wilson</b><small>1 hour ago · Friends</small></span></div><button className="more-button">•••</button></header><p>Small reminder: progress counts even when it feels quiet. Hope everyone is having a gentle week.</p><footer><button><Icon name="heart" size={19}/>17</button><button><Icon name="comment" size={19}/>4 comments</button><button><Icon name="share" size={19}/>Share</button></footer></article>
          </section>
          <aside className="right-rail">
            <section className="rail-card card-surface"><header><h2>People you may know</h2><button>See all</button></header>{contacts.slice(0,3).map(([initials,name,time,color]) => <div className="person-row" key={name}><span className={`avatar avatar-${color}`}>{initials}</span><span><b>{name}</b><small>{time === 'Online' ? '3 mutual friends' : '2 mutual friends'}</small></span><button>Connect</button></div>)}</section>
            <section className="rail-card card-surface"><header><h2>Active now</h2><button>Open chat</button></header>{contacts.map(([initials,name,time,color]) => <div className="active-row" key={name}><span className={`avatar avatar-${color}`}>{initials}<i/></span><span><b>{name}</b><small>{time}</small></span></div>)}</section>
          </aside>
        </div>
      </section>
    </main>
  )
}
