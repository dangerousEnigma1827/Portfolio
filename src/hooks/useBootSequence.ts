import { useEffect, useState } from 'react'

const BOOT_STORAGE_KEY = 'muneeb-terminal-boot-seen'

const bootLines = [
  'pixel link / handshake ........ ok',
  'loading safe runtime .......... ok',
  'session ready // entry unlocked',
]

export function useBootSequence() {
  const [isComplete, setIsComplete] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.localStorage.getItem(BOOT_STORAGE_KEY) === 'true' || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  const [visibleLines, setVisibleLines] = useState(() => (isComplete ? bootLines.length : 0))

  useEffect(() => {
    if (isComplete) return

    const timers = bootLines.map((_, index) =>
      window.setTimeout(() => setVisibleLines(index + 1), 180 + index * 150),
    )
    const completeTimer = window.setTimeout(() => {
      window.localStorage.setItem(BOOT_STORAGE_KEY, 'true')
      setIsComplete(true)
    }, 880)

    return () => {
      timers.forEach(window.clearTimeout)
      window.clearTimeout(completeTimer)
    }
  }, [isComplete])

  const skip = () => {
    window.localStorage.setItem(BOOT_STORAGE_KEY, 'true')
    setVisibleLines(bootLines.length)
    setIsComplete(true)
  }

  return { isComplete, visibleLines, bootLines, skip }
}
