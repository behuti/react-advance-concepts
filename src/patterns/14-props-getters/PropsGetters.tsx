import { useState, type ChangeEvent } from 'react'

interface SelectItem {
  value: string
  label: string
}

interface UseSelectOptions {
  items: SelectItem[]
  defaultSelected?: string | null
  onSelectionChange?: (item: SelectItem | null) => void
}

interface UseSelectReturn {
  selectedItem: SelectItem | null
  isOpen: boolean
  getContainerProps: <T extends Record<string, unknown>>(props?: T) => Record<string, unknown>
  getToggleButtonProps: <T extends Record<string, unknown>>(props?: T) => Record<string, unknown>
  getMenuProps: <T extends Record<string, unknown>>(props?: T) => Record<string, unknown>
  getItemProps: <T extends Record<string, unknown>>(item: SelectItem, extraProps?: T) => Record<string, unknown>
  highlightedIndex: number
}

function useSelect({ items, defaultSelected = null, onSelectionChange }: UseSelectOptions): UseSelectReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SelectItem | null>(
    items.find(i => i.value === defaultSelected) ?? null,
  )
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const selectItem = (item: SelectItem | null) => {
    setSelectedItem(item)
    onSelectionChange?.(item)
    setIsOpen(false)
  }

  const toggleOpen = () => setIsOpen(prev => !prev)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        setHighlightedIndex(0)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => Math.min(prev + 1, items.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0) selectItem(items[highlightedIndex])
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  const getContainerProps = <T extends Record<string, unknown>>(props?: T) => ({
    role: 'combobox',
    'aria-expanded': isOpen,
    'aria-haspopup': 'listbox' as const,
    ...props,
  })

  const getToggleButtonProps = <T extends Record<string, unknown>>(props?: T) => ({
    role: 'button',
    onClick: toggleOpen,
    onKeyDown: handleKeyDown,
    'aria-label': selectedItem ? `Selected: ${selectedItem.label}` : 'Select an option',
    ...props,
  })

  const getMenuProps = <T extends Record<string, unknown>>(props?: T) => ({
    role: 'listbox',
    hidden: !isOpen,
    ...props,
  })

  const getItemProps = <T extends Record<string, unknown>>(item: SelectItem, extraProps?: T) => ({
    role: 'option',
    'aria-selected': selectedItem?.value === item.value,
    onClick: () => selectItem(item),
    onKeyDown: handleKeyDown,
    children: item.label,
    ...extraProps,
  })

  return {
    selectedItem,
    isOpen,
    getContainerProps,
    getToggleButtonProps,
    getMenuProps,
    getItemProps,
    highlightedIndex,
  }
}

interface UseValidatedInputOptions {
  initialValue?: string
  validate?: (value: string) => string | null
}

function useValidatedInput({ initialValue = '', validate }: UseValidatedInputOptions) {
  const [value, setValue] = useState(initialValue)
  const [touched, setTouched] = useState(false)

  const error = touched && validate ? validate(value) : null

  const getInputProps = <T extends Record<string, unknown>>(props?: T) => ({
    value,
    onChange: (e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    onBlur: () => setTouched(true),
    'aria-invalid': !!error,
    'aria-describedby': error ? 'input-error' : undefined,
    ...props,
  })

  const getErrorProps = <T extends Record<string, unknown>>(props?: T) => ({
    id: 'input-error',
    role: 'alert',
    children: error,
    ...props,
  })

  const reset = () => {
    setValue(initialValue)
    setTouched(false)
  }

  return { value, error, getInputProps, getErrorProps, reset }
}

const FRAMEWORKS: SelectItem[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
]

export function PropsGettersDemo() {
  const select = useSelect({ items: FRAMEWORKS })
  const email = useValidatedInput({
    validate: (val: string) => {
      if (!val) return 'Email is required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Invalid email format'
      return null
    },
  })

  return (
    <div className="pattern-example">
      <h1>Props Getters</h1>

      <pre><code>{`// Hook returns getter functions that produce props
function useSelect({ items }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  const getToggleButtonProps = (extra) => ({
    onClick: () => setIsOpen(o => !o),
    'aria-expanded': isOpen,
    ...extra  // consumer can override
  })

  const getItemProps = (item, extra) => ({
    onClick: () => setSelected(item),
    role: 'option',
    ...extra
  })

  return { getToggleButtonProps, getItemProps, /* ... */ }
}`}</code></pre>

      <section className="demo-grid">
        <div className="demo-card">
          <h2>Custom Select (Props Getters)</h2>
          <div {...select.getContainerProps({ className: 'custom-select' })}>
            <button
              {...select.getToggleButtonProps({ className: 'select-toggle' })}
            >
              {select.selectedItem?.label ?? 'Choose a framework...'}
              <span className="select-arrow">{select.isOpen ? '▲' : '▼'}</span>
            </button>
            <ul {...select.getMenuProps({ className: 'select-menu' })}>
              {FRAMEWORKS.map((item, index) => (
                <li
                  key={item.value}
                  {...select.getItemProps(item, {
                    className: `select-option ${
                      index === select.highlightedIndex ? 'select-option--highlighted' : ''
                    } ${select.selectedItem?.value === item.value ? 'select-option--selected' : ''}`,
                  })}
                />
              ))}
            </ul>
          </div>
          <p className="hint">
            Consumer controls styling and structure via spreading getter props.
          </p>
        </div>

        <div className="demo-card">
          <h2>Validated Input (Props Getters)</h2>
          <label>
            Email:
            <input
              type="email"
              placeholder="you@example.com"
              {...email.getInputProps({
                className: email.error ? 'input--error' : '',
              })}
            />
          </label>
          {email.error && <p {...email.getErrorProps({ className: 'error-message' })} />}
          <button onClick={email.reset}>Reset</button>
          <p className="hint">
            Error message only shows after blur (touched state).
          </p>
        </div>
      </section>

      <section className="insights">
        <h2>Interview Questions</h2>
        <ol>
          <li><strong>What are Props Getters?</strong> Functions that return a set of props for a specific element. The consumer spreads them onto their own component, getting correct behavior + accessibility while retaining full control over rendering.</li>
          <li><strong>Props Getters vs Render Props — what's the difference?</strong> Render props give consumers full control over the rendered output. Props Getters give consumers the props they need while letting them choose which elements to render.</li>
          <li><strong>How do consumers override a getter's props?</strong> By passing their own props to the getter function, which merges them (usually with the consumer's props taking priority by spreading last).</li>
          <li><strong>What libraries use this pattern?</strong> Downshift (useSelect, useCombobox), React Table (useTable), React Form libraries.</li>
        </ol>
      </section>
    </div>
  )
}
