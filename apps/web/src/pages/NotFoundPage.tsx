import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return <main className="center"><h1>404</h1><Link to="/login">Return to PulseLink</Link></main>
}
