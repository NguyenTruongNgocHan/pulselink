import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { useAuthStore } from '../stores/authStore'
import { App } from './App'
import { AppProviders } from './providers/AppProviders'

function renderApp(initialRoute: string) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AppProviders>
        <App />
      </AppProviders>
    </MemoryRouter>,
  )
}

describe('App routing skeleton', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
    })
  })

  it('renders the login route', () => {
    renderApp('/login')

    expect(
      screen.getByRole('heading', {
        name: /welcome back/i,
      }),
    ).toBeInTheDocument()
  })

  it('redirects anonymous users away from the app shell', () => {
    renderApp('/app')

    expect(
      screen.getByRole('heading', {
        name: /welcome back/i,
      }),
    ).toBeInTheDocument()
  })
})