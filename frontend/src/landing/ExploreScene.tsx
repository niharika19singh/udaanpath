import {
  Fragment,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import { ArrowRight } from 'lucide-react'
import heroArt from '../assets/hero-pathways.webp'
import { linkTo, routes } from '../router.ts'
import { ART_H, ART_W, careers, trunk } from './careers.ts'
import { useOnScreen } from './motion.ts'

const headline = ['Your', 'Potential', 'Has', 'Many', 'Paths.']

const pct = (value: number, total: number) => `${(value / total) * 100}%`

/**
 * The hero scene sits in one fixed coordinate system: the artwork never
 * moves or scales. A single `selected` index drives everything that
 * reflects the chosen career — its branch, its drawn glass panel, the
 * selector tab and the information panel — so they can never disagree.
 */
function ExploreScene() {
  const sceneRef = useRef<HTMLElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const onScreen = useOnScreen(sceneRef)
  const [selected, setSelected] = useState(0)
  const career = careers[selected]

  // Arrow keys move between careers, as in any tab list.
  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = careers.length - 1
    const next =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? index === last
          ? 0
          : index + 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? index === 0
            ? last
            : index - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null
    if (next === null) return
    event.preventDefault()
    setSelected(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <section
      id="explore"
      ref={sceneRef}
      className={`scene ${onScreen ? '' : 'is-paused'}`}
      aria-labelledby="hero-title"
    >
      <div className="scene-frame">
        <div className="scene-atmos" aria-hidden="true" />

        <div className="scene-copy">
          <p className="hero-kicker">From learning to livelihood</p>
          <h1 id="hero-title" className="hero-title">
            {headline.map((word, i) => (
              <Fragment key={word}>
                {word === 'Has' ? <br /> : i > 0 && ' '}
                <span
                  className={`word ${word === 'Potential' ? 'accent' : ''}`}
                  style={{ '--w': i } as CSSProperties}
                >
                  <span>{word}</span>
                </span>
              </Fragment>
            ))}
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
            <p className="hero-hint">
              <span aria-hidden="true">✦</span> Choose a career, or tap a
              branch, to light its path
            </p>
          </div>
        </div>

        <div className="world-anchor">
          <div
            className="world"
            style={{ '--accent': career.accent } as CSSProperties}
          >
            <img
              className="world-art"
              src={heroArt}
              width={ART_W}
              height={ART_H}
              alt="A glowing sprout on a neon grid, with career pathways branching out to six glass panels."
              fetchPriority="high"
              decoding="async"
            />
            <img
              className="world-art-glow"
              src={heroArt}
              alt=""
              aria-hidden="true"
              decoding="async"
            />
            <div className="world-veil" aria-hidden="true" />

            <svg
              className="tree"
              viewBox={`0 0 ${ART_W} ${ART_H}`}
              aria-hidden="true"
            >
              <g className="trunk">
                <path className="comet" d={trunk} pathLength={1} />
              </g>
              {careers.map((c, i) => (
                <g
                  key={c.id}
                  className="branch"
                  data-state={selected === i ? 'lit' : 'dim'}
                  style={{ '--accent': c.accent } as CSSProperties}
                >
                  <path className="branch-halo" d={c.branch} pathLength={1} />
                  <path className="branch-core" d={c.branch} pathLength={1} />
                  <path className="branch-twig" d={c.twig} pathLength={1} />
                  <path className="comet" d={c.branch} pathLength={1} />
                  <circle
                    className="branch-ring"
                    cx={c.node[0]}
                    cy={c.node[1]}
                    r="16"
                  />
                  <circle
                    className="branch-node"
                    cx={c.node[0]}
                    cy={c.node[1]}
                    r="8"
                  />
                  {/* Generous invisible stroke so the branch is easy to click. */}
                  <path
                    className="branch-hit"
                    d={`${c.branch} ${c.twig}`}
                    onClick={() => setSelected(i)}
                  />
                </g>
              ))}
            </svg>

            {/* Outline that lights the drawn glass panel for each career. */}
            {careers.map((c, i) => (
              <span
                key={c.id}
                className="destination"
                data-on={selected === i ? '' : undefined}
                aria-hidden="true"
                style={
                  {
                    '--accent': c.accent,
                    left: pct(c.panel[0], ART_W),
                    top: pct(c.panel[1], ART_H),
                    '--tilt': `${c.tilt}deg`,
                  } as CSSProperties
                }
              />
            ))}

            {/* Pointer shortcuts on the drawn panels; keyboard users get the
                tab list below, so these stay out of the tab order. */}
            <ul className="world-labels" aria-hidden="true">
              {careers.map((c, i) => (
                <li
                  key={c.id}
                  style={
                    {
                      '--accent': c.accent,
                      '--x': pct(c.label[0], ART_W),
                      '--y': pct(c.label[1], ART_H),
                      '--tilt': `${c.tilt}deg`,
                    } as CSSProperties
                  }
                  data-state={selected === i ? 'lit' : 'dim'}
                >
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setSelected(i)}
                  >
                    <strong>{c.title}</strong>
                    <span>{c.example}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="career-dock"
          style={{ '--accent': career.accent } as CSSProperties}
        >
          <div className="career-tabs" role="tablist" aria-label="Career paths">
            {careers.map((c, i) => (
              <button
                key={c.id}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                type="button"
                role="tab"
                id={`career-tab-${c.id}`}
                aria-selected={selected === i}
                aria-controls="career-panel"
                tabIndex={selected === i ? 0 : -1}
                style={{ '--accent': c.accent } as CSSProperties}
                onClick={() => setSelected(i)}
                onKeyDown={(event) => onTabKey(event, i)}
              >
                <span className="tab-dot" aria-hidden="true" />
                {c.short}
              </button>
            ))}
          </div>

          <div
            id="career-panel"
            role="tabpanel"
            aria-labelledby={`career-tab-${career.id}`}
            className="career-panel"
          >
            <div className="career-panel-body" key={career.id}>
              <span className="career-panel-icon" aria-hidden="true">
                <career.icon size={24} />
              </span>
              <div className="career-panel-main">
                <p className="career-panel-index">
                  Path {String(selected + 1).padStart(2, '0')}
                  <span> / {String(careers.length).padStart(2, '0')}</span>
                </p>
                <h2>{career.title}</h2>
                <p className="career-panel-blurb">{career.blurb}</p>
              </div>
              <div className="career-panel-side">
                <p className="career-panel-label">Example roles</p>
                <ul>
                  {career.roles.map((role) => (
                    <li key={role}>{role}</li>
                  ))}
                </ul>
                <a
                  className="text-link"
                  href={routes.onboarding}
                  onClick={linkTo(routes.onboarding)}
                >
                  See if it fits you
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ExploreScene
