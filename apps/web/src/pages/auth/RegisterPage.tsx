import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

import { Icon } from '../../components/ui/Icon'
import { register as registerRequest } from '../../features/auth/api/authApi'
import type { ApiErrorBody } from '../../features/auth/types'
import { routes } from '../../shared/constants/routes'
import { useAuthStore } from '../../stores/authStore'
import { AuthLayout } from './AuthLayout'

export function RegisterPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const registerMutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: (session) => {
      setSession(session)
      navigate(routes.conversations, { replace: true })
    },
  })

  const apiError = isAxiosError<ApiErrorBody>(registerMutation.error)
    ? registerMutation.error.response?.data
    : undefined

  const errorMessage = apiError
    ? (apiError.fieldErrors && Object.values(apiError.fieldErrors)[0]) ?? apiError.message
    : registerMutation.error
      ? 'Unable to create your account. Please try again.'
      : null

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!agreed) {
      return
    }

    const normalizedUsername = username.trim()

    registerMutation.mutate({
      username: normalizedUsername,
      email: email.trim(),
      password,
      displayName: normalizedUsername,
    })
  }

  return (
    <AuthLayout mode="register">
      <div className="auth-card auth-card--register">
        <div className="auth-heading">
          <span className="kicker">Create account</span>
          <h2>Join PulseLink</h2>
          <p>Start your private social space in less than a minute.</p>
        </div>

        <form className="form compact-form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrap">
              <Icon name="user" size={18} />
              <input
                id="username"
                name="username"
                autoComplete="username"
                spellCheck={false}
                placeholder="janesmith"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                minLength={3}
                maxLength={30}
                disabled={registerMutation.isPending}
                required
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="register-email">Email address</label>
            <div className="input-wrap">
              <Icon name="mail" size={18} />
              <input
                id="register-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={registerMutation.isPending}
                required
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="register-password">Password</label>
            <div className="input-wrap">
              <Icon name="lock" size={18} />
              <input
                id="register-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                disabled={registerMutation.isPending}
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

          <label className="check-row">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              disabled={registerMutation.isPending}
              required
            />
            <span>
              I agree to the <a href="#terms">Terms</a> and{' '}
              <a href="#privacy">Privacy Policy</a>.
            </span>
          </label>

          {errorMessage && <p role="alert" className="form-error">{errorMessage}</p>}

          <button
            className="primary-button auth-submit"
            type="submit"
            disabled={registerMutation.isPending || !agreed}
          >
            {registerMutation.isPending ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to={routes.login}>Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  )
}