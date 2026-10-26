import { useEffect, useRef, useState } from 'react'

type EntryLine = {
  kind: 'system' | 'command' | 'result' | 'error'
  text: string
}

type TerminalEntryProps = {
  onEnterWorkspace: () => void
}

const helpText = 'help · whoami · clear · cd portfolio'

export function TerminalEntry({ onEnterWorkspace }: TerminalEntryProps) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [lines, setLines] = useState<EntryLine[]>([
    { kind: 'system', text: 'guest session initialized // safe mode' },
    { kind: 'system', text: 'type help for available routes' },
  ])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) inputRef.current?.focus()
  }, [])

  const execute = (rawCommand: string) => {
    const command = rawCommand.trim().toLowerCase()
    if (!command) return

    setHistory((current) => [...current, rawCommand.trim()])
    setHistoryIndex(-1)
    setInput('')

    if (command === 'cd portfolio' || command === 'start' || command === 'portfolio') {
      onEnterWorkspace()
      return
    }

    let result: EntryLine
    if (command === 'help') {
      result = { kind: 'result', text: helpText }
    } else if (command === 'whoami') {
      result = { kind: 'result', text: 'dangerousEnigma@dev // software developer // portfolio session' }
    } else if (command === 'clear') {
      setLines([])
      return
    } else {
      result = { kind: 'error', text: `command not found: ${rawCommand.trim()} // try help` }
    }

    setLines((current) => {
      const nextLines: EntryLine[] = [
        ...current,
        { kind: 'command', text: rawCommand.trim() },
        result,
      ]
      return nextLines.slice(-4)
    })
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
    if (event.key === 'Enter') {
      event.preventDefault()
      execute(input)
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHistoryIndex((current) => {
        const nextIndex = Math.min(current + 1, history.length - 1)
        setInput(history[history.length - 1 - nextIndex] ?? '')
        return nextIndex
      })
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHistoryIndex((current) => {
        const nextIndex = Math.max(current - 1, -1)
        setInput(nextIndex === -1 ? '' : history[history.length - 1 - nextIndex] ?? '')
        return nextIndex
      })
    }
    if (event.key === 'Escape') {
      setInput('')
      setHistoryIndex(-1)
    }
  }

  return (
    <main className="entry-screen">
      <div className="entry-noise" aria-hidden="true" />
      <section className="entry-panel" aria-labelledby="entry-title">
        <div className="entry-topline">
          <span className="system-chip"><span className="pixel-dot" aria-hidden="true" /> dangerousEnigma.sys</span>
          <button className="entry-skip" type="button" onClick={onEnterWorkspace}>skip to portfolio <span aria-hidden="true">↗</span></button>
        </div>
        <div className="entry-center">
          <div className="entry-mark" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <p className="entry-kicker">interactive developer workspace</p>
          <h1 id="entry-title" className="entry-title">ENTER THE SYSTEM</h1>
          <p className="entry-copy">type a command to begin</p>

          <form className="entry-terminal" onSubmit={(event) => { event.preventDefault(); execute(input) }}>
            <div className="entry-output" role="log" aria-live="polite" aria-label="Terminal output">
              {lines.map((line, index) => (
                <p key={`${line.text}-${index}`} className={`entry-line entry-line-${line.kind}`}>
                  {line.kind === 'command' ? <><span className="entry-prompt">$</span> {line.text}</> : line.text}
                </p>
              ))}
            </div>
            <div className="entry-input-row">
              <span className="entry-prompt" aria-hidden="true">$</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                aria-label={historyIndex >= 0 ? 'Enter a safe portfolio command from history' : 'Enter a safe portfolio command'}
                autoComplete="off"
                enterKeyHint="go"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                placeholder="enter command"
              />
              <span className="block-cursor" aria-hidden="true" />
              <button className="command-submit" type="submit" aria-label="Submit entry command">↵</button>
            </div>
          </form>

          <p className="entry-command-hint">Type &quot;cd portfolio&quot; and press Enter to enter the portfolio.</p>
        </div>
      </section>
    </main>
  )
}
