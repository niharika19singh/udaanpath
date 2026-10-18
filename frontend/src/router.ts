import type { MouseEvent } from 'react'

// Minimal pathname routing without adding a router dependency.
export const routes = {
  home: '/',
  onboarding: '/onboarding',
  careers: '/careers',
  roadmap: '/roadmap',
  opportunities: '/opportunities',
  advisor: '/advisor',
  educators: '/educators',
} as const

export type Route = (typeof routes)[keyof typeof routes]

const known = Object.values(routes) as string[]

export const currentRoute = (): Route => {
  const path = window.location.pathname.replace(/\/+$/, '') || routes.home
  return known.includes(path) ? (path as Route) : routes.home
}

export const navigate = (path: Route) => {
  if (window.location.pathname !== path) {
    window.history.pushState(null, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
  window.scrollTo({ top: 0 })
}

// Lets <a href> keep native behaviour (new tab, copy link) while
// plain clicks switch views client-side.
export const linkTo =
  (path: Route) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }
    event.preventDefault()
    navigate(path)
  }
