import { useEffect, useRef } from 'react'
import { useModalFocus } from '../hooks/useModalFocus'

type ImageLightboxProps = {
  src: string
  alt: string
  title: string
  projectKey: string
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
}

export function ImageLightbox({
  src,
  alt,
  title,
  projectKey,
  onClose,
  onPrev,
  onNext,
}: ImageLightboxProps) {
  const panelRef = useRef<HTMLElement>(null)
  useModalFocus(true, panelRef, onClose)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && onPrev) {
        event.preventDefault()
        onPrev()
      } else if (event.key === 'ArrowRight' && onNext) {
        event.preventDefault()
        onNext()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onPrev, onNext])

  return (
    <div
      className="lightbox-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={panelRef}
        className="lightbox-window"
        role="dialog"
        aria-modal="true"
        aria-label={`${title} screenshot preview`}
      >
        <header className="lightbox-bar">
          <div className="lightbox-title">
            <span className="lightbox-dot" aria-hidden="true" />
            <span>~/projects/{projectKey}/preview.png</span>
          </div>
          <div className="lightbox-actions">
            {onPrev && onNext && (
              <div className="lightbox-nav-buttons">
                <button
                  type="button"
                  className="lightbox-nav-btn"
                  onClick={onPrev}
                  title="Previous project preview (←)"
                  aria-label="Previous preview"
                >
                  ◀
                </button>
                <button
                  type="button"
                  className="lightbox-nav-btn"
                  onClick={onNext}
                  title="Next project preview (→)"
                  aria-label="Next preview"
                >
                  ▶
                </button>
              </div>
            )}
            <button
              data-initial-focus
              className="lightbox-close"
              type="button"
              onClick={onClose}
              title="Close preview (Esc)"
              aria-label="Close enlarged preview"
            >
              <span className="close-symbol" aria-hidden="true">✕</span>
              <span>CLOSE</span>
            </button>
          </div>
        </header>

        <div className="lightbox-body">
          <img
            key={src}
            className="lightbox-image"
            src={src}
            alt={alt}
            loading="eager"
          />
        </div>

        <footer className="lightbox-footer">
          <span className="lightbox-caption">{title} · Full Preview</span>
          <span className="lightbox-hint"><kbd>ESC</kbd> Close <kbd>←</kbd><kbd>→</kbd> Navigate</span>
        </footer>
      </section>
    </div>
  )
}
