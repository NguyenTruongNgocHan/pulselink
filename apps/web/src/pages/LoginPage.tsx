import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components'
import { AuthLayout } from './AuthLayout'

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  return (
    <AuthLayout mode="login">
      <div className="auth-card">
        <div className="auth-heading"><span className="kicker">Sign in</span><h2>Welcome back</h2><p>Enter your details to continue to pulselink.</p></div>
        <form className="form" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="email">Email address</label>
          <div className="input-wrap"><Icon name="mail" size={18}/><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" /></div>
          <div className="label-row"><label htmlFor="password">Password</label><Link to="/forgot-password">Forgot password?</Link></div>
          <div className="input-wrap"><Icon name="lock" size={18}/><input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password"/><button className="input-action" type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility"><Icon name="eye" size={18}/></button></div>
          <label className="check-row"><input type="checkbox"/> <span>Keep me signed in</span></label>
          <button className="primary-button" type="submit">Sign in</button>
          <div className="divider"><span>or</span></div>
          <button className="secondary-button" type="button"><Icon name="google" size={19}/>Continue with Google</button>
        </form>
        <p className="auth-switch">New to pulselink? <Link to="/register">Create an account</Link></p>
      </div>
    </AuthLayout>
  )
}
