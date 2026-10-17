import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { linkTo, routes } from '../router.ts'
import { careers } from './careers.ts'
import { useOnScreen, useReveal, useScrollProgress } from './motion.ts'

function Words({ text }: { text: string }) {
  return text.split(' ').map((word, i) => (
    <span key={`${word}-${i}`}>
      {i > 0 && ' '}
      <span className="word" style={{ '--w': i } as CSSProperties}>
        <span>{word}</span>
      </span>
    </span>
  ))
}

function ChapterHead({
  index,
  kicker,
  title,
  id,
  children,
}: {
  index: string
  kicker: string
  title: string
  id: string
  children?: ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  const shown = useReveal(ref, 0.4)
  return (
    <header ref={ref} className={`chapter-head ${shown ? 'is-in' : ''}`}>
      <p className="chapter-kicker">
        <span>{index}</span>
        {kicker}
      </p>
      <h2 id={id}>
        <Words text={title} />
      </h2>
      <span className="chapter-beam" aria-hidden="true" />
      {children && <p className="chapter-lede">{children}</p>}
    </header>
  )
}

/* ---------------- Discover: interests light roots to careers ---------------- */

const interests: { label: string; careers: string[] }[] = [
  { label: 'Computers & problem-solving', careers: ['technology'] },
  { label: 'Caring for people', careers: ['healthcare'] },
  { label: 'Farms, nature & the outdoors', careers: ['agriculture'] },
  { label: 'Building & fixing things', careers: ['engineering'] },
  { label: 'Drawing, design & stories', careers: ['creative'] },
  { label: 'Numbers, money & trade', careers: ['business'] },
  { label: 'Gadgets & how they work', careers: ['technology', 'engineering'] },
  { label: 'Helping my community', careers: ['healthcare', 'agriculture'] },
]

const SEED: [number, number] = [300, 338]
const rootPoints = careers.map((_, i) => {
  const angle = Math.PI * (0.92 - (i / (careers.length - 1)) * 0.84)
  return [300 + Math.cos(angle) * 250, 330 - Math.sin(angle) * 270] as const
})

export function Discover() {
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const stageRef = useRef<HTMLDivElement>(null)
  const shown = useReveal(stageRef, 0.3)

  const weight = careers.map(
    (c) =>
      interests.filter(
        (it) => picked.has(it.label) && it.careers.includes(c.id),
      ).length,
  )
  const glowing = careers.filter((_, i) => weight[i] > 0)

  const toggle = (label: string) =>
    setPicked((current) => {
      const next = new Set(current)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })

  return (
    <section
      id="discover"
      className="chapter discover"
      aria-labelledby="discover-title"
    >
      <div className="chapter-inner discover-grid">
        <div>
          <ChapterHead
            index="02"
            kicker="Discover"
            title="Find what moves you"
            id="discover-title"
          >
            Every strong path grows from real roots: what you enjoy, what you
            are good at and the life you come from. Tap what sounds like you and
            watch which branches respond.
          </ChapterHead>

          <ul className="interest-list" aria-label="Things you enjoy">
            {interests.map((it) => (
              <li key={it.label}>
                <button
                  type="button"
                  className="interest-chip"
                  aria-pressed={picked.has(it.label)}
                  onClick={() => toggle(it.label)}
                >
                  <span className="chip-dot" aria-hidden="true" />
                  {it.label}
                </button>
              </li>
            ))}
          </ul>

          <p className="discover-result" aria-live="polite">
            {glowing.length === 0
              ? 'Pick a few interests to light up your roots.'
              : `Glowing for you: ${glowing.map((c) => c.short).join(', ')}.`}
          </p>
          <p className="discover-note">
            This is a playful preview. Your real recommendations come from your
            full profile: education, skills, interests and circumstances.{' '}
            <a href={routes.onboarding} onClick={linkTo(routes.onboarding)}>
              Build your profile
            </a>
          </p>
        </div>

        <div
          ref={stageRef}
          className={`roots-stage ${shown ? 'is-in' : ''}`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 600 380" className="roots">
            <defs>
              <radialGradient id="seed-glow">
                <stop offset="0" stopColor="#c8ffd9" />
                <stop offset="0.35" stopColor="#45ff86" stopOpacity="0.8" />
                <stop offset="1" stopColor="#45ff86" stopOpacity="0" />
              </radialGradient>
            </defs>
            {careers.map((c, i) => {
              const [x, y] = rootPoints[i]
              const d = `M ${SEED[0]} ${SEED[1]} C ${SEED[0]} ${SEED[1] - 120}, ${x} ${y + 140}, ${x} ${y}`
              return (
                <g
                  key={c.id}
                  className="root"
                  data-on={weight[i] > 0 ? '' : undefined}
                  style={
                    {
                      '--accent': c.accent,
                      '--i': i,
                      '--weight': Math.min(weight[i], 2),
                    } as CSSProperties
                  }
                >
                  <path className="root-base" d={d} pathLength={1} />
                  <path className="root-lit" d={d} pathLength={1} />
                  <path className="comet" d={d} pathLength={1} />
                </g>
              )
            })}
            <circle
              cx={SEED[0]}
              cy={SEED[1]}
              r="46"
              fill="url(#seed-glow)"
              className="seed-glow"
            />
            <path
              className="seed-sprout"
              d="M300 338 C300 318 300 306 300 296 M300 312 C288 296 270 296 262 304 C276 314 292 314 300 312 M300 304 C312 288 330 286 340 294 C326 306 310 308 300 304"
            />
          </svg>
          {careers.map((c, i) => (
            <span
              key={c.id}
              className="root-node"
              data-on={weight[i] > 0 ? '' : undefined}
              style={
                {
                  '--accent': c.accent,
                  left: `${(rootPoints[i][0] / 600) * 100}%`,
                  top: `${(rootPoints[i][1] / 380) * 100}%`,
                } as CSSProperties
              }
            >
              <c.icon size={22} />
              <span>{c.short}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Learn: a vine that grows with scroll ---------------- */

type Milestone = {
  stage: string
  weeks: number
  title: string
  skills: string[]
  free: string
  cert: string
}

// Mirrors the two specialised templates in backend/app/services/pathway.py.
const roadmaps: { id: string; label: string; milestones: Milestone[] }[] = [
  {
    id: 'solar',
    label: 'Solar PV Technician',
    milestones: [
      {
        stage: 'Foundational',
        weeks: 4,
        title: 'Basics of DC Electrical Systems & Solar Irradiance',
        skills: ['PV System Sizing', "Ohm's Law", 'Multimeter Diagnostics'],
        free: 'SWAYAM / NPTEL Solar Energy Basics',
        cert: 'Skill India National Solar Mission Primer',
      },
      {
        stage: 'Intermediate',
        weeks: 6,
        title: 'Inverter Wiring & Rooftop Mounting Standards',
        skills: ['Inverter Wiring', 'Earthing Installation', 'Conduit Bending'],
        free: 'NISE free reading materials & videos',
        cert: 'SCGJ Solar PV Installer Certificate',
      },
      {
        stage: 'Applied',
        weeks: 6,
        title: 'Grid Interconnection, Testing & Net Metering',
        skills: [
          'Safety Compliance',
          'Net Metering Regulations',
          'Commissioning Reports',
        ],
        free: 'Bureau of Energy Efficiency free handbooks',
        cert: 'State DISCOM Authorised Solar Technician Assessment',
      },
      {
        stage: 'Job-ready',
        weeks: 8,
        title: 'Apprenticeship Placement & EPC Field Experience',
        skills: [
          'Project Delivery',
          'Customer Handover',
          'Preventive Maintenance',
        ],
        free: 'NAPS apprenticeship portal & stipend programme',
        cert: 'NAPS Certified Solar Apprentice Badge',
      },
    ],
  },
  {
    id: 'data',
    label: 'Junior Data Analyst',
    milestones: [
      {
        stage: 'Foundational',
        weeks: 5,
        title: 'Data Literacy, Spreadsheets & SQL Fundamentals',
        skills: ['Advanced Excel', 'SQL', 'Data Cleaning'],
        free: 'freeCodeCamp databases & Khan Academy SQL',
        cert: 'Google Data Analytics Certificate (financial aid)',
      },
      {
        stage: 'Intermediate',
        weeks: 6,
        title: 'Business Intelligence & Interactive Dashboarding',
        skills: ['Power BI', 'Data Storytelling', 'DAX Calculations'],
        free: 'Microsoft Learn Power BI free path',
        cert: 'Microsoft Power BI Data Analyst Associate (PL-300)',
      },
      {
        stage: 'Applied',
        weeks: 6,
        title: 'Python for Data Analysis & Automation',
        skills: ['Python', 'Pandas', 'Automated Reporting'],
        free: 'SWAYAM NPTEL Python course',
        cert: 'NPTEL Python for Data Science Certificate',
      },
      {
        stage: 'Job-ready',
        weeks: 6,
        title: 'Real-world Capstone Portfolio & Interview Prep',
        skills: ['Portfolio Building', 'Case Study Writing', 'Interview Prep'],
        free: 'Kaggle datasets & LeetCode free SQL 50',
        cert: 'GitHub portfolio review by a mentor',
      },
    ],
  },
]

const VINE =
  'M 60 0 C 110 60, 10 120, 60 180 C 110 240, 10 300, 60 360 C 110 420, 10 480, 60 540 C 110 600, 10 660, 60 720 C 90 760, 60 790, 60 800'

export function Learn() {
  const [active, setActive] = useState(0)
  const stageRef = useRef<HTMLDivElement>(null)
  const progress = useScrollProgress(stageRef, {
    mode: 'reading',
    steps: 100,
  })
  const roadmap = roadmaps[active]

  return (
    <section id="learn" className="chapter learn" aria-labelledby="learn-title">
      <div className="chapter-inner">
        <ChapterHead
          index="03"
          kicker="Learn"
          title="Grow skills along a roadmap"
          id="learn-title"
        >
          Choose a career and UdaanPath grows a four-stage roadmap towards it.
          Each stage names the skills to build, a free way to learn them and a
          recognised certification. Scroll to grow an example.
        </ChapterHead>

        <div
          className="roadmap-tabs"
          role="tablist"
          aria-label="Example roadmaps"
        >
          {roadmaps.map((r, i) => (
            <button
              key={r.id}
              type="button"
              role="tab"
              id={`tab-${r.id}`}
              aria-selected={active === i}
              aria-controls="roadmap-panel"
              onClick={() => setActive(i)}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div
          ref={stageRef}
          id="roadmap-panel"
          role="tabpanel"
          aria-labelledby={`tab-${roadmap.id}`}
          className="vine-stage"
        >
          <svg
            className="vine"
            viewBox="0 0 120 800"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path className="vine-base" d={VINE} pathLength={1} />
            <path className="vine-grow" d={VINE} pathLength={1} />
          </svg>
          <ol className="milestones" key={roadmap.id}>
            {roadmap.milestones.map((m, i) => (
              <li
                key={m.title}
                className="milestone"
                data-on={progress >= 0.06 + i * 0.245 ? '' : undefined}
                style={{ '--i': i } as CSSProperties}
              >
                <span className="milestone-node" aria-hidden="true" />
                <p className="milestone-stage">
                  Stage {i + 1} · {m.stage}
                  <span>~{m.weeks} weeks</span>
                </p>
                <h3>{m.title}</h3>
                <ul className="skill-list" aria-label="Skills">
                  {m.skills.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                <dl>
                  <div>
                    <dt>Free route</dt>
                    <dd>{m.free}</dd>
                  </div>
                  <div>
                    <dt>Certification</dt>
                    <dd>{m.cert}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Opportunities: fruit in the canopy ---------------- */

const criteria = [
  'Family income',
  'Age',
  'Gender',
  'Social category',
  'Academic marks',
  'Education level',
]

// Example names are from backend/data/opportunities.json and the roadmap
// templates' free resources.
const opportunityKinds = [
  {
    id: 'scholarships',
    label: 'Scholarships',
    accent: '#ffd23f',
    blurb: 'Financial support so cost does not decide your future.',
    examples: [
      'NSP Post Matric Scholarship',
      'AICTE Pragati Scholarship for Girl Students',
      'Kotak Kanya Scholarship',
    ],
    checked: true,
  },
  {
    id: 'schemes',
    label: 'Government schemes',
    accent: '#45ff86',
    blurb: 'Public skilling programmes with training and certification.',
    examples: ['Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)'],
    checked: true,
  },
  {
    id: 'apprenticeships',
    label: 'Apprenticeships',
    accent: '#34ecdc',
    blurb: 'Earn while you learn, on the job, with a recognised certificate.',
    examples: [
      'National Apprenticeship Training Scheme (NATS)',
      'National Apprenticeship Promotion Scheme (NAPS)',
    ],
    checked: true,
  },
  {
    id: 'courses',
    label: 'Free courses',
    accent: '#bd72ff',
    blurb: 'Free learning routes linked from each roadmap stage.',
    examples: ['SWAYAM / NPTEL', 'Skill India Digital Hub micro-courses'],
    checked: false,
  },
]

// [x, fruit centre y, y where the limb passes overhead]
const FRUIT = [
  [150, 150, 78],
  [330, 196, 129],
  [510, 168, 114],
  [690, 120, 70],
] as const

export function Opportunities() {
  const [active, setActive] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const onScreen = useOnScreen(sectionRef)
  const canopyRef = useRef<HTMLDivElement>(null)
  const shown = useReveal(canopyRef, 0.3)
  const kind = opportunityKinds[active]

  return (
    <section
      id="opportunities"
      ref={sectionRef}
      className={`chapter opportunities ${onScreen ? '' : 'is-paused'}`}
      aria-labelledby="opportunities-title"
    >
      <div className="chapter-inner">
        <ChapterHead
          index="04"
          kicker="Opportunities"
          title="Opportunities ripen in the canopy"
          id="opportunities-title"
        >
          Scholarships, schemes, apprenticeships and free courses, matched to
          your path. Pick a fruit to see what grows there.
        </ChapterHead>

        <div ref={canopyRef} className={`canopy ${shown ? 'is-in' : ''}`}>
          <svg
            className="canopy-branch"
            viewBox="0 0 840 260"
            aria-hidden="true"
          >
            <path
              className="canopy-limb"
              d="M 0 70 C 160 40, 260 150, 420 130 S 700 40, 840 70"
              pathLength={1}
            />
            {FRUIT.map(([x, y, limb], i) => (
              <path
                key={i}
                className="canopy-stem"
                data-on={active === i ? '' : undefined}
                d={`M ${x} ${limb} L ${x} ${y - 24}`}
                pathLength={1}
                style={
                  {
                    '--accent': opportunityKinds[i].accent,
                    '--i': i,
                  } as CSSProperties
                }
              />
            ))}
          </svg>
          <div
            className="fruit-row"
            role="tablist"
            aria-label="Opportunity types"
          >
            {opportunityKinds.map((k, i) => (
              <button
                key={k.id}
                type="button"
                role="tab"
                id={`fruit-${k.id}`}
                aria-selected={active === i}
                aria-controls="fruit-panel"
                className="fruit"
                data-magnetic
                style={
                  {
                    '--accent': k.accent,
                    left: `${(FRUIT[i][0] / 840) * 100}%`,
                    top: `${(FRUIT[i][1] / 260) * 100}%`,
                    '--i': i,
                  } as CSSProperties
                }
                onClick={() => setActive(i)}
              >
                <span className="fruit-orb" aria-hidden="true" />
                <span className="fruit-label">{k.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div
          id="fruit-panel"
          role="tabpanel"
          aria-labelledby={`fruit-${kind.id}`}
          className="fruit-panel"
          key={kind.id}
          style={{ '--accent': kind.accent } as CSSProperties}
        >
          <div>
            <h3>{kind.label}</h3>
            <p>{kind.blurb}</p>
            <p className="fruit-examples-label">For example</p>
            <ul className="fruit-examples">
              {kind.examples.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
          <div className="eligibility">
            {kind.checked ? (
              <>
                <p className="eligibility-title">
                  Checked against your profile, with a clear reason for each
                </p>
                <ul>
                  {criteria.map((c, i) => (
                    <li key={c} style={{ '--i': i } as CSSProperties}>
                      <Check size={15} aria-hidden="true" />
                      {c}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="eligibility-title">
                Linked from the stages of your learning roadmap, so you always
                have a free way to build each skill.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Final call to action ---------------- */

export function FinalCta() {
  const ref = useRef<HTMLElement>(null)
  const shown = useReveal(ref, 0.35)
  return (
    <section
      ref={ref}
      className={`chapter finale ${shown ? 'is-in' : ''}`}
      aria-labelledby="finale-title"
    >
      <svg className="finale-burst" viewBox="0 0 400 260" aria-hidden="true">
        {careers.map((c, i) => {
          const angle = Math.PI * (0.9 - (i / (careers.length - 1)) * 0.8)
          const x = 200 + Math.cos(angle) * 170
          const y = 230 - Math.sin(angle) * 190
          return (
            <path
              key={c.id}
              d={`M 200 230 C 200 170, ${x} ${y + 60}, ${x} ${y}`}
              pathLength={1}
              style={{ '--accent': c.accent, '--i': i } as CSSProperties}
            />
          )
        })}
        <circle cx="200" cy="232" r="10" />
      </svg>
      <div className="chapter-inner finale-inner">
        <p className="chapter-kicker">
          <span>05</span>Begin
        </p>
        <h2 id="finale-title">
          <Words text="Your path is waiting to grow." />
        </h2>
        <p className="chapter-lede">
          Tell us a little about yourself. Your profile is where every branch on
          this page begins.
        </p>
        <a
          className="neon-button large"
          data-magnetic
          href={routes.onboarding}
          onClick={linkTo(routes.onboarding)}
        >
          Start Your Journey
          <ArrowRight size={20} aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
