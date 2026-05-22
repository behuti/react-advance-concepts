import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toggle } from './RenderProps'

describe('Toggle (render prop)', () => {
  it('renders with render prop and toggles on click', async () => {
    const user = userEvent.setup()
    render(
      <Toggle
        render={({ on, toggle }) => (
          <div>
            <span>{on ? 'ON' : 'OFF'}</span>
            <button onClick={toggle}>Toggle</button>
          </div>
        )}
      />
    )

    expect(screen.getByText('OFF')).toBeInTheDocument()
    await user.click(screen.getByText('Toggle'))
    expect(screen.getByText('ON')).toBeInTheDocument()
  })
})
