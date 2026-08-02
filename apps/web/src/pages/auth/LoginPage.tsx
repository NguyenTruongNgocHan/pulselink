import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

import { Icon } from '../../components/ui/Icon'
import { login } from '../../features/auth/api/authApi'
import type { ApiErrorBody } from '../../features/auth/types'
import { routes } from '../../shared/constants/routes'
import { useAuthStore } from '../../stores/authStore'
import { AuthLayout } from './AuthLayout'

export function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      setSession(session)
      navigate(routes.conversations, { replace: true })
    },
  })

  const errorMessage = isAxiosError<ApiErrorBody>(loginMutation.error)
    ? (loginMutation.error.response?.data?.message ?? 'Unable to sign in. Please try again.')
    : loginMutation.error
      ? 'Unable to sign in. Please try again.'
      : null

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    loginMutation.mutate({ email: email.trim(), password })
  }

  return (
    <AuthLayout mode="login">
      <div className="auth-card">
        <div className="auth-heading">
          <span className="kicker">Sign in</span>
          <h2>Welcome back</h2>
          <p>Enter your details to continue to PulseLink.</p>
        </div>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label htmlFor="email">Email address</label>
            <div className="input-wrap">
              <Icon name="mail" size={18} />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loginMutation.isPending}
                required
              />
            </div>
          </div>

          <div className="field-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <div className="input-wrap">
              <Icon name="lock" size={18} />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loginMutation.isPending}
                required
              />
              <button
                className="input-action"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                <Icon name="eye" size={18} />
              </button>
            </div>
          </div>

          {errorMessage && <p role="alert" className="form-error">{errorMessage}</p>}

          <button className="primary-button auth-submit" type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          New to PulseLink? <Link to={routes.register}>Create an account</Link>
        </p>
      </div>
    </AuthLayout>
  )
}