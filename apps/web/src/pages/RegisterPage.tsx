import { Link } from 'react-router-dom'

export function RegisterPage() {
  return (
    <main className="auth-page">
      <section className="card">
        <div className="auth-heading">
          <span className="brand-name">PulseLink</span>
          <h1>Create your account</h1>
          <p>Connect and stay in touch with the people who matter.</p>
        </div>

        <form
          className="form"
          onSubmit={(event) => event.preventDefault()}
        >
          <label htmlFor="username">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Choose a username"
            disabled
          />

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
            autoComplete="new-password"
            placeholder="Create a password"
            disabled
          />

          <button type="submit" disabled>
            Create account
          </button>
        </form>

        <p className="muted">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  )
}