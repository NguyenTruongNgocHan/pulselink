import { Link } from 'react-router-dom'

export function LoginPage() {
  return (
    <main className="auth-page">
      <section className="card">
        <div className="auth-heading">
          <span className="brand-name">PulseLink</span>
          <h1>Welcome back</h1>
          <p>Sign in to continue your conversations.</p>
        </div>

        <form
          className="form"
          onSubmit={(event) => event.preventDefault()}
        >
          <label htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled
          />

          <label htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            disabled
          />

          <button type="submit" disabled>
            Sign in
          </button>
        </form>

        <p className="muted">
          New to PulseLink?{' '}
          <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  )
}