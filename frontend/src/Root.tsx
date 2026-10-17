import { useEffect, useState } from 'react'
import App from './App.tsx'
import CareerDiscovery from './careers/CareerDiscovery.tsx'
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

  if (route === routes.onboarding) return <App />
  if (route === routes.careers) return <CareerDiscovery />
  return <Landing />
}

export default Root
