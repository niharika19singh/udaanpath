import { useEffect, useState } from 'react'
import App from './App.tsx'
import Landing from './landing/Landing.tsx'
import { currentRoute, routes } from './router.ts'

function Root() {
  const [route, setRoute] = useState(currentRoute)

  useEffect(() => {
    const sync = () => setRoute(currentRoute())
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

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
