import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ControlledForm, UncontrolledForm, FlexibleInput } from './ControlledUncontrolled'

describe('ControlledForm', () => {
  it('updates live preview as user types', async () => {
    const user = userEvent.setup()
    render(<ControlledForm />)

    const input = screen.getByPlaceholderText('Type here...')
    await user.type(input, 'hello')

    expect(screen.getByText(/hello/)).toBeInTheDocument()
  })
})

describe('UncontrolledForm', () => {
  it('submits the form value', async () => {
    const user = userEvent.setup()
    render(<UncontrolledForm />)

    const input = screen.getByPlaceholderText('Type and submit')
    await user.type(input, 'john')
    await user.click(screen.getByText('Submit'))

    expect(screen.getByText(/john/)).toBeInTheDocument()
  })
})

describe('FlexibleInput', () => {
  it('works in uncontrolled mode', async () => {
    const user = userEvent.setup()
    render(<FlexibleInput />)

    const input = screen.getByPlaceholderText('Uncontrolled mode')
    await user.type(input, 'test')

    expect(screen.getByText(/test/)).toBeInTheDocument()
  })

  it('works in controlled mode', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FlexibleInput value="" onChange={onChange} />)

    const input = screen.getByPlaceholderText('Controlled mode')
    await user.type(input, 'c')

    expect(onChange).toHaveBeenCalledWith('c')
  })
})
