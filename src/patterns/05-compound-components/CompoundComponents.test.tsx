import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs, TabList, Tab, TabPanel, Accordion, AccordionHeader, AccordionPanel, AccordionItem } from './CompoundComponents'

describe('Tabs (compound components)', () => {
  it('shows first tab by default', () => {
    render(
      <Tabs defaultIndex={0}>
        <TabList>
          <Tab index={0}>Tab A</Tab>
          <Tab index={1}>Tab B</Tab>
        </TabList>
        <TabPanel index={0}>Content A</TabPanel>
        <TabPanel index={1}>Content B</TabPanel>
      </Tabs>
    )

    expect(screen.getByText('Content A')).toBeInTheDocument()
    expect(screen.queryByText('Content B')).not.toBeInTheDocument()
  })

  it('switches tabs on click', async () => {
    const user = userEvent.setup()
    render(
      <Tabs defaultIndex={0}>
        <TabList>
          <Tab index={0}>Tab A</Tab>
          <Tab index={1}>Tab B</Tab>
        </TabList>
        <TabPanel index={0}>Content A</TabPanel>
        <TabPanel index={1}>Content B</TabPanel>
      </Tabs>
    )

    await user.click(screen.getByText('Tab B'))
    expect(screen.getByText('Content B')).toBeInTheDocument()
    expect(screen.queryByText('Content A')).not.toBeInTheDocument()
  })
})

describe('Accordion', () => {
  it('shows no panels by default', () => {
    render(
      <Accordion>
        <AccordionItem index={0}>
          <AccordionHeader index={0}>Header 1</AccordionHeader>
          <AccordionPanel index={0}>Panel 1</AccordionPanel>
        </AccordionItem>
        <AccordionItem index={1}>
          <AccordionHeader index={1}>Header 2</AccordionHeader>
          <AccordionPanel index={1}>Panel 2</AccordionPanel>
        </AccordionItem>
      </Accordion>
    )

    expect(screen.queryByText('Panel 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Panel 2')).not.toBeInTheDocument()
  })

  it('opens and closes panel on header click', async () => {
    const user = userEvent.setup()
    render(
      <Accordion>
        <AccordionItem index={0}>
          <AccordionHeader index={0}>Header 1</AccordionHeader>
          <AccordionPanel index={0}>Panel 1</AccordionPanel>
        </AccordionItem>
      </Accordion>
    )

    await user.click(screen.getByText('Header 1'))
    expect(screen.getByText('Panel 1')).toBeInTheDocument()

    await user.click(screen.getByText('Header 1'))
    expect(screen.queryByText('Panel 1')).not.toBeInTheDocument()
  })
})
