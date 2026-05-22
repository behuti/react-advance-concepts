import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from './ProviderPattern'

function TestConsumer() {
  const { state, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="auth-status">
        {state.isAuthenticated ? 'Logged in' : 'Logged out'}
      </span>
      {state.user && <span data-testid="user-name">{state.user.name}</span>}
      {state.error && <span data-testid="error">{state.error}</span>}
      <button onClick={() => login('admin@test.com', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

function renderWithProvider(ui: React.ReactElement) {
  return render(<AuthProvider>{ui}</AuthProvider>)
}

describe('AuthProvider', () => {
  it('starts logged out', () => {
    renderWithProvider(<TestConsumer />)
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged out')
  })

  it('logs in successfully', async () => {
    const user = userEvent.setup()
    renderWithProvider(<TestConsumer />)

    await user.click(screen.getByText('Login'))

    expect(await screen.findByText('Logged in', {}, { timeout: 3000 })).toBeInTheDocument()
  })

  it('logs out', async () => {
    const user = userEvent.setup()
    renderWithProvider(<TestConsumer />)

    await user.click(screen.getByText('Login'))
    expect(await screen.findByText('Logged in', {}, { timeout: 3000 })).toBeInTheDocument()

    await user.click(screen.getByText('Logout'))
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged out')
  })
})
