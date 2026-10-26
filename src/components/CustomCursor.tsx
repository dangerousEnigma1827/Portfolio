import { useEffect, useRef } from 'react'

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = document.documentElement
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!pointer.matches) return

    let frame = 0
    let x = -100
    let y = -100
    let ringX = x
    let ringY = y
    let ready = false

    const isEditable = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null
      return Boolean(element?.closest('input, textarea, select, [contenteditable="true"]'))
    }

    const isInteractive = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null
      return Boolean(element?.closest('a, button, summary, [role="button"], [role="treeitem"], .palette-result'))
    }

    const render = () => {
      ringX += (x - ringX) * (reduced.matches ? 1 : .18)
      ringY += (y - ringY) * (reduced.matches ? 1 : .18)
      if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`
      frame = window.requestAnimationFrame(render)
    }

    const move = (event: PointerEvent) => {
      x = event.clientX
      y = event.clientY
      if (!ready) {
        ready = true
        root.classList.add('custom-cursor-ready')
      }
      root.classList.toggle('custom-cursor-editable', isEditable(event.target))
      root.classList.toggle('custom-cursor-interactive', isInteractive(event.target))
    }
    const leave = () => root.classList.add('custom-cursor-hidden')
    const enter = () => root.classList.remove('custom-cursor-hidden')

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerleave', leave)
    window.addEventListener('pointerenter', enter)
    frame = window.requestAnimationFrame(render)

    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerleave', leave)
      window.removeEventListener('pointerenter', enter)
      window.cancelAnimationFrame(frame)
      root.classList.remove('custom-cursor-ready', 'custom-cursor-editable', 'custom-cursor-interactive', 'custom-cursor-hidden')
    }
  }, [])

  return <><span ref={cursorRef} className="custom-cursor-dot" aria-hidden="true" /><span ref={ringRef} className="custom-cursor-ring" aria-hidden="true" /></>
}
