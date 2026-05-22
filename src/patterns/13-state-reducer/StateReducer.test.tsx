import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToggleReducer, CounterReducer } from './StateReducer'

describe('ToggleReducer', () => {
  it('renders with default state', () => {
    render(
      <ToggleReducer>
        {({ on }) => <span>{on ? 'ON' : 'OFF'}</span>}
      </ToggleReducer>
    )
    expect(screen.getByText('OFF')).toBeInTheDocument()
  })

  it('toggles on click', async () => {
    const user = userEvent.setup()
    render(
      <ToggleReducer>
        {({ on, getTogglerProps }) => (
          <div>
            <span>{on ? 'ON' : 'OFF'}</span>
            <button {...getTogglerProps()}>Toggle</button>
          </div>
        )}
      </ToggleReducer>
    )

    expect(screen.getByText('OFF')).toBeInTheDocument()
    await user.click(screen.getByText('Toggle'))
    expect(screen.getByText('ON')).toBeInTheDocument()
  })
})

describe('CounterReducer', () => {
  it('renders with initial count', () => {
    render(
      <CounterReducer>
        {({ count }) => <span>{count}</span>}
      </CounterReducer>
    )
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('increments and decrements', async () => {
    const user = userEvent.setup()
    render(
      <CounterReducer initialCount={5}>
        {({ count, increment, decrement }) => (
          <div>
            <span>{count}</span>
            <button onClick={increment}>+</button>
            <button onClick={decrement}>-</button>
          </div>
        )}
      </CounterReducer>
    )

    expect(screen.getByText('5')).toBeInTheDocument()
    await user.click(screen.getByText('+'))
    expect(screen.getByText('6')).toBeInTheDocument()
    await user.click(screen.getByText('-'))
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})
