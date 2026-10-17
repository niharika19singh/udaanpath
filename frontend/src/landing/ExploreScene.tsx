import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { ArrowRight, BookOpen, BriefcaseBusiness, Compass } from 'lucide-react'
import heroArt from '../assets/hero-pathways.webp'
import { linkTo, routes } from '../router.ts'
import { ART_H, ART_W, careers, trunk } from './careers.ts'
import { useOnScreen, useReducedMotion, useScrollProgress } from './motion.ts'

// 0 = overview, 1–6 = one camera stop per career branch, 7 = pull back.
const STEPS = careers.length + 2

const journey = [
  {
    href: '#discover',
    lead: 'Discover',
    rest: 'Your Strengths',
    icon: Compass,
  },
  { href: '#learn', lead: 'Learn', rest: 'Relevant Skills', icon: BookOpen },
  {
    href: '#opportunities',
    lead: 'Find Real',
    rest: 'Opportunities',
    icon: BriefcaseBusiness,
  },
]

// Foreground motes that drift with the pointer for a sense of depth.
const motes = [
  { x: 12, y: 22, d: 1.6, s: 10, c: '#45ff86' },
  { x: 47, y: 12, d: 2.2, s: 8, c: '#34ecdc' },
  { x: 92, y: 18, d: 1.2, s: 12, c: '#bd72ff' },
  { x: 84, y: 70, d: 2.6, s: 9, c: '#ffd23f' },
  { x: 30, y: 78, d: 1.9, s: 7, c: '#3fb4ff' },
  { x: 62, y: 86, d: 1.4, s: 6, c: '#45ff86' },
  { x: 70, y: 30, d: 3, s: 5, c: '#ffffff' },
]

const headline = ['Your', 'Potential', 'Has', 'Many', 'Paths.']

type Camera = { x: number; y: number; s: number }

function ExploreScene() {
  const sceneRef = useRef<HTMLElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const branchRefs = useRef<(SVGGElement | null)[]>([])

  const reduced = useReducedMotion()
  const onScreen = useOnScreen(sceneRef)
  const progress = useScrollProgress(sceneRef, { mode: 'pinned', steps: 400 })
  const step = Math.min(STEPS - 1, Math.floor(progress * STEPS))
  const [hovered, setHovered] = useState<number | null>(null)
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, s: 1 })
  const [booted, setBooted] = useState(reduced)

  const focusIndex = step >= 1 && step <= careers.length ? step - 1 : null
  const lit = focusIndex ?? (step === 0 ? hovered : null)
  const career = focusIndex === null ? null : careers[focusIndex]

  useEffect(() => {
    if (booted) return
    const timer = window.setTimeout(() => setBooted(true), 2200)
    return () => window.clearTimeout(timer)
  }, [booted])

  // Camera: fly the world so the active branch lands at a fixed point in the
  // frame. Measured from untransformed layout boxes, applied as one transform.
  useLayoutEffect(() => {
    const frame = frameRef.current
    const anchor = anchorRef.current
    const world = worldRef.current
    if (!frame || !anchor || !world) return

    const aim = () => {
      const fw = frame.clientWidth
      const fh = frame.clientHeight
      const ww = world.offsetWidth
      const wh = world.offsetHeight
      const wide = fw >= 1100

      if (focusIndex === null) {
        if (step === STEPS - 1) {
          // Pull back and centre the whole tree for the closing beat.
          const s = wide ? 0.92 : 0.82
          const tx = fw / 2 - anchor.offsetLeft - s * (0.555 * ww)
          const ty = fh * 0.5 - anchor.offsetTop - s * (0.5 * wh)
          setCamera({ x: tx, y: ty, s })
        } else {
          setCamera({ x: 0, y: 0, s: 1 })
        }
        return
      }
      const c = careers[focusIndex]
      const fx = ((c.node[0] * 0.5 + c.label[0] * 0.5) / ART_W) * ww
      const fy = ((c.node[1] * 0.5 + c.label[1] * 0.5) / ART_H) * wh
      const s = wide ? 1.7 : 1.45
      const targetX = wide ? fw * 0.68 : fw * 0.5
      const targetY = wide ? fh * 0.5 : fh * 0.36
      setCamera({
        x: targetX - anchor.offsetLeft - s * fx,
        y: targetY - anchor.offsetTop - s * fy,
        s,
      })
    }

    // Fires once on observe, then on every resize.
    const ro = new ResizeObserver(aim)
    ro.observe(frame)
    return () => ro.disconnect()
  }, [focusIndex, step])

  // Pointer: parallax depth for the frame, and proximity glow for branches.
  const frameMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return
    const frame = frameRef.current
    const world = worldRef.current
    if (!frame || !world) return
    const fr = frame.getBoundingClientRect()
    if (!reduced) {
      frame.style.setProperty(
        '--px',
        (((event.clientX - fr.left) / fr.width) * 2 - 1).toFixed(3),
      )
      frame.style.setProperty(
        '--py',
        (((event.clientY - fr.top) / fr.height) * 2 - 1).toFixed(3),
      )
    }

    if (step !== 0) return
    const wr = world.getBoundingClientRect()
    const ax = ((event.clientX - wr.left) / wr.width) * ART_W
    const ay = ((event.clientY - wr.top) / wr.height) * ART_H
    let nearest: number | null = null
    let best = Infinity
    careers.forEach((c, i) => {
      const d = Math.min(
        Math.hypot(ax - c.node[0], ay - c.node[1]),
        Math.hypot(ax - c.label[0], ay - c.label[1]),
      )
      branchRefs.current[i]?.style.setProperty(
        '--near',
        Math.max(0, 1 - d / 340).toFixed(3),
      )
      if (d < best) {
        best = d
        nearest = i
      }
    })
    const next = best < 150 ? nearest : null
    if (next !== hovered) setHovered(next)
  }

  const frameLeave = () => {
    branchRefs.current.forEach((g) => g?.style.setProperty('--near', '0'))
    if (step === 0) setHovered(null)
  }

  const goTo = (index: number) => {
    const scene = sceneRef.current
    if (!scene) return
    const rect = scene.getBoundingClientRect()
    const travel = rect.height - window.innerHeight
    window.scrollTo({
      top: window.scrollY + rect.top + ((index + 0.5) / STEPS) * travel,
      behavior: reduced ? 'auto' : 'smooth',
    })
  }

  return (
    <section
      id="explore"
      ref={sceneRef}
      className={`scene ${onScreen ? '' : 'is-paused'} ${booted ? '' : 'is-booting'}`}
      style={{ '--steps': STEPS } as CSSProperties}
      data-step={step}
      aria-labelledby="hero-title"
    >
      <div
        ref={frameRef}
        className="scene-frame"
        onPointerMove={frameMove}
        onPointerLeave={frameLeave}
      >
        <div className="scene-atmos" aria-hidden="true" />

        <div className="scene-copy" inert={step > 0}>
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
              data-magnetic
              href={routes.onboarding}
              onClick={linkTo(routes.onboarding)}
            >
              Start Your Journey
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <p className="hero-hint">
              <span aria-hidden="true">✦</span> Hover a branch, or tap a career,
              to light its path
            </p>
          </div>
        </div>

        <div ref={anchorRef} className="world-anchor">
          <div
            ref={worldRef}
            className="world"
            data-lit={lit === null ? undefined : ''}
            data-outro={step === STEPS - 1 ? '' : undefined}
            style={{
              transform: `translate3d(${camera.x.toFixed(1)}px, ${camera.y.toFixed(1)}px, 0) scale(${camera.s})`,
            }}
            onClick={() => {
              if (step === 0 && hovered !== null) goTo(hovered + 1)
            }}
          >
            <div className="world-depth">
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
                  <path className="trunk-core" d={trunk} pathLength={1} />
                  <path className="comet" d={trunk} pathLength={1} />
                  <circle className="trunk-bulb" cx="929" cy="305" r="60" />
                </g>
                {careers.map((c, i) => (
                  <g
                    key={c.id}
                    ref={(el) => {
                      branchRefs.current[i] = el
                    }}
                    className="branch"
                    data-state={
                      lit === i ? 'lit' : lit !== null ? 'dim' : undefined
                    }
                    style={{ '--accent': c.accent, '--i': i } as CSSProperties}
                  >
                    <path className="branch-grow" d={c.branch} pathLength={1} />
                    <path className="branch-hint" d={c.branch} />
                    <path className="branch-halo" d={c.branch} pathLength={1} />
                    <path className="branch-core" d={c.branch} pathLength={1} />
                    <path className="branch-twig" d={c.twig} pathLength={1} />
                    <path className="comet" d={c.branch} pathLength={1} />
                    <path className="comet late" d={c.branch} pathLength={1} />
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
                  </g>
                ))}
              </svg>

              <ul className="world-labels" aria-label="Career paths">
                {careers.map((c, i) => (
                  <li
                    key={c.id}
                    style={
                      {
                        '--accent': c.accent,
                        '--x': `${(c.label[0] / ART_W) * 100}%`,
                        '--y': `${(c.label[1] / ART_H) * 100}%`,
                        '--tilt': `${c.tilt}deg`,
                      } as CSSProperties
                    }
                    data-state={
                      lit === i ? 'lit' : lit !== null ? 'dim' : undefined
                    }
                  >
                    <button
                      type="button"
                      aria-label={`Explore the ${c.title} path`}
                      onFocus={() => step === 0 && setHovered(i)}
                      onBlur={() => step === 0 && setHovered(null)}
                      onPointerEnter={() => step === 0 && setHovered(i)}
                      onClick={(event) => {
                        event.stopPropagation()
                        goTo(i + 1)
                      }}
                    >
                      <strong>{c.title}</strong>
                      <span>{c.example}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="scene-motes" aria-hidden="true">
          {motes.map((m, i) => (
            <span
              key={i}
              style={
                {
                  left: `${m.x}%`,
                  top: `${m.y}%`,
                  '--d': m.d,
                  '--s': `${m.s}px`,
                  '--c': m.c,
                  '--delay': `${i * -1.3}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div className="path-card-slot" aria-live="polite">
          {career && focusIndex !== null && (
            <article
              key={career.id}
              className="path-card"
              style={{ '--accent': career.accent } as CSSProperties}
            >
              <p className="path-card-index">
                Path {String(focusIndex + 1).padStart(2, '0')}
                <span> / {String(careers.length).padStart(2, '0')}</span>
              </p>
              <span className="path-card-icon" aria-hidden="true">
                <career.icon size={26} />
              </span>
              <h2>{career.title}</h2>
              <p className="path-card-blurb">{career.blurb}</p>
              <p className="path-card-label">Example roles on this path</p>
              <ul>
                {career.roles.map((role) => (
                  <li key={role}>{role}</li>
                ))}
              </ul>
              <a
                className="text-link"
                data-magnetic
                href={routes.onboarding}
                onClick={linkTo(routes.onboarding)}
              >
                See if it fits you — build your profile
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </article>
          )}
        </div>

        <div className="scene-outro" inert={step !== STEPS - 1}>
          <p>Six paths. One beginning.</p>
          <h2>
            Every path starts with <span>you</span>.
          </h2>
        </div>

        <nav className="scene-rail" aria-label="Career paths">
          <ol>
            {careers.map((c, i) => (
              <li key={c.id} style={{ '--accent': c.accent } as CSSProperties}>
                <button
                  type="button"
                  aria-current={focusIndex === i ? 'step' : undefined}
                  onClick={() => goTo(i + 1)}
                >
                  <span className="rail-dot" aria-hidden="true" />
                  <span className="rail-label">{c.short}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <ol className="journey-bar" aria-label="Your journey" inert={step > 0}>
          {journey.map((item, i) => (
            <li key={item.href}>
              <a href={item.href}>
                <item.icon className="journey-icon" aria-hidden="true" />
                <span>
                  <strong>{item.lead}</strong> {item.rest}
                </span>
              </a>
              {i < journey.length - 1 && (
                <span className="journey-chevron" aria-hidden="true">
                  ›
                </span>
              )}
            </li>
          ))}
        </ol>

        <p className="scene-scroll" aria-hidden="true">
          <span />
          Scroll to explore the paths
        </p>
      </div>
    </section>
  )
}

export default ExploreScene
