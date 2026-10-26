import { useEffect, useRef, useState } from 'react'
import type { CommandItem } from '../types'
import { useModalFocus } from '../hooks/useModalFocus'

type CommandPaletteProps = {
  items: CommandItem[]
  onSelect: (item: CommandItem) => void
  onClose: () => void
}

export function CommandPalette({ items, onSelect, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  useModalFocus(true, panelRef, onClose)

  const filteredItems = items.filter((item) =>
    item.keywords.some((keyword) => keyword.toLowerCase().includes(query.trim().toLowerCase())),
  )

  useEffect(() => {
    panelRef.current?.querySelector('.palette-result.is-selected')?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedIndex((current) => (current + 1) % Math.max(filteredItems.length, 1))
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedIndex((current) => (current - 1 + Math.max(filteredItems.length, 1)) % Math.max(filteredItems.length, 1))
    }
    if (event.key === 'Enter' && filteredItems[selectedIndex]) {
      event.preventDefault()
      onSelect(filteredItems[selectedIndex])
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    }
  }

  return (
    <div className="palette-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section ref={panelRef} className="command-palette" role="dialog" aria-modal="true" aria-labelledby="palette-title">
        <div className="palette-heading">
          <div>
            <p className="eyebrow" id="palette-title">command palette</p>
            <p className="palette-hint">/ &nbsp;or&nbsp; CTRL+K &nbsp; COMMANDS</p>
          </div>
          <button className="palette-close" type="button" onClick={onClose} aria-label="Close command palette">Close</button>
        </div>
        <div className="palette-input-wrap">
          <span aria-hidden="true">/</span>
          <input
            ref={inputRef}
            data-initial-focus
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="go"
            role="combobox"
            aria-expanded="true"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="try projects, skills, contact..."
            aria-label="Search commands"
            aria-controls="command-results"
            aria-activedescendant={filteredItems[selectedIndex] ? `command-${filteredItems[selectedIndex].id}` : undefined}
          />
        </div>
        <div className="palette-results" id="command-results" role="listbox" aria-label="Available commands">
          {filteredItems.length > 0 ? filteredItems.map((item, index) => (
            <button
              key={item.id}
              id={`command-${item.id}`}
              type="button"
              className={`palette-result ${index === selectedIndex ? 'is-selected' : ''}`}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => onSelect(item)}
              role="option"
              aria-selected={index === selectedIndex}
              tabIndex={-1}
            >
              <span className="result-icon" aria-hidden="true">{index === selectedIndex ? '›' : '·'}</span>
              <span className="result-label">{item.label}</span>
              <span className="result-path">{item.path}</span>
            </button>
          )) : (
            <div className="palette-empty">
              <span className="empty-icon" aria-hidden="true">∅</span>
              <p>No destination matches <strong>{query}</strong>.</p>
              <span>Try <code>about</code>, <code>projects</code>, or <code>help</code>.</span>
            </div>
          )}
        </div>
        <div className="palette-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>ESC</kbd> close</span>
        </div>
      </section>
    </div>
  )
}
