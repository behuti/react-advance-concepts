import { render, screen } from '@testing-library/react'
import { Modal } from './Portals'

describe('Modal portal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Test">
        <p>content</p>
      </Modal>
    )
    expect(screen.queryByText('content')).not.toBeInTheDocument()
  })

  it('renders content when open', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test">
        <p>portal content</p>
      </Modal>
    )
    expect(screen.getByText('portal content')).toBeInTheDocument()
  })

  it('renders title when open', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Modal Title">
        <p>content</p>
      </Modal>
    )
    expect(screen.getByText('Modal Title')).toBeInTheDocument()
  })
})
