import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Clock,
  Compass,
  Filter,
  GraduationCap,
  IndianRupee,
  Sparkles,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react'
import { PortalShell } from '../App.tsx'
import { linkTo, routes } from '../router.ts'
import {
  careers,
  emptyFilters,
  families,
  formatLakh,
  passesFilters,
  qualificationLabels,
  roadmapFor,
  sectors,
  streamLabels,
  topics,
  type Career,
  type Filters,
} from './discovery.ts'
import './CareerDiscovery.css'

/* ---------------- Pathway map geometry (one fixed coordinate box) -------- */

// Columns, left → right: interests card | family node + label | skill
// stations | fork | career cards. Cards stop 20 units short of the edge so
// they never press against the details panel.
const W = 1000
const H = 624
const ROOT_X = 132
const ROOT_Y = H / 2
const NODE_X = 194
const NODE_R = 30
const NODE_L = NODE_X - NODE_R
/** Where each trunk leaves its family label and starts to wave. */
const WAVE_X = 440
const FORK_X = 642
const CARD_X = 700
const CARD_W = 280
const CARD_H = 60
const CARD_STEP = 72
const FAMILY_GAP = 20

const slots = (() => {
  const out: Record<string, number> = {}
  let k = 0
  families.forEach((f, fi) => {
    careers
      .filter((c) => c.family === f.id)
      .forEach((c) => {
        out[c.id] = 10 + k * CARD_STEP + fi * FAMILY_GAP + CARD_H / 2
        k += 1
      })
  })
  return out
})()

const familyY = Object.fromEntries(
  families.map((f) => {
    const ys = careers.filter((c) => c.family === f.id).map((c) => slots[c.id])
    return [f.id, ys.reduce((a, b) => a + b, 0) / ys.length]
  }),
) as Record<string, number>

// Two stations per family, one chip above the line and one below.
const STATION_X = [524, 604]
const [S0, S1] = STATION_X

// Every segment joins its neighbour with a matching tangent, so the routes
// read as one continuous stroke rather than lines meeting at corners.
const rootPath = (fy: number) =>
  `M ${ROOT_X} ${ROOT_Y} C ${ROOT_X + 26} ${ROOT_Y}, ${NODE_L - 26} ${fy}, ${NODE_L} ${fy}`
/** A gentle S-wave that passes exactly through both skill stations. */
const wave = (fy: number) =>
  `C ${WAVE_X + 22} ${fy}, ${S0 - 32} ${fy - 10}, ${S0} ${fy} ` +
  `C ${S0 + 32} ${fy + 10}, ${S1 - 24} ${fy + 10}, ${S1} ${fy} ` +
  `C ${S1 + 18} ${fy - 7.5}, ${FORK_X - 8} ${fy}, ${FORK_X} ${fy}`
const trunkPath = (fy: number) =>
  `M ${NODE_L} ${fy} L ${WAVE_X} ${fy} ${wave(fy)}`
const fork = (fy: number, cy: number) =>
  `C ${FORK_X + 28} ${fy}, ${CARD_X - 28} ${cy}, ${CARD_X} ${cy}`
const forkPath = (fy: number, cy: number) => `M ${FORK_X} ${fy} ${fork(fy, cy)}`
const routePath = (fy: number, cy: number) =>
  `${rootPath(fy)} L ${WAVE_X} ${fy} ${wave(fy)} ${fork(fy, cy)}`

const px = (x: number) => `${(x / W) * 100}%`
const py = (y: number) => `${(y / H) * 100}%`

/* ---------------- Saved careers (browser-local convenience) --------------- */

const SAVED_KEY = 'udaanpath.savedCareers'

const readSaved = (): string[] => {
  try {
    const raw = window.localStorage.getItem(SAVED_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

const tabs = ['Overview', 'Skills', 'Pathway', 'Opportunities'] as const
type Tab = (typeof tabs)[number]

/* ========================================================================== */

function CareerDiscovery() {
  const [selectedId, setSelectedId] = useState(careers[0].id)
  const [picked, setPicked] = useState<string[]>([])
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [tab, setTab] = useState<Tab>('Overview')
  const [saved, setSaved] = useState<string[]>(readSaved)

  const selected = careers.find((c) => c.id === selectedId) ?? careers[0]

  // How many of the student's picked interests each career sits under.
  const overlap = useMemo(() => {
    const out: Record<string, number> = {}
    careers.forEach((c) => {
      out[c.id] = topics.filter(
        (t) => picked.includes(t.id) && t.careers.includes(c.id),
      ).length
    })
    return out
  }, [picked])

  const visible = useMemo(() => {
    const out: Record<string, boolean> = {}
    careers.forEach((c) => (out[c.id] = passesFilters(c, filters)))
    return out
  }, [filters])

  const visibleCount = careers.filter((c) => visible[c.id]).length
  const filtersActive = Object.values(filters).some(Boolean)

  useEffect(() => {
    try {
      window.localStorage.setItem(SAVED_KEY, JSON.stringify(saved))
    } catch {
      /* storage unavailable: saving still works for this visit */
    }
  }, [saved])

  const select = (id: string) => {
    setSelectedId(id)
    setTab('Overview')
  }

  const togglePicked = (id: string) =>
    setPicked((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    )

  const clearAll = () => {
    setPicked([])
    setFilters(emptyFilters)
  }

  const pickedLabels = topics.filter((t) => picked.includes(t.id))

  return (
    <PortalShell initial="" active="Career Discovery" tone="dark">
      <main className="cd">
        <section className="cd-explore" aria-labelledby="cd-title">
          <header className="cd-head">
            <p className="cd-eyebrow">
              <Compass size={16} aria-hidden="true" />
              Career discovery
            </p>
            <h1 id="cd-title">
              Find your next <em>possibility</em>
            </h1>
            <p className="cd-lede">
              Explore eight real careers across three families. Pick interests
              and filters to see which paths fit, then compare the skills,
              training and pay for each.
            </p>
            <Constellation />
          </header>

          <PathwayMap
            selected={selected}
            overlap={overlap}
            visible={visible}
            pickedLabels={pickedLabels.map((t) => t.label)}
            onSelect={select}
          />

          <FamilyList
            selected={selected}
            overlap={overlap}
            visible={visible}
            onSelect={select}
          />

          <p className="cd-count" aria-live="polite">
            {filtersActive
              ? `${visibleCount} of ${careers.length} careers fit your filters.`
              : `${careers.length} careers across ${families.length} career families.`}
          </p>
          {/* When the details panel sits below the map, the user chooses
              whether to jump to it; selecting never scrolls the page. */}
          <a className="cd-jump" href="#cd-details-panel">
            View {selected.name} details
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </section>

        <Details
          career={selected}
          tab={tab}
          onTab={setTab}
          saved={saved.includes(selected.id)}
          onToggleSave={() =>
            setSaved((cur) =>
              cur.includes(selected.id)
                ? cur.filter((x) => x !== selected.id)
                : [...cur, selected.id],
            )
          }
          visible={visible[selected.id]}
        />

        <Suggestions
          picked={picked}
          overlap={overlap}
          visible={visible}
          selectedId={selected.id}
          onSelect={select}
        />

        <section
          className="cd-panel cd-interests"
          aria-labelledby="cd-interests-title"
        >
          <div className="cd-panel-head">
            <Compass size={22} className="cd-panel-icon" aria-hidden="true" />
            <div>
              <h2 id="cd-interests-title">Explore by interest</h2>
              <p>Select topics that interest you.</p>
            </div>
          </div>
          <ul className="cd-chips" aria-label="Interests">
            {topics.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className="cd-chip"
                  aria-pressed={picked.includes(t.id)}
                  onClick={() => togglePicked(t.id)}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="cd-panel cd-filters"
          aria-labelledby="cd-filters-title"
        >
          <div className="cd-panel-head">
            <Filter size={22} className="cd-panel-icon" aria-hidden="true" />
            <h2 id="cd-filters-title">Filters</h2>
            <button
              type="button"
              className="cd-clear"
              onClick={clearAll}
              disabled={!filtersActive && picked.length === 0}
            >
              Clear all
            </button>
          </div>
          <div className="cd-selects">
            <Select
              label="Your education"
              icon={GraduationCap}
              value={filters.education}
              onChange={(v) =>
                setFilters({ ...filters, education: v as Filters['education'] })
              }
              options={[
                ['', 'Any level'],
                ['10th_pass', '10th pass'],
                ['12th_pass', '12th pass'],
              ]}
            />
            <Select
              label="Stream"
              icon={Sparkles}
              value={filters.stream}
              onChange={(v) =>
                setFilters({ ...filters, stream: v as Filters['stream'] })
              }
              options={[['', 'Any stream'], ...Object.entries(streamLabels)]}
            />
            <Select
              label="Industry"
              icon={TrendingUp}
              value={filters.sector}
              onChange={(v) => setFilters({ ...filters, sector: v })}
              options={[['', 'Any industry'], ...sectors.map((s) => [s, s])]}
            />
            <Select
              label="Training time"
              icon={Clock}
              value={filters.training}
              onChange={(v) =>
                setFilters({ ...filters, training: v as Filters['training'] })
              }
              options={[
                ['', 'Any length'],
                ['3', 'Up to 3 months'],
                ['6', 'Up to 6 months'],
                ['12', 'Up to 12 months'],
              ]}
            />
          </div>
        </section>
      </main>
    </PortalShell>
  )
}

/* ---------------- Pathway map (desktop / tablet) -------------------------- */

type MapProps = {
  selected: Career
  overlap: Record<string, number>
  visible: Record<string, boolean>
  pickedLabels: string[]
  onSelect: (id: string) => void
}

function PathwayMap({
  selected,
  overlap,
  visible,
  pickedLabels,
  onSelect,
}: MapProps) {
  return (
    <div className="cd-map-frame">
      <div className="cd-map">
        <svg className="cd-paths" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          <defs>
            {families.map((f) => (
              <linearGradient
                key={f.id}
                id={`cd-grad-${f.id}`}
                gradientUnits="userSpaceOnUse"
                x1={ROOT_X}
                x2={CARD_X}
                y1="0"
                y2="0"
              >
                <stop offset="0" stopColor={f.from} />
                <stop offset="1" stopColor={f.to} />
              </linearGradient>
            ))}
            {families.map((f) => (
              <radialGradient key={f.id} id={`cd-glow-${f.id}`}>
                <stop offset="0" stopColor={f.from} stopOpacity="0.22" />
                <stop offset="1" stopColor={f.from} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {/* Static background: faint contour lines and a soft pool of
              light behind each family. Nothing here animates. */}
          <g className="cd-contours">
            {[70, 190, 312, 434, 556].map((y, i) => (
              <path
                key={y}
                d={`M -20 ${y} C 240 ${y - 34 + i * 6}, 520 ${y + 38 - i * 5}, 1020 ${y - 12}`}
              />
            ))}
          </g>
          {families.map((f) => (
            <ellipse
              key={f.id}
              className="cd-family-glow"
              data-active={selected.family === f.id ? '' : undefined}
              cx={NODE_X + 120}
              cy={familyY[f.id]}
              rx="230"
              ry="78"
              fill={`url(#cd-glow-${f.id})`}
            />
          ))}

          {families.map((f) => {
            const fy = familyY[f.id]
            const active = selected.family === f.id
            return (
              <g
                key={f.id}
                className="cd-family-paths"
                data-active={active ? '' : undefined}
                style={{ '--stroke': `url(#cd-grad-${f.id})` } as CSSProperties}
              >
                <path className="cd-line" d={rootPath(fy)} />
                <path className="cd-line" d={trunkPath(fy)} />
                {careers
                  .filter((c) => c.family === f.id)
                  .map((c) => {
                    const state =
                      c.id === selected.id
                        ? 'selected'
                        : !visible[c.id]
                          ? 'hidden'
                          : overlap[c.id] > 0
                            ? 'match'
                            : undefined
                    return (
                      <g key={c.id}>
                        <path
                          className="cd-line cd-fork"
                          data-state={state}
                          d={forkPath(fy, slots[c.id])}
                        />
                        <circle
                          className="cd-terminal"
                          data-state={state}
                          cx={CARD_X}
                          cy={slots[c.id]}
                          r="4"
                        />
                      </g>
                    )
                  })}
                {STATION_X.map((x) => (
                  <g key={x} className="cd-station">
                    <circle className="cd-station-ring" cx={x} cy={fy} r="8" />
                    <circle className="cd-station-core" cx={x} cy={fy} r="3" />
                  </g>
                ))}
              </g>
            )
          })}

          {/* The selected route: a wide soft halo under a crisp core. */}
          <g
            key={selected.id}
            className="cd-route-group"
            data-career-id={selected.id}
            style={
              {
                '--stroke': `url(#cd-grad-${selected.family})`,
              } as CSSProperties
            }
          >
            <path
              className="cd-route-halo"
              d={routePath(familyY[selected.family], slots[selected.id])}
            />
            <path
              className="cd-route"
              data-career-id={selected.id}
              d={routePath(familyY[selected.family], slots[selected.id])}
              pathLength={1}
            />
          </g>
          <path
            className="cd-comet"
            d={routePath(familyY[selected.family], slots[selected.id])}
            pathLength={1}
          />
        </svg>

        <div
          className="cd-strengths"
          style={{ left: 0, top: py(ROOT_Y), width: px(ROOT_X) }}
        >
          <p className="cd-strengths-title">Your picks</p>
          {pickedLabels.length > 0 ? (
            <ul>
              {pickedLabels.slice(0, 4).map((l) => (
                <li key={l}>{l}</li>
              ))}
              {pickedLabels.length > 4 && (
                <li className="more">+{pickedLabels.length - 4} more</li>
              )}
            </ul>
          ) : (
            <p className="cd-strengths-empty">
              Pick topics below to see which paths fit.
            </p>
          )}
          <a
            className="cd-ghost"
            href={routes.onboarding}
            onClick={linkTo(routes.onboarding)}
          >
            Build profile
            <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>

        {families.map((f) => {
          const fy = familyY[f.id]
          const active = selected.family === f.id
          return (
            <div key={f.id}>
              <div
                className="cd-family"
                data-active={active ? '' : undefined}
                style={
                  {
                    left: px(NODE_X - NODE_R),
                    top: py(fy),
                    '--from': f.from,
                    '--to': f.to,
                  } as CSSProperties
                }
              >
                <span className="cd-family-node" aria-hidden="true">
                  <f.icon size={24} />
                </span>
                <span className="cd-family-label">
                  <strong>{f.name}</strong>
                  <span>{f.areas}</span>
                </span>
              </div>
              {f.stations.map((s, i) => (
                <span
                  key={s}
                  className="cd-station-chip"
                  style={
                    {
                      left: px(STATION_X[i]),
                      top: py(i % 2 ? fy + 27 : fy - 27),
                      '--to': f.to,
                    } as CSSProperties
                  }
                >
                  {s}
                </span>
              ))}
            </div>
          )
        })}

        <ul className="cd-dest" aria-label="Careers">
          {careers.map((c) => (
            <li
              key={c.id}
              style={{
                left: px(CARD_X),
                top: py(slots[c.id]),
                width: px(CARD_W),
                height: py(CARD_H),
              }}
            >
              <CareerCard
                career={c}
                selected={c.id === selected.id}
                overlap={overlap[c.id]}
                visible={visible[c.id]}
                onSelect={onSelect}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ---------------- Stacked families (phones) ------------------------------- */

function FamilyList({
  selected,
  overlap,
  visible,
  onSelect,
}: Omit<MapProps, 'pickedLabels'>) {
  return (
    <div className="cd-families">
      {families.map((f) => (
        <section
          key={f.id}
          className="cd-family-block"
          data-active={selected.family === f.id ? '' : undefined}
          style={{ '--from': f.from, '--to': f.to } as CSSProperties}
          aria-label={f.name}
        >
          <div className="cd-family cd-family--static">
            <span className="cd-family-node" aria-hidden="true">
              <f.icon size={22} />
            </span>
            <span className="cd-family-label">
              <strong>{f.name}</strong>
              <span>{f.areas}</span>
            </span>
          </div>
          <ul className="cd-family-cards">
            {careers
              .filter((c) => c.family === f.id)
              .map((c) => (
                <li key={c.id}>
                  <CareerCard
                    career={c}
                    selected={c.id === selected.id}
                    overlap={overlap[c.id]}
                    visible={visible[c.id]}
                    onSelect={onSelect}
                  />
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

/* ---------------- Career card --------------------------------------------- */

function CareerCard({
  career,
  selected,
  overlap,
  visible,
  onSelect,
}: {
  career: Career
  selected: boolean
  overlap: number
  visible: boolean
  onSelect: (id: string) => void
}) {
  const family = families.find((f) => f.id === career.family)!
  return (
    <button
      type="button"
      className="cd-card"
      data-career-id={career.id}
      aria-pressed={selected}
      data-hidden={visible ? undefined : ''}
      style={{ '--from': family.from, '--to': family.to } as CSSProperties}
      onClick={() => onSelect(career.id)}
    >
      <span className="cd-card-icon" aria-hidden="true">
        <career.icon size={20} />
      </span>
      <span className="cd-card-text">
        <strong>{career.name}</strong>
        <span className="cd-card-meta">
          {!visible ? (
            <span className="cd-badge cd-badge--muted">Outside filters</span>
          ) : overlap > 0 ? (
            <span className="cd-badge cd-badge--match">
              Fits {overlap} of your picks
            </span>
          ) : (
            <span className="cd-badge">
              {qualificationLabels[career.qualification]} · ~
              {career.trainingMonths} mo
            </span>
          )}
        </span>
      </span>
      <ArrowRight size={16} className="cd-card-arrow" aria-hidden="true" />
    </button>
  )
}

/* ---------------- Career details panel ------------------------------------ */

function Details({
  career,
  tab,
  onTab,
  saved,
  onToggleSave,
  visible,
}: {
  career: Career
  tab: Tab
  onTab: (tab: Tab) => void
  saved: boolean
  onToggleSave: () => void
  visible: boolean
}) {
  const family = families.find((f) => f.id === career.family)!
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const onKey = (event: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = tabs.length
    const next =
      event.key === 'ArrowRight'
        ? (i + 1) % n
        : event.key === 'ArrowLeft'
          ? (i - 1 + n) % n
          : null
    if (next === null) return
    event.preventDefault()
    onTab(tabs[next])
    tabRefs.current[next]?.focus()
  }

  return (
    <aside
      className="cd-details"
      data-career-id={career.id}
      id="cd-details-panel"
      aria-labelledby="cd-details-title"
      style={{ '--from': family.from, '--to': family.to } as CSSProperties}
    >
      <div className="cd-details-bar">
        <p>Career details</p>
        <button
          type="button"
          className="cd-icon-button"
          aria-pressed={saved}
          aria-label={
            saved ? `Remove ${career.name} from saved` : `Save ${career.name}`
          }
          onClick={onToggleSave}
        >
          {saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
        </button>
      </div>

      <div className="cd-details-hero" key={career.id}>
        <span className="cd-details-icon" aria-hidden="true">
          <career.icon size={34} />
        </span>
        <div>
          <h2 id="cd-details-title">{career.name}</h2>
          {career.title !== career.name && (
            <p className="cd-details-official">
              Catalogue title: {career.title}
            </p>
          )}
          <p className="cd-details-sector">{career.sector}</p>
          <p className="cd-details-badges">
            <span className="cd-badge cd-badge--accent">{family.name}</span>
            <span className="cd-badge">
              From {qualificationLabels[career.qualification]}
            </span>
          </p>
        </div>
      </div>
      {!visible && (
        <p className="cd-details-note">
          This career is outside your current filters.
        </p>
      )}

      {/* Catalogue figures stay visible across tabs, with their source. */}
      <section className="cd-glance" aria-labelledby="cd-glance-title">
        <h3 id="cd-glance-title" className="cd-sub">
          At a glance
        </h3>
        <dl className="cd-stats" key={career.id}>
          <div>
            <dt>
              <IndianRupee size={14} aria-hidden="true" />
              Starting pay
            </dt>
            <dd>
              {formatLakh(career.startingSalary)}
              <span> / year</span>
            </dd>
          </div>
          <div>
            <dt>
              <TrendingUp size={14} aria-hidden="true" />
              Mid-level pay
            </dt>
            <dd>
              {formatLakh(career.midSalary)}
              <span> / year</span>
            </dd>
          </div>
          <div>
            <dt>
              <Clock size={14} aria-hidden="true" />
              Training
            </dt>
            <dd>
              ~{career.trainingMonths}
              <span> months</span>
            </dd>
          </div>
          <div>
            <dt>
              <Wallet size={14} aria-hidden="true" />
              Cost to start
            </dt>
            <dd>{career.costBarrier === 'low' ? 'Low' : 'Moderate'}</dd>
          </div>
        </dl>
        <p className="cd-source">
          Source: UdaanPath career catalogue. General estimates, not
          personalised; actual pay and costs vary by employer, location and
          institute.
        </p>
      </section>

      <div className="cd-tabs" role="tablist" aria-label="Career details">
        {tabs.map((t, i) => (
          <button
            key={t}
            ref={(el) => {
              tabRefs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`cd-tab-${t}`}
            aria-selected={tab === t}
            aria-controls="cd-tabpanel"
            tabIndex={tab === t ? 0 : -1}
            onClick={() => onTab(t)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {t}
          </button>
        ))}
      </div>

      <div
        id="cd-tabpanel"
        role="tabpanel"
        aria-labelledby={`cd-tab-${tab}`}
        className="cd-tabpanel"
        key={`${career.id}-${tab}`}
      >
        {tab === 'Overview' && (
          <>
            <p className="cd-desc">{career.description}</p>
            <div className="cd-outlook">
              <TrendingUp size={18} aria-hidden="true" />
              <p>
                <strong>Growth outlook</strong>
                {career.growth}
              </p>
            </div>
          </>
        )}

        {tab === 'Skills' && (
          <>
            <p className="cd-sub">Key skills</p>
            <ul className="cd-tags">
              {career.skills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className="cd-sub">Related interests</p>
            <ul className="cd-tags cd-tags--soft">
              {career.interests.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className="cd-sub">Open to streams</p>
            <ul className="cd-tags cd-tags--soft">
              {career.streams.map((s) => (
                <li key={s}>{streamLabels[s]}</li>
              ))}
            </ul>
          </>
        )}

        {tab === 'Pathway' && (
          <>
            <p className="cd-sub">Typical stages · roadmap template</p>
            <ol className="cd-stages">
              {roadmapFor(career).map((s, i) => (
                <li key={s.stage}>
                  <span className="cd-stage-dot" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span>
                    <strong>
                      {s.stage} · ~{s.weeks} weeks
                    </strong>
                    {s.title}
                  </span>
                </li>
              ))}
            </ol>
            <p className="cd-fine">
              Your own roadmap is generated from your profile, with free courses
              highlighted alongside certifications.
            </p>
          </>
        )}

        {tab === 'Opportunities' && (
          <>
            <p className="cd-desc">
              Scholarships, government schemes and apprenticeships are matched
              to <em>you</em> — your family income, age, category, marks and
              education — rather than to one career.
            </p>
            <ul className="cd-facts">
              <li>
                <GraduationCap size={18} aria-hidden="true" />
                <span>
                  <strong>Scholarships</strong>
                  e.g. NSP Post Matric Scholarship
                </span>
              </li>
              <li>
                <Sparkles size={18} aria-hidden="true" />
                <span>
                  <strong>Government schemes</strong>
                  e.g. PMKVY 4.0 skilling
                </span>
              </li>
              <li>
                <TrendingUp size={18} aria-hidden="true" />
                <span>
                  <strong>Apprenticeships</strong>
                  e.g. NAPS and NATS
                </span>
              </li>
            </ul>
            <p className="cd-fine">
              Example programmes from the UdaanPath opportunities directory.
              Whether you qualify is checked against your profile.
            </p>
          </>
        )}
      </div>

      {tab === 'Pathway' || tab === 'Opportunities' ? (
        <a
          className="cd-cta"
          href={routes.onboarding}
          onClick={linkTo(routes.onboarding)}
        >
          Complete your profile
          <ArrowRight size={18} aria-hidden="true" />
        </a>
      ) : (
        <button
          type="button"
          className="cd-cta"
          onClick={() => onTab('Pathway')}
        >
          Explore pathway
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      )}
    </aside>
  )
}

/* ---------------- Suggestions --------------------------------------------- */

function Suggestions({
  picked,
  overlap,
  visible,
  selectedId,
  onSelect,
}: {
  picked: string[]
  overlap: Record<string, number>
  visible: Record<string, boolean>
  selectedId: string
  onSelect: (id: string) => void
}) {
  const byInterest = picked.length > 0
  const list = careers
    .filter((c) => visible[c.id] && (!byInterest || overlap[c.id] > 0))
    .sort((a, b) =>
      byInterest
        ? overlap[b.id] - overlap[a.id] || a.trainingMonths - b.trainingMonths
        : a.trainingMonths - b.trainingMonths,
    )
    .slice(0, 3)

  return (
    <section className="cd-panel cd-suggest" aria-labelledby="cd-suggest-title">
      <div className="cd-panel-head">
        <Sparkles size={22} className="cd-panel-icon" aria-hidden="true" />
        <div>
          <h2 id="cd-suggest-title">
            {byInterest ? 'Matches your picks' : 'Quick to start'}
          </h2>
          <p>
            {byInterest
              ? 'From the interests you picked on this page, not your profile.'
              : 'Shortest training first. Pick interests to personalise this.'}
          </p>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="cd-empty">
          <X size={16} aria-hidden="true" /> No careers match these interests
          with your current filters.
        </p>
      ) : (
        <ul className="cd-suggest-list">
          {list.map((c) => {
            const f = families.find((x) => x.id === c.family)!
            return (
              <li
                key={c.id}
                style={{ '--from': f.from, '--to': f.to } as CSSProperties}
              >
                <button
                  type="button"
                  className="cd-suggest-card"
                  aria-pressed={c.id === selectedId}
                  onClick={() => onSelect(c.id)}
                >
                  <span className="cd-suggest-top">
                    <span className="cd-card-icon" aria-hidden="true">
                      <c.icon size={20} />
                    </span>
                    <span className="cd-badge cd-badge--match">
                      {byInterest
                        ? `Fits ${overlap[c.id]} of your picks`
                        : `~${c.trainingMonths} months training`}
                    </span>
                  </span>
                  <strong>{c.name}</strong>
                  <span className="cd-suggest-sector">{c.sector}</span>
                  <span className="cd-suggest-tags">
                    {c.skills.slice(0, 3).map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </span>
                  <ArrowRight
                    size={18}
                    className="cd-suggest-arrow"
                    aria-hidden="true"
                  />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

/* ---------------- Small pieces -------------------------------------------- */

function Select({
  label,
  icon: Icon,
  value,
  options,
  onChange,
}: {
  label: string
  icon: typeof Clock
  value: string
  options: string[][]
  onChange: (value: string) => void
}) {
  return (
    <label className="cd-select" data-set={value ? '' : undefined}>
      <Icon size={17} aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {v === '' ? `${label}: ${text.toLowerCase()}` : text}
          </option>
        ))}
      </select>
    </label>
  )
}

function Constellation() {
  const stars = [
    [20, 70],
    [62, 38],
    [104, 56],
    [138, 20],
    [128, 92],
    [88, 112],
  ]
  return (
    <svg className="cd-constellation" viewBox="0 0 160 130" aria-hidden="true">
      <path d="M20 70 L62 38 L104 56 L138 20 M104 56 L128 92 L88 112" />
      {stars.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3" />
      ))}
    </svg>
  )
}

export default CareerDiscovery
