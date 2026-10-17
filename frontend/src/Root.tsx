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

  return route === routes.onboarding ? <App /> : <Landing />
}

export default Root
