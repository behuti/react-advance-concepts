import { render, screen } from '@testing-library/react'
import { Card, SplitPanel, Box, ListContainer, ListItem } from './ComponentComposition'

describe('Component Composition', () => {
  it('Card renders title and children', () => {
    render(<Card title="Test Card"><p>child content</p></Card>)
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('child content')).toBeInTheDocument()
  })

  it('SplitPanel renders left and right slots', () => {
    render(<SplitPanel left={<p>left side</p>} right={<p>right side</p>} />)
    expect(screen.getByText('left side')).toBeInTheDocument()
    expect(screen.getByText('right side')).toBeInTheDocument()
  })

  it('Box renders as default div', () => {
    const { container } = render(<Box>content</Box>)
    const div = container.querySelector('div')
    expect(div).toBeInTheDocument()
    expect(div).toHaveTextContent('content')
  })

  it('Box renders as section with as prop', () => {
    const { container } = render(<Box as="section">section content</Box>)
    expect(container.querySelector('section')).toBeInTheDocument()
  })

  it('ListContainer and ListItem render correctly', () => {
    render(
      <ListContainer>
        <ListItem>item 1</ListItem>
        <ListItem>item 2</ListItem>
      </ListContainer>
    )
    expect(screen.getByText('item 1')).toBeInTheDocument()
    expect(screen.getByText('item 2')).toBeInTheDocument()
  })
})
