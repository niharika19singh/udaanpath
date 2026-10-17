import { useEffect, useSyncExternalStore } from 'react'
import App from './App.tsx'
import Landing from './landing/Landing.tsx'
import { currentRoute, routes } from './router.ts'

const subscribe = (onChange: () => void) => {
  window.addEventListener('popstate', onChange)
  return () => window.removeEventListener('popstate', onChange)
}
const getPath = () => window.location.pathname

function Root() {
  // The URL is the only source of truth: the route is matched on every
  // render, never cached in state, so a hot-reloaded route list can't leave
  // the landing page showing under a portal URL.
  useSyncExternalStore(subscribe, getPath)
  const route = currentRoute()

  useEffect(() => {
    document.body.classList.toggle('is-landing', route === routes.home)
  }, [route])

  // Every portal view (profile, careers, roadmap, opportunities, advisor) is
  // one App instance, so student state and API data survive moving between them.
  if (route !== routes.home) {
    return <App route={route} />
  }
  return <Landing />
}

export default Root
