import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from './App'
import { useAuthStore } from '../stores/authStore'

describe('App routing skeleton', () => {
  beforeEach(() => useAuthStore.setState({ accessToken: null }))

  it('renders the login route', () => {
    render(<MemoryRouter initialEntries={['/login']}><App /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
  })

  it('redirects anonymous users away from the app shell', () => {
    render(<MemoryRouter initialEntries={['/app']}><App /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
  })
})
