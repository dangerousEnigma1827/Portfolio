type BootScreenProps = {
  lines: string[]
  visibleLines: number
  onSkip: () => void
}

export function BootScreen({ lines, visibleLines, onSkip }: BootScreenProps) {
  return (
    <div className="boot-screen" role="status" aria-live="polite">
      <div className="boot-terminal">
        <div className="boot-lines">
          {lines.slice(0, visibleLines).map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p className="boot-cursor-line"><span className="cursor-block" aria-label="loading" /></p>
        </div>
        <button className="text-button boot-skip" type="button" onClick={onSkip}>
          skip startup <span aria-hidden="true">↵</span>
        </button>
      </div>
    </div>
  )
}
