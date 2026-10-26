import type { ReactNode } from 'react'

type TerminalShellProps = {
  children: ReactNode
  onOpenPalette: () => void
  onToggleFullscreen: () => void
  fullscreenActive: boolean
  fullscreenSupported: boolean
  explorerOpen: boolean
  onToggleExplorer: () => void
  modalOpen: boolean
}

export function TerminalShell({ children, onOpenPalette, onToggleFullscreen, fullscreenActive, fullscreenSupported, explorerOpen, onToggleExplorer, modalOpen }: TerminalShellProps) {
  return (
    <main className="terminal-window">
      <header className="terminal-bar" inert={modalOpen}>
        <div className="window-controls" aria-hidden="true"><span /><span /><span /></div>
        <div className="terminal-title">dangerousEnigma.sys <span>/</span> portfolio-shell</div>
        <button className="explorer-toggle" type="button" aria-expanded={explorerOpen} aria-controls="portfolio-explorer" onClick={onToggleExplorer}>FILES</button>
        <button
          className="fullscreen-trigger"
          type="button"
          onClick={onToggleFullscreen}
          disabled={!fullscreenSupported}
          aria-label={fullscreenActive ? 'Exit fullscreen' : 'Enter fullscreen'}
          title={fullscreenSupported ? (fullscreenActive ? 'Exit fullscreen' : 'Enter fullscreen') : 'Fullscreen is not supported in this browser'}
        >
          <span aria-hidden="true">{fullscreenActive ? '⤢' : '⛶'}</span>
        </button>
        <button className="palette-trigger" type="button" onClick={onOpenPalette} aria-label="Open command palette">
          <span aria-hidden="true">⌕</span> <span>Commands</span> <kbd>Ctrl K</kbd>
        </button>
      </header>
      {children}
    </main>
  )
}
