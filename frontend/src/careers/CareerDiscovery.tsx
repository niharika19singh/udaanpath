import {
  createContext,
  useContext,
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
import { api, type CareerItem } from '../api/client'
import {
  discoveryLabel,
  t as translate,
  type Lang,
  type MessageKey,
  type Vars,
} from '../i18n'
import { linkTo, routes } from '../router.ts'
import {
  applyCatalogue,
  careers,
  emptyFilters,
  families,
  formatLakh,
  labelQualification,
  passesFilters,
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

/** The career list the view renders: live API facts when available. */
const CatalogueContext = createContext<Career[]>(careers)
const useCatalogue = () => useContext(CatalogueContext)

/** UI language; career facts from the API are shown as received. */
const LangContext = createContext<Lang>('en')
const useI18n = () => {
  const lang = useContext(LangContext)
  return {
    tr: (key: MessageKey, vars?: Vars) => translate(lang, key, vars),
    label: (value: string) => discoveryLabel(lang, value),
  }
}

const tabKeys: Record<Tab, MessageKey> = {
  Overview: 'cdTabOverview',
  Skills: 'cdTabSkills',
  Pathway: 'cdTabPathway',
  Opportunities: 'cdTabOpportunities',
}

const costKeys: Record<string, MessageKey> = {
  low: 'cdCostLow',
  moderate: 'cdCostModerate',
  high: 'cdCostHigh',
}

/** Backend recommender output for the submitted profile, keyed by slug. */
type Recommendation = { careerId: number; score: number; rationale: string }
const RecommendationContext = createContext<Record<string, Recommendation>>({})

type CatalogueState = {
  list: Career[]
  /** slug → numeric career id in the backend database */
  ids: Record<string, number>
  source: 'loading' | 'live' | 'offline'
}

export type CareerDiscoveryProps = {
  /** Recommendations returned for the submitted profile, if any. */
  recommendations?: CareerItem[]
  /** True once a profile has been submitted to the backend. */
  hasProfile?: boolean
  /** Opens the generated learning roadmap for a backend career id. */
  onOpenRoadmap?: (careerId: number) => void
  /** UI language chosen in the portal's EN/HI toggle. */
  lang?: Lang
}

/* ========================================================================== */

function CareerDiscovery({
  recommendations = [],
  hasProfile = false,
  onOpenRoadmap,
  lang = 'en',
}: CareerDiscoveryProps) {
  const tr = (key: MessageKey, vars?: Vars) => translate(lang, key, vars)
  const label = (value: string) => discoveryLabel(lang, value)
  const [catalogue, setCatalogue] = useState<CatalogueState>({
    list: careers,
    ids: {},
    source: 'loading',
  })
  const [selectedId, setSelectedId] = useState(careers[0].id)
  const [picked, setPicked] = useState<string[]>([])
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [tab, setTab] = useState<Tab>('Overview')
  const [saved, setSaved] = useState<string[]>(readSaved)

  // Facts come from GET /api/v1/careers/; the bundled copy is only an
  // offline fallback, and the page says which one is showing.
  useEffect(() => {
    let alive = true
    api
      .listCareers()
      .then((rows) => {
        if (!alive) return
        setCatalogue({
          list: applyCatalogue(rows),
          ids: Object.fromEntries(rows.map((r) => [r.slug, r.id])),
          source: 'live',
        })
      })
      .catch(() => {
        if (alive) setCatalogue((c) => ({ ...c, source: 'offline' }))
      })
    return () => {
      alive = false
    }
  }, [])

  const list = catalogue.list

  const recBySlug = useMemo(() => {
    const slugById = Object.fromEntries(
      Object.entries(catalogue.ids).map(([slug, id]) => [id, slug]),
    )
    const out: Record<string, Recommendation> = {}
    recommendations.forEach((r) => {
      const slug = slugById[r.career_id]
      if (slug) {
        out[slug] = {
          careerId: r.career_id,
          score: r.match_score,
          rationale: r.rationale,
        }
      }
    })
    return out
  }, [recommendations, catalogue.ids])

  const selected = list.find((c) => c.id === selectedId) ?? list[0]

  // How many of the student's picked interests each career sits under.
  const overlap = useMemo(() => {
    const out: Record<string, number> = {}
    list.forEach((c) => {
      out[c.id] = topics.filter(
        (t) => picked.includes(t.id) && t.careers.includes(c.id),
      ).length
    })
    return out
  }, [picked, list])

  const visible = useMemo(() => {
    const out: Record<string, boolean> = {}
    list.forEach((c) => (out[c.id] = passesFilters(c, filters)))
    return out
  }, [filters, list])

  const visibleCount = list.filter((c) => visible[c.id]).length
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

  const selectedRec = recBySlug[selected.id]
  const selectedDbId = catalogue.ids[selected.id]

  return (
    <LangContext.Provider value={lang}>
    <CatalogueContext.Provider value={list}>
      <RecommendationContext.Provider value={recBySlug}>
        <div className="cd">
          <section className="cd-explore" aria-labelledby="cd-title">
            <header className="cd-head">
              <p className="cd-eyebrow">
                <Compass size={16} aria-hidden="true" />
                {tr('cdEyebrow')}
              </p>
              <h1 id="cd-title">
                {tr('cdTitleA')}
                <em>{tr('cdTitleB')}</em>
              </h1>
              <p className="cd-lede">
                {tr('cdLede', { n: list.length })}
              </p>
              <Constellation />
            </header>

            <PathwayMap
              selected={selected}
              overlap={overlap}
              visible={visible}
              pickedLabels={pickedLabels.map((t) => label(t.label))}
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
                ? tr('cdCountFiltered', {
                    visible: visibleCount,
                    total: list.length,
                  })
                : tr('cdCountAll', {
                    total: list.length,
                    families: families.length,
                  })}
            </p>
            {/* When the details panel sits below the map, the user chooses
              whether to jump to it; selecting never scrolls the page. */}
            <a className="cd-jump" href="#cd-details-panel">
              {tr('cdViewDetails', { name: selected.name })}
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
            rec={selectedRec}
            source={catalogue.source}
            hasProfile={hasProfile}
            onOpenRoadmap={
              onOpenRoadmap && selectedDbId !== undefined
                ? () => onOpenRoadmap(selectedDbId)
                : undefined
            }
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
                <h2 id="cd-interests-title">{tr('cdInterestsTitle')}</h2>
                <p>{tr('cdInterestsText')}</p>
              </div>
            </div>
            <ul className="cd-chips" aria-label={tr('cdInterestsAria')}>
              {topics.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className="cd-chip"
                    aria-pressed={picked.includes(t.id)}
                    onClick={() => togglePicked(t.id)}
                  >
                    {label(t.label)}
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
              <h2 id="cd-filters-title">{tr('cdFilters')}</h2>
              <button
                type="button"
                className="cd-clear"
                onClick={clearAll}
                disabled={!filtersActive && picked.length === 0}
              >
                {tr('cdClearAll')}
              </button>
            </div>
            <div className="cd-selects">
              <Select
                label={tr('cdYourEducation')}
                icon={GraduationCap}
                value={filters.education}
                onChange={(v) =>
                  setFilters({
                    ...filters,
                    education: v as Filters['education'],
                  })
                }
                options={[
                  ['', tr('cdAnyLevel')],
                  ['10th_pass', label('10th pass')],
                  ['12th_pass', label('12th pass')],
                ]}
              />
              <Select
                label={tr('cdStream')}
                icon={Sparkles}
                value={filters.stream}
                onChange={(v) =>
                  setFilters({ ...filters, stream: v as Filters['stream'] })
                }
                options={[
                  ['', tr('cdAnyStream')],
                  ...Object.entries(streamLabels).map(([v, text]) => [
                    v,
                    label(text),
                  ]),
                ]}
              />
              <Select
                label={tr('cdIndustry')}
                icon={TrendingUp}
                value={filters.sector}
                onChange={(v) => setFilters({ ...filters, sector: v })}
                options={[
                  ['', tr('cdAnyIndustry')],
                  ...sectors.map((s) => [s, s]),
                ]}
              />
              <Select
                label={tr('cdTrainingTime')}
                icon={Clock}
                value={filters.training}
                onChange={(v) =>
                  setFilters({ ...filters, training: v as Filters['training'] })
                }
                options={[
                  ['', tr('cdAnyLength')],
                  ['3', tr('cdUpToMonths', { n: 3 })],
                  ['6', tr('cdUpToMonths', { n: 6 })],
                  ['12', tr('cdUpToMonths', { n: 12 })],
                ]}
              />
            </div>
          </section>
        </div>
      </RecommendationContext.Provider>
    </CatalogueContext.Provider>
    </LangContext.Provider>
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
  const list = useCatalogue()
  const { tr, label } = useI18n()
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
                {list
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
          <p className="cd-strengths-title">{tr('cdYourPicks')}</p>
          {pickedLabels.length > 0 ? (
            <ul>
              {pickedLabels.slice(0, 4).map((l) => (
                <li key={l}>{l}</li>
              ))}
              {pickedLabels.length > 4 && (
                <li className="more">
                  {tr('cdMore', { n: pickedLabels.length - 4 })}
                </li>
              )}
            </ul>
          ) : (
            <p className="cd-strengths-empty">
              {tr('cdPickTopics')}
            </p>
          )}
          <a
            className="cd-ghost"
            href={routes.onboarding}
            onClick={linkTo(routes.onboarding)}
          >
            {tr('cdBuildProfile')}
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
                  <strong>{label(f.name)}</strong>
                  <span>{label(f.areas)}</span>
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
                  {label(s)}
                </span>
              ))}
            </div>
          )
        })}

        <ul className="cd-dest" aria-label={tr('cdCareersAria')}>
          {list.map((c) => (
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
  const list = useCatalogue()
  const { label } = useI18n()
  return (
    <div className="cd-families">
      {families.map((f) => (
        <section
          key={f.id}
          className="cd-family-block"
          data-active={selected.family === f.id ? '' : undefined}
          style={{ '--from': f.from, '--to': f.to } as CSSProperties}
          aria-label={label(f.name)}
        >
          <div className="cd-family cd-family--static">
            <span className="cd-family-node" aria-hidden="true">
              <f.icon size={22} />
            </span>
            <span className="cd-family-label">
              <strong>{label(f.name)}</strong>
              <span>{label(f.areas)}</span>
            </span>
          </div>
          <ul className="cd-family-cards">
            {list
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
  const rec = useContext(RecommendationContext)[career.id]
  const { tr, label } = useI18n()
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
            <span className="cd-badge cd-badge--muted">
              {tr('cdOutsideFilters')}
            </span>
          ) : rec ? (
            <span className="cd-badge cd-badge--match">
              {tr('cdProfileMatch', { n: Math.round(rec.score) })}
            </span>
          ) : overlap > 0 ? (
            <span className="cd-badge cd-badge--match">
              {tr('cdFitsPicks', { n: overlap })}
            </span>
          ) : (
            <span className="cd-badge">
              {label(labelQualification(career.qualification))} ·{' '}
              {tr('cdMonthsShort', { n: career.trainingMonths })}
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
  rec,
  source,
  hasProfile,
  onOpenRoadmap,
}: {
  career: Career
  tab: Tab
  onTab: (tab: Tab) => void
  saved: boolean
  onToggleSave: () => void
  visible: boolean
  rec?: Recommendation
  source: CatalogueState['source']
  hasProfile: boolean
  onOpenRoadmap?: () => void
}) {
  const family = families.find((f) => f.id === career.family)!
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const { tr, label } = useI18n()

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
        <p>{tr('cdCareerDetails')}</p>
        <button
          type="button"
          className="cd-icon-button"
          aria-pressed={saved}
          aria-label={
            saved
              ? tr('cdUnsave', { name: career.name })
              : tr('cdSave', { name: career.name })
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
              {tr('cdCatalogueTitle', { title: career.title })}
            </p>
          )}
          <p className="cd-details-sector">{career.sector}</p>
          <p className="cd-details-badges">
            <span className="cd-badge cd-badge--accent">
              {label(family.name)}
            </span>
            <span className="cd-badge">
              {tr('cdFromQualification', {
                q: label(labelQualification(career.qualification)),
              })}
            </span>
          </p>
        </div>
      </div>
      {!visible && (
        <p className="cd-details-note">
          {tr('cdOutsideNote')}
        </p>
      )}

      {rec && (
        <section className="cd-rec" aria-label={tr('cdYourMatch')}>
          <p className="cd-rec-score">
            <strong>{Math.round(rec.score)}</strong>
            <span>{tr('cdProfileMatchSuffix')}</span>
          </p>
          <p className="cd-rec-why">{rec.rationale}</p>
          <p className="cd-fine">
            {tr('cdRecommenderNote')}
          </p>
        </section>
      )}

      {/* Catalogue figures stay visible across tabs, with their source. */}
      <section className="cd-glance" aria-labelledby="cd-glance-title">
        <h3 id="cd-glance-title" className="cd-sub">
          {tr('cdAtAGlance')}
        </h3>
        <dl className="cd-stats" key={career.id}>
          <div>
            <dt>
              <IndianRupee size={14} aria-hidden="true" />
              {tr('cdStartingPay')}
            </dt>
            <dd>
              {formatLakh(career.startingSalary)}
              <span>{tr('cdPerYear')}</span>
            </dd>
          </div>
          <div>
            <dt>
              <TrendingUp size={14} aria-hidden="true" />
              {tr('cdMidPay')}
            </dt>
            <dd>
              {formatLakh(career.midSalary)}
              <span>{tr('cdPerYear')}</span>
            </dd>
          </div>
          <div>
            <dt>
              <Clock size={14} aria-hidden="true" />
              {tr('cdTraining')}
            </dt>
            <dd>
              ~{career.trainingMonths}
              <span>{tr('cdMonths')}</span>
            </dd>
          </div>
          <div>
            <dt>
              <Wallet size={14} aria-hidden="true" />
              {tr('cdCostToStart')}
            </dt>
            <dd>
              {costKeys[career.costBarrier]
                ? tr(costKeys[career.costBarrier])
                : career.costBarrier.charAt(0).toUpperCase() +
                  career.costBarrier.slice(1)}
            </dd>
          </div>
        </dl>
        <p className="cd-source">
          {source === 'offline'
            ? tr('cdSourceOffline')
            : tr('cdSourceLive')}{' '}
          {tr('cdEstimates')}
        </p>
      </section>

      <div
        className="cd-tabs"
        role="tablist"
        aria-label={tr('cdCareerDetails')}
      >
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
            {tr(tabKeys[t])}
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
                <strong>{tr('cdGrowth')}</strong>
                {career.growth}
              </p>
            </div>
          </>
        )}

        {tab === 'Skills' && (
          <>
            <p className="cd-sub">{tr('cdKeySkills')}</p>
            <ul className="cd-tags">
              {career.skills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className="cd-sub">{tr('cdRelatedInterests')}</p>
            <ul className="cd-tags cd-tags--soft">
              {career.interests.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className="cd-sub">{tr('cdOpenStreams')}</p>
            <ul className="cd-tags cd-tags--soft">
              {career.streams.map((s) => (
                <li key={s}>
                  {streamLabels[s]
                    ? label(streamLabels[s])
                    : s.replace(/_/g, ' ')}
                </li>
              ))}
            </ul>
          </>
        )}

        {tab === 'Pathway' && (
          <>
            <p className="cd-sub">{tr('cdStagesTitle')}</p>
            <ol className="cd-stages">
              {roadmapFor(career).map((s, i) => (
                <li key={s.stage}>
                  <span className="cd-stage-dot" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span>
                    <strong>
                      {s.stage} · {tr('cdWeeks', { n: s.weeks })}
                    </strong>
                    {s.title}
                  </span>
                </li>
              ))}
            </ol>
            <p className="cd-fine">
              {hasProfile
                ? tr('cdPathwayHasProfile')
                : tr('cdPathwayNoProfile')}
            </p>
          </>
        )}

        {tab === 'Opportunities' && (
          <>
            <p className="cd-desc">
              {tr('cdOppsIntroA')}
              <em>{tr('cdOppsIntroEm')}</em>
              {tr('cdOppsIntroB')}
            </p>
            <ul className="cd-facts">
              <li>
                <GraduationCap size={18} aria-hidden="true" />
                <span>
                  <strong>{tr('cdScholarships')}</strong>
                  {tr('cdScholarshipsEg')}
                </span>
              </li>
              <li>
                <Sparkles size={18} aria-hidden="true" />
                <span>
                  <strong>{tr('cdSchemes')}</strong>
                  {tr('cdSchemesEg')}
                </span>
              </li>
              <li>
                <TrendingUp size={18} aria-hidden="true" />
                <span>
                  <strong>{tr('cdApprenticeships')}</strong>
                  {tr('cdApprenticeshipsEg')}
                </span>
              </li>
            </ul>
            <p className="cd-fine">
              {tr('cdOppsNote')}
            </p>
          </>
        )}
      </div>

      {hasProfile && onOpenRoadmap && tab === 'Pathway' ? (
        <button type="button" className="cd-cta" onClick={onOpenRoadmap}>
          {tr('cdViewRoadmap')}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      ) : !hasProfile && (tab === 'Pathway' || tab === 'Opportunities') ? (
        <a
          className="cd-cta"
          href={routes.onboarding}
          onClick={linkTo(routes.onboarding)}
        >
          {tr('cdCompleteProfile')}
          <ArrowRight size={18} aria-hidden="true" />
        </a>
      ) : (
        <button
          type="button"
          className="cd-cta"
          onClick={() => onTab('Pathway')}
        >
          {tr('cdExplorePathway')}
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
  const { tr } = useI18n()
  const list = useCatalogue()
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
            {byInterest ? tr('cdMatchesPicks') : tr('cdQuickStart')}
          </h2>
          <p>
            {byInterest
              ? tr('cdMatchesPicksText')
              : tr('cdQuickStartText')}
          </p>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="cd-empty">
          <X size={16} aria-hidden="true" /> {tr('cdNoMatches')}
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
                        ? tr('cdFitsPicks', { n: overlap[c.id] })
                        : tr('cdMonthsTraining', { n: c.trainingMonths })}
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
