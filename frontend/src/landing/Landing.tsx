import { useEffect, useState, type CSSProperties } from 'react'
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  ChevronRight,
  ChartColumnIncreasing,
  Cog,
  Compass,
  Hospital,
  Leaf,
  Laptop,
  Menu,
  Mouse,
  Palette,
  Sprout,
  X,
} from 'lucide-react'
import heroArt from '../assets/hero-pathways.webp'
import { linkTo, routes } from '../router.ts'
import './Landing.css'

// Label anchors are measured on the 1672×940 artwork (centre of each glass
// panel's empty area, plus its tilt) so the HTML text sits on the drawn panels.
const careers = [
  {
    title: 'Technology',
    example: 'Data analytics & IT',
    icon: Laptop,
    accent: '#3b9bff',
    x: 34.99,
    y: 24.26,
    tilt: 14,
  },
  {
    title: 'Healthcare',
    example: 'Medical lab tech',
    icon: Hospital,
    accent: '#ff4d7a',
    x: 26.91,
    y: 42.66,
    tilt: 11,
  },
  {
    title: 'Agriculture',
    example: 'Smart agri & drone tech',
    icon: Sprout,
    accent: '#3dfc7a',
    x: 32.0,
    y: 59.79,
    tilt: 6.5,
  },
  {
    title: 'Engineering & Technical Trades',
    example: 'Solar PV & CNC',
    icon: Cog,
    accent: '#ffd23f',
    x: 75.36,
    y: 21.28,
    tilt: -13.9,
  },
  {
    title: 'Creative Arts',
    example: 'UI/UX & digital design',
    icon: Palette,
    accent: '#b46bff',
    x: 87.92,
    y: 40.96,
    tilt: -8.3,
  },
  {
    title: 'Business',
    example: 'Banking & finance',
    icon: ChartColumnIncreasing,
    accent: '#2ee6d6',
    x: 81.94,
    y: 62.55,
    tilt: 3,
  },
]

// Glowing junction nodes drawn in the artwork (percent of its width/height).
const nodes = [
  { x: 33.91, y: 36.17, color: '#3aa8ff' },
  { x: 39.47, y: 51.06, color: '#ff6f86' },
  { x: 42.34, y: 64.36, color: '#5dff8f' },
  { x: 63.88, y: 35.11, color: '#ffe14d' },
  { x: 75.06, y: 48.72, color: '#c27dff' },
  { x: 67.28, y: 62.77, color: '#3ef0e0' },
]

const flow = [
  {
    title: 'Discover Your Strengths',
    lines: ['Discover', 'Your Strengths'],
    text: 'Build a profile of your education, skills, interests and circumstances so your guidance starts from who you are.',
    icon: Compass,
    accent: '#3dfc7a',
  },
  {
    title: 'Learn Relevant Skills',
    lines: ['Learn', 'Relevant Skills'],
    text: 'Follow a step-by-step learning roadmap towards a chosen career, with free courses highlighted alongside certifications.',
    icon: BookOpen,
    accent: '#2ee6d6',
  },
  {
    title: 'Find Real Opportunities',
    lines: ['Find Real', 'Opportunities'],
    text: 'Explore scholarships, schemes and openings, with clear eligibility checks against your profile.',
    icon: BriefcaseBusiness,
    accent: '#ffd23f',
  },
]

const navLinks = [
  { href: '#careers', label: 'Career paths' },
  { href: '#how-it-works', label: 'How it works' },
]

function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

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
              <li>
                <a
                  href={routes.home}
                  aria-current="page"
                  onClick={(event) => {
                    setMenuOpen(false)
                    linkTo(routes.home)(event)
                  }}
                >
                  Home
                </a>
              </li>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} onClick={() => setMenuOpen(false)}>
                    {link.label}
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
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-ambient" aria-hidden="true" />

          <div className="hero-copy-block">
            <p className="hero-kicker">From learning to livelihood</p>
            <h1 id="hero-title">
              <span className="hero-line">
                Your <span className="hero-accent">Potential</span>
              </span>{' '}
              <span className="hero-line">Has Many Paths.</span>
            </h1>
            <p className="hero-lede">
              Discover your strengths, explore real career options, learn the
              right skills, and find opportunities — all in one place.
            </p>
            <div className="hero-actions">
              <a
                className="neon-button"
                href={routes.onboarding}
                onClick={linkTo(routes.onboarding)}
              >
                Start Your Journey
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-stage-viewport">
              <div className="hero-stage">
                <img
                  className="hero-art"
                  src={heroArt}
                  width={1672}
                  height={940}
                  alt="Glowing career pathways branching from a growing sprout towards six career fields."
                  fetchPriority="high"
                  decoding="async"
                />
                <img
                  className="hero-art-glow"
                  src={heroArt}
                  alt=""
                  aria-hidden="true"
                  decoding="async"
                />
                <div className="hero-sprout-light" aria-hidden="true" />
                {nodes.map((node) => (
                  <span
                    key={`${node.x}-${node.y}`}
                    className="hero-node"
                    aria-hidden="true"
                    style={
                      {
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        '--node': node.color,
                      } as CSSProperties
                    }
                  />
                ))}
                <div className="hero-floor-sweep" aria-hidden="true" />
                <div className="hero-stage-fade" aria-hidden="true" />
              </div>
            </div>
            <section
              id="careers"
              className="careers"
              aria-labelledby="careers-title"
            >
              <h2 id="careers-title" className="section-title careers-title">
                Career paths to explore
              </h2>
              <ul className="career-list">
                {careers.map((career) => {
                  const Icon = career.icon
                  return (
                    <li
                      key={career.title}
                      className="career-card"
                      style={
                        {
                          '--accent': career.accent,
                          '--x': `${career.x}%`,
                          '--y': `${career.y}%`,
                          '--tilt': `${career.tilt}deg`,
                        } as CSSProperties
                      }
                    >
                      <span className="career-icon" aria-hidden="true">
                        <Icon size={22} />
                      </span>
                      <span className="career-text">
                        <strong>{career.title}</strong>
                        <span>{career.example}</span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>

            <ol className="flow-bar" aria-label="Your journey">
              {flow.map((step, index) => {
                const Icon = step.icon
                return (
                  <li
                    key={step.title}
                    style={{ '--accent': step.accent } as CSSProperties}
                  >
                    <Icon className="flow-bar-icon" aria-hidden="true" />
                    <span>
                      <strong>{step.lines[0]}</strong> {step.lines[1]}
                    </span>
                    {index < flow.length - 1 && (
                      <ChevronRight
                        className="flow-bar-chevron"
                        aria-hidden="true"
                      />
                    )}
                  </li>
                )
              })}
            </ol>
          </div>

          <a className="scroll-cue" href="#how-it-works">
            <Mouse aria-hidden="true" />
            Scroll to explore
          </a>
        </section>

        <section
          id="how-it-works"
          className="flow"
          aria-labelledby="flow-title"
        >
          <p className="hero-eyebrow">How it works</p>
          <h2 id="flow-title" className="section-title">
            One journey, three steps
          </h2>
          <ol className="flow-list">
            {flow.map((step, index) => {
              const Icon = step.icon
              return (
                <li
                  key={step.title}
                  className="flow-card"
                  style={
                    {
                      '--accent': step.accent,
                      '--delay': `${index * -2}s`,
                    } as CSSProperties
                  }
                >
                  <span className="flow-step">Step {index + 1}</span>
                  <span className="flow-icon" aria-hidden="true">
                    <Icon size={24} />
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              )
            })}
          </ol>

          <div className="flow-cta">
            <a
              className="neon-button"
              href={routes.onboarding}
              onClick={linkTo(routes.onboarding)}
            >
              Start Your Journey
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </section>
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
