import { useEffect, useRef, type RefObject } from 'react'

// Shared by the drawer and palette: contain focus, close on Escape, restore the opener.
export function useModalFocus(active: boolean, ref: RefObject<HTMLElement | null>, onClose: () => void) {
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose }, [onClose])
  useEffect(() => {
    const panel = ref.current
    if (!active || !panel) return
    const previous = document.activeElement as HTMLElement | null
    const controls = () => Array.from(panel.querySelectorAll<HTMLElement>('button:not(:disabled), input, [tabindex="0"]'))
      .filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0)
    ;(panel.querySelector<HTMLElement>('[data-initial-focus]') ?? controls()[0])?.focus({ preventScroll: true })
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        closeRef.current()
      } else if (event.key === 'Tab') {
        const items = controls()
        const first = items[0]
        const last = items.at(-1)
        if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKey, true)
    return () => {
      document.removeEventListener('keydown', handleKey, true)
      if (previous?.isConnected && previous.getClientRects().length) previous.focus({ preventScroll: true })
    }
  }, [active, ref])
}
