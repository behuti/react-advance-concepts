import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundaries'

function BuggyComponent({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) throw new Error('test error')
  return <p>working</p>
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <p>all good</p>
      </ErrorBoundary>
    )
    expect(screen.getByText('all good')).toBeInTheDocument()
  })

  it('catches error and shows fallback', () => {
    render(
      <ErrorBoundary fallback={<div>fallback UI</div>}>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('fallback UI')).toBeInTheDocument()
  })

  it('shows error message in default fallback', () => {
    render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('test error')).toBeInTheDocument()
  })
})
