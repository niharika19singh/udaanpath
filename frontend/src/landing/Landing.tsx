import { useEffect, useState } from 'react'
import { ArrowRight, Leaf, Menu, X } from 'lucide-react'
import { linkTo, routes } from '../router.ts'
import { Discover, FinalCta, Learn, Opportunities } from './Chapters.tsx'
import ExploreScene from './ExploreScene.tsx'
import './Landing.css'

const chapters = [
  { id: 'explore', label: 'Explore' },
  { id: 'discover', label: 'Discover' },
  { id: 'learn', label: 'Learn' },
  { id: 'opportunities', label: 'Opportunities' },
]

function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [current, setCurrent] = useState('explore')
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  // Scroll-spy: the chapter crossing the middle of the screen is "current".
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setCurrent(entry.target.id)
        })
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    chapters.forEach((c) => {
      const el = document.getElementById(c.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  return (
    <div className="landing">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="landing-nav">
        <nav className="landing-nav-inner" aria-label="Main">
          <a
            className="landing-brand"
            href={routes.home}
            onClick={linkTo(routes.home)}
          >
            <Leaf className="landing-brand-mark" aria-hidden="true" />
            UdaanPath
          </a>

          <button
            type="button"
            className="landing-menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="landing-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
            <span className="sr-only">
              {menuOpen ? 'Close menu' : 'Open menu'}
            </span>
          </button>

          <div
            id="landing-menu"
            className={`landing-menu ${menuOpen ? 'open' : ''}`}
          >
            <ul>
              {chapters.map((c) => (
                <li key={c.id}>
                  <a
                    href={`#${c.id}`}
                    aria-current={current === c.id ? 'location' : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              className="neon-button small"
              href={routes.onboarding}
              onClick={linkTo(routes.onboarding)}
            >
              Get Started
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </nav>
      </header>

      <main id="main">
        <ExploreScene />
        <Discover />
        <Learn />
        <Opportunities />
        <FinalCta />
      </main>

      <footer className="landing-footer">
        <span className="landing-brand">
          <Leaf className="landing-brand-mark" aria-hidden="true" />
          UdaanPath
        </span>
        <p>
          Education-to-career guidance for students from rural and underserved
          communities.
        </p>
      </footer>
    </div>
  )
}

export default Landing
