import { useCallback, useEffect, useState } from 'react'

const BOOT_STORAGE_KEY = 'dangerous-enigma-terminal-boot-seen'
const BOOT_DURATION_MS = 2200

const bootLines = [
  'dangerousEnigma BIOS v1.0',
  'Initializing environment...',
  'Loading portfolio...',
  '[ OK ] Ready.',
]

function hasSeenBoot() {
  try {
    return window.sessionStorage.getItem(BOOT_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function markBootSeen() {
  try {
    window.sessionStorage.setItem(BOOT_STORAGE_KEY, 'true')
  } catch {
    // The animation still completes when storage is unavailable.
  }
}

export function useBootSequence() {
  const [isComplete, setIsComplete] = useState(() => {
    if (typeof window === 'undefined') return true
    return hasSeenBoot()
  })
  const [visibleLines, setVisibleLines] = useState(() => {
    if (isComplete) return bootLines.length
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return bootLines.length
    return 0
  })

  useEffect(() => {
    if (isComplete) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      markBootSeen()
      const reducedMotionTimer = window.setTimeout(() => setIsComplete(true), 0)
      return () => window.clearTimeout(reducedMotionTimer)
    }

    const timers = bootLines.map((_, index) => window.setTimeout(() => setVisibleLines(index + 1), 140 + index * 490))
    const completeTimer = window.setTimeout(() => {
      markBootSeen()
      setIsComplete(true)
    }, BOOT_DURATION_MS)

    return () => {
      timers.forEach(window.clearTimeout)
      window.clearTimeout(completeTimer)
    }
  }, [isComplete])

  const skip = useCallback(() => {
    markBootSeen()
    setVisibleLines(bootLines.length)
    setIsComplete(true)
  }, [])

  useEffect(() => {
    if (isComplete) return

    const handleSkipKey = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return
      event.preventDefault()
      skip()
    }

    window.addEventListener('keydown', handleSkipKey)
    return () => window.removeEventListener('keydown', handleSkipKey)
  }, [isComplete, skip])

  return { isComplete, visibleLines, bootLines, skip }
}
