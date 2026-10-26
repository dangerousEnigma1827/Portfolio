import { useEffect, useSyncExternalStore } from 'react'

// Keep this query in sync with the drawer breakpoint in App.css.
const drawerQuery = '(max-width: 767px), (max-width: 1023px) and (max-height: 500px)'
const subscribe = (callback: () => void) => {
  const query = window.matchMedia(drawerQuery)
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}

export function useResponsiveViewport() {
  const compact = useSyncExternalStore(subscribe, () => window.matchMedia(drawerQuery).matches, () => false)

  useEffect(() => {
    const viewport = window.visualViewport
    const update = () => {
      // Do not counteract pinch zoom. Only follow the unzoomed keyboard/address-bar viewport.
      if (viewport && Math.abs(viewport.scale - 1) > .01) return
      document.documentElement.style.setProperty('--app-height', `${viewport?.height ?? window.innerHeight}px`)
      document.documentElement.style.setProperty('--app-top', `${viewport?.offsetTop ?? 0}px`)
    }
    update()
    viewport?.addEventListener('resize', update)
    viewport?.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    return () => {
      viewport?.removeEventListener('resize', update)
      viewport?.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      document.documentElement.style.removeProperty('--app-height')
      document.documentElement.style.removeProperty('--app-top')
    }
  }, [])

  return compact
}
