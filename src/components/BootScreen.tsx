type BootScreenProps = {
  lines: string[]
  visibleLines: number
  onSkip: () => void
}

export function BootScreen({ lines, visibleLines, onSkip }: BootScreenProps) {
  return (
    <div className="boot-screen" role="status" aria-live="polite">
      <div className="boot-mark" aria-hidden="true">M/</div>
      <div className="boot-copy">
        <p className="boot-label">MUNEEB // PORTFOLIO OS</p>
        <div className="boot-lines">
          {lines.slice(0, visibleLines).map((line) => (
            <p key={line}><span className="prompt-symbol">›</span> {line}</p>
          ))}
          <p className="boot-cursor-line"><span className="prompt-symbol">›</span> <span className="cursor-block" aria-label="loading" /></p>
        </div>
        <button className="text-button boot-skip" type="button" onClick={onSkip}>
          skip startup <span aria-hidden="true">↵</span>
        </button>
      </div>
    </div>
  )
}
