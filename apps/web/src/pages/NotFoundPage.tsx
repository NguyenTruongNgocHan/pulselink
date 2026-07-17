import { Link } from 'react-router-dom'
import { Brand } from '../components'
import { ThemeControl } from '../theme'
export function NotFoundPage() { return <main className="not-found"><header><Brand/><ThemeControl compact/></header><section><span className="error-code">404</span><h1>This page slipped out of the circle.</h1><p>The link may be outdated or the page may have moved.</p><Link className="primary-button link-button" to="/login">Return to pulselink</Link></section></main> }
