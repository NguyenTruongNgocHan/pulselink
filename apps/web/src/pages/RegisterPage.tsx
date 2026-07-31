import { Link } from 'react-router-dom'

import { Icon } from '../components/ui/Icon'
import { AuthLayout } from './AuthLayout'

export function RegisterPage() {
  return (
    <AuthLayout mode="register">
      <div className="auth-card">
        <div className="auth-heading">
          <span className="kicker">
            Create account
          </span>

          <h2>Join pulselink</h2>

          <p>
            Start your private social space in less than a minute.
          </p>
        </div>

        <form
          className="form compact-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <label htmlFor="name">
            User name
          </label>

          <div className="input-wrap">
            <Icon name="user" size={18} />

            <input
              id="name"
              name="name"
              autoComplete="name"
              placeholder="Jane Smith"
            />
          </div>

          <label htmlFor="register-email">
            Email address
          </label>

          <div className="input-wrap">
            <Icon name="mail" size={18} />

            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>

          <label htmlFor="register-password">
            Password
          </label>

          <div className="input-wrap">
            <Icon name="lock" size={18} />

            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
          </div>

          <label className="check-row">
            <input type="checkbox" />

            <span>
              I agree to the{' '}
              <a href="#terms">
                Terms
              </a>{' '}
              and{' '}
              <a href="#privacy">
                Privacy Policy
              </a>
              .
            </span>
          </label>

          <button
            className="primary-button"
            type="submit"
          >
            Create account
          </button>

          <button
            className="secondary-button"
            type="button"
          >
            <Icon name="google" size={19} />
            Continue with Google
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}