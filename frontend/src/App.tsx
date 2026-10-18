import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Brain,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Compass,
  ExternalLink,
  GraduationCap,
  Loader2,
  Mail,
  Map as MapIcon,
  MapPin,
  Percent,
  Phone,
  Plus,
  Search,
  Sparkles,
  Sprout,
  Tags,
  UserRound,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { HeroScene, JourneyScene, LogoMark, SidebarScene } from './ProfileArt'
import {
  api,
  type StudentProfileData,
  type CareerItem,
  type OpportunityMatchItem,
  type PathwayResponse,
  type AiAdvisorResponse,
} from './api/client'
import CareerDiscovery from './careers/CareerDiscovery.tsx'
import {
  codeLabel,
  eligibilityLabel,
  optionLabel,
  readStoredLang,
  storeLang,
  t as translate,
  type Lang,
  type MessageKey,
  type Vars,
} from './i18n'
import { linkTo, navigate, routes, type Route } from './router.ts'
import './App.css'
import './onboarding.css'

type FormData = {
  full_name: string
  email: string
  phone: string
  age: string
  gender: string
  category: string
  state: string
  district: string
  location_tier: string

  education_level: string
  stream: string
  percentage_marks: string

  skills: string[]
  interests: string[]
  languages: string[]
  career_aspirations: string[]

  annual_family_income: string
  financial_constraint: string
}

// The form starts empty so completion and validation reflect what the student
// actually entered.
const initialForm: FormData = {
  full_name: '',
  email: '',
  phone: '',
  age: '',
  gender: '',
  category: '',
  state: '',
  district: '',
  location_tier: '',

  education_level: '',
  stream: '',
  percentage_marks: '',

  skills: [],
  interests: [],
  languages: [],
  career_aspirations: [],

  annual_family_income: '',
  financial_constraint: '',
}

// Sample values for demos, only applied by the "Fill demo profile" button.
const DEMO_FORM: FormData = {
  full_name: 'Aarav Sharma (demo)',
  email: 'aarav.demo@example.com',
  phone: '',
  age: '19',
  gender: 'Male',
  category: 'OBC',
  state: 'Uttar Pradesh',
  district: 'Varanasi',
  location_tier: 'Tier 2',

  education_level: '12th pass',
  stream: 'Science PCM',
  percentage_marks: '78.5',

  skills: ['Basic Computers', 'Troubleshooting', 'Communication'],
  interests: ['Technology', 'Electronics', 'Public Service'],
  languages: ['Hindi', 'English'],
  career_aspirations: ['Technical Specialist', 'Analyst'],

  annual_family_income: '180000',
  financial_constraint: 'High',
}

const steps: {
  titleKey: MessageKey
  subtitleKey: MessageKey
  icon: LucideIcon
}[] = [
  { titleKey: 'step1Title', subtitleKey: 'step1Subtitle', icon: Sprout },
  { titleKey: 'step2Title', subtitleKey: 'step2Subtitle', icon: GraduationCap },
  { titleKey: 'step3Title', subtitleKey: 'step3Subtitle', icon: Brain },
  { titleKey: 'step4Title', subtitleKey: 'step4Subtitle', icon: Wallet },
]

type NavId =
  | 'profile'
  | 'careers'
  | 'pathways'
  | 'opportunities'
  | 'advisor'
  | 'educators'

const sideNavItems: { id: NavId; labelKey: MessageKey; icon: LucideIcon }[] = [
  { id: 'profile', labelKey: 'sideProfile', icon: UserRound },
  { id: 'careers', labelKey: 'sideCareers', icon: Compass },
  { id: 'pathways', labelKey: 'sideRoadmap', icon: BookOpen },
  { id: 'opportunities', labelKey: 'sideOpportunities', icon: BriefcaseBusiness },
  { id: 'advisor', labelKey: 'sideAdvisor', icon: Brain },
]

/** Each portal view has its own URL so Back/Forward moves between them. */
const routedViews: Record<NavId, Route> = {
  profile: routes.onboarding,
  careers: routes.careers,
  pathways: routes.roadmap,
  opportunities: routes.opportunities,
  advisor: routes.advisor,
  educators: routes.educators,
}

/** Portal view each top-bar link opens; Home (no view) is the landing page. */
const topNav: { labelKey: MessageKey; view?: NavId }[] = [
  { labelKey: 'navHome' },
  { labelKey: 'navExploreCareers', view: 'careers' },
  { labelKey: 'navLearningPaths', view: 'pathways' },
  { labelKey: 'navOpportunities', view: 'opportunities' },
  { labelKey: 'navForEducators', view: 'educators' },
]

const infoPoints: {
  titleKey: MessageKey
  textKey: MessageKey
  icon: LucideIcon
}[] = [
  { titleKey: 'info1Title', textKey: 'pfInfo1Text', icon: Compass },
  { titleKey: 'info2Title', textKey: 'pfInfo2Text', icon: BookOpen },
  { titleKey: 'info3Title', textKey: 'pfInfo3Text', icon: BriefcaseBusiness },
]

// Errors hold message keys (not text) so they follow the UI language.
type Errors = Partial<Record<keyof FormData, MessageKey>>

/** Every profile field, grouped by the step that collects it. */
const profileFields: { key: keyof FormData; step: number }[] = [
  { key: 'full_name', step: 0 },
  { key: 'email', step: 0 },
  { key: 'phone', step: 0 },
  { key: 'age', step: 0 },
  { key: 'gender', step: 0 },
  { key: 'state', step: 0 },
  { key: 'district', step: 0 },
  { key: 'location_tier', step: 0 },
  { key: 'category', step: 0 },
  { key: 'education_level', step: 1 },
  { key: 'stream', step: 1 },
  { key: 'percentage_marks', step: 1 },
  { key: 'skills', step: 2 },
  { key: 'interests', step: 2 },
  { key: 'languages', step: 2 },
  { key: 'career_aspirations', step: 2 },
  { key: 'annual_family_income', step: 3 },
  { key: 'financial_constraint', step: 3 },
]

const isFilled = (value: string | string[]) =>
  Array.isArray(value) ? value.length > 0 : value.trim() !== ''

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Checks one step. Required fields must be present; optional numbers and
 *  contact details only need to be sensible when they are filled in. */
function validateStep(step: number, form: FormData): Errors {
  const errors: Errors = {}
  const need = (key: keyof FormData, message: MessageKey) => {
    if (!String(form[key]).trim()) errors[key] = message
  }
  if (step === 0) {
    if (form.full_name.trim().length < 2) {
      errors.full_name = 'vFullName'
    }
    if (!form.email.trim()) {
      errors.email = 'vEmailRequired'
    } else if (!EMAIL_RE.test(form.email.trim())) {
      errors.email = 'vEmailInvalid'
    }
    if (form.phone.trim() && form.phone.replace(/\D/g, '').length < 10) {
      errors.phone = 'vPhone'
    }
    const age = Number(form.age)
    if (!form.age.trim()) {
      errors.age = 'vAgeRequired'
    } else if (!Number.isInteger(age) || age < 12 || age > 60) {
      errors.age = 'vAgeRange'
    }
    need('gender', 'vChooseOption')
    need('category', 'vCategory')
    if (form.state.trim().length < 2) errors.state = 'vState'
    if (form.district.trim().length < 2) {
      errors.district = 'vDistrict'
    }
  }
  if (step === 1) {
    need('education_level', 'vEducation')
    const marks = Number(form.percentage_marks)
    if (!form.percentage_marks.trim()) {
      errors.percentage_marks = 'vPercentRequired'
    } else if (Number.isNaN(marks) || marks < 0 || marks > 100) {
      errors.percentage_marks = 'vPercentRange'
    }
  }
  if (step === 3) {
    const income = Number(form.annual_family_income)
    if (!form.annual_family_income.trim()) {
      errors.annual_family_income = 'vIncomeRequired'
    } else if (Number.isNaN(income) || income < 0) {
      errors.annual_family_income = 'vIncomeMin'
    }
  }
  return errors
}

/* The draft lives in sessionStorage: it survives moving between pages in
   this tab, and disappears when the tab closes (safer on shared phones). */
const DRAFT_KEY = 'udaanpath.profileDraft'

type Draft = { form: FormData; step: number; maxReached: number }

const readDraft = (): Draft | null => {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const draft = JSON.parse(raw) as Draft
    return { ...draft, form: { ...initialForm, ...draft.form } }
  } catch {
    return null
  }
}

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const STUDENT_KEY = 'udaanpath.studentId'

// Backend enum values for the form's display options (from origin/main).
const mapEducationLevel = (val: string): string => {
  const map: Record<string, string> = {
    '10th pass': '10th_pass',
    '12th pass': '12th_pass',
    Diploma: 'iti_diploma',
    Undergraduate: 'undergraduate',
    Postgraduate: 'postgraduate',
  }
  return map[val] || '12th_pass'
}

const mapStream = (val: string): string => {
  const map: Record<string, string> = {
    'Science PCM': 'science_pcm',
    'Science PCB': 'science_pcb',
    Commerce: 'commerce',
    'Arts / Humanities': 'arts_humanities',
    'Computer Science': 'science_pcm',
    Vocational: 'vocational',
  }
  return map[val] || 'general'
}

const mapGender = (val: string): string =>
  val === 'Male' ? 'male' : val === 'Female' ? 'female' : 'other'

const mapConstraint = (val: string): string =>
  val === 'Medium' ? 'moderate' : val.toLowerCase()

/** Builds the API payload from what the student entered. Optional fields the
 *  student skipped are left out so the backend applies its own defaults. */
const toPayload = (form: FormData): StudentProfileData => ({
  full_name: form.full_name.trim(),
  email: form.email.trim(),
  phone: form.phone.trim() || undefined,
  age: parseInt(form.age, 10),
  gender: mapGender(form.gender),
  category: form.category,
  state: form.state.trim(),
  district: form.district.trim(),
  location_tier: form.location_tier
    ? form.location_tier.toLowerCase().replace(' ', '_')
    : undefined,
  annual_family_income: parseFloat(form.annual_family_income),
  financial_constraint: form.financial_constraint
    ? mapConstraint(form.financial_constraint)
    : undefined,
  education_level: mapEducationLevel(form.education_level),
  stream: form.stream ? mapStream(form.stream) : undefined,
  percentage_marks: parseFloat(form.percentage_marks),
  skills: form.skills,
  interests: form.interests,
  languages: form.languages,
  career_aspirations: form.career_aspirations,
})

function App({ route }: { route: Route }) {
  const [draft] = useState(readDraft)
  const [step, setStep] = useState(draft?.step ?? 0)
  const [maxReached, setMaxReached] = useState(draft?.maxReached ?? 0)
  const [form, setForm] = useState<FormData>(draft?.form ?? initialForm)
  const [errors, setErrors] = useState<Errors>({})
  const [demoFilled, setDemoFilled] = useState(false)
  const [lang, setLang] = useState<Lang>(readStoredLang)
  const t = (key: MessageKey, vars?: Vars) => translate(lang, key, vars)

  const changeLang = (next: Lang) => {
    setLang(next)
    storeLang(next)
  }

  // Keep <html lang> in step with the UI language (screen readers, fonts).
  useEffect(() => {
    const previous = document.documentElement.lang
    document.documentElement.lang = lang
    return () => {
      document.documentElement.lang = previous
    }
  }, [lang])

  // Backend-connected state (from origin/main)
  const [student, setStudent] = useState<StudentProfileData | null>(null)
  const [careers, setCareers] = useState<CareerItem[]>([])
  const [opportunities, setOpportunities] = useState<OpportunityMatchItem[]>([])
  const [pathway, setPathway] = useState<PathwayResponse | null>(null)
  const [selectedCareerId, setSelectedCareerId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // AI Advisor state
  const [advisorQuery, setAdvisorQuery] = useState('')
  const [advisorLoading, setAdvisorLoading] = useState(false)
  const [advisorResult, setAdvisorResult] = useState<AiAdvisorResponse | null>(
    null,
  )

  const headingRef = useRef<HTMLHeadingElement>(null)
  // Field to focus once the errors have rendered (set when validation fails).
  const pendingFocus = useRef<keyof FormData | null>(null)

  const activeNav: NavId =
    (Object.keys(routedViews) as NavId[]).find(
      (id) => routedViews[id] === route,
    ) ?? 'profile'
  const shownView = useRef(`${step}-${activeNav}`)

  const selectNav = (id: NavId) => navigate(routedViews[id])

  // Loads a student's recommendations, opportunities and first roadmap.
  const loadStudentData = async (id: number) => {
    const [recs, opps] = await Promise.all([
      api.getRecommendations(id, 6),
      api.matchOpportunities(id, 6),
    ])
    setCareers(recs.recommendations || [])
    setOpportunities(opps.opportunities || [])
    if (recs.recommendations.length > 0) {
      const topCareer = recs.recommendations[0]
      setSelectedCareerId(topCareer.career_id)
      const p = await api.generatePathway(id, topCareer.career_id)
      setPathway(p)
    }
  }

  // Restores the profile this tab submitted earlier (no demo auto-load).
  useEffect(() => {
    let raw: string | null
    try {
      raw = window.sessionStorage.getItem(STUDENT_KEY)
    } catch {
      return
    }
    const id = Number(raw)
    if (!raw || !id) return
    const restore = async () => {
      try {
        const saved = await api.getProfile(id)
        setStudent(saved)
        await loadStudentData(id)
      } catch {
        // Backend unavailable or the profile no longer exists.
      }
    }
    restore()
  }, [])

  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ form, step, maxReached }),
      )
    } catch {
      /* storage unavailable: the form still works for this visit */
    }
  }, [form, step, maxReached])

  // After a step change, move focus to the new step's heading. Only scroll if
  // that heading is actually out of view, so the page never jumps needlessly.
  useEffect(() => {
    // Compare with the view last shown (not "first render"), so the double
    // run of effects in React development mode never moves focus on load.
    const view = `${step}-${activeNav}`
    if (shownView.current === view) return
    shownView.current = view
    if (activeNav !== 'profile') return
    const heading = headingRef.current
    if (!heading) return
    heading.focus({ preventScroll: true })
    const top = heading.getBoundingClientRect().top
    if (top < 0 || top > window.innerHeight * 0.6) {
      heading.scrollIntoView({
        block: 'center',
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      })
    }
  }, [step, activeNav])

  // Runs after React has rendered the step that holds the field, so it
  // works even when validation sent the student back to an earlier step.
  useEffect(() => {
    const key = pendingFocus.current
    if (!key) return
    pendingFocus.current = null
    document.getElementById(`field-${key}`)?.focus()
  }, [errors, step])

  const completion = useMemo(() => {
    const filled = profileFields.filter((f) => isFilled(form[f.key]))
    return {
      filled: filled.length,
      total: profileFields.length,
      percent: Math.round((filled.length / profileFields.length) * 100),
      perStep: steps.map((_, i) => ({
        filled: filled.filter((f) => f.step === i).length,
        total: profileFields.filter((f) => f.step === i).length,
      })),
    }
  }, [form])

  const clearError = (field: keyof FormData) =>
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })

  const updateField = (field: keyof FormData, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
    clearError(field)
  }

  const addTag = (
    field: 'skills' | 'interests' | 'languages' | 'career_aspirations',
    value: string,
  ) => {
    const cleaned = value.trim()

    if (!cleaned || form[field].includes(cleaned)) return

    setForm((current) => ({
      ...current,
      [field]: [...current[field], cleaned],
    }))
  }

  const removeTag = (
    field: 'skills' | 'interests' | 'languages' | 'career_aspirations',
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].filter((item) => item !== value),
    }))
  }

  const fillDemo = () => {
    setForm(DEMO_FORM)
    setErrors({})
    setDemoFilled(true)
  }

  /** Shows the errors and moves focus to the first problem field. */
  const reportErrors = (found: Errors) => {
    pendingFocus.current = profileFields.find((f) => found[f.key])?.key ?? null
    setErrors(found)
  }

  const goToStep = (index: number) => {
    if (index === step || index > maxReached) return
    setErrors({})
    setStep(index)
  }

  const nextStep = () => {
    const found = validateStep(step, form)
    if (Object.keys(found).length > 0) {
      reportErrors(found)
      return
    }
    if (step < steps.length - 1) {
      setErrors({})
      setStep(step + 1)
      setMaxReached((current) => Math.max(current, step + 1))
    }
  }

  const previousStep = () => {
    if (step > 0) {
      setErrors({})
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    // Re-check every step; if an earlier one has a problem, take them there.
    for (let i = 0; i < steps.length; i += 1) {
      const found = validateStep(i, form)
      if (Object.keys(found).length > 0) {
        setStep(i)
        reportErrors(found)
        return
      }
    }

    setLoading(true)
    setError(null)
    setErrors({})

    try {
      const created = await api.createProfile(toPayload(form))
      setStudent(created)
      if (created.id) {
        try {
          window.sessionStorage.setItem(STUDENT_KEY, String(created.id))
        } catch {
          /* storage unavailable: the profile stays loaded for this visit */
        }
        await loadStudentData(created.id)
      }
      setDemoFilled(false)
      selectNav('careers')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCareerForRoadmap = async (careerId: number) => {
    if (!student?.id) return
    setLoading(true)
    try {
      setSelectedCareerId(careerId)
      const p = await api.generatePathway(student.id, careerId)
      setPathway(p)
      selectNav('pathways')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleToggleMilestone = async (
    milestoneId: number,
    currentStatus: string,
  ) => {
    const newStatus =
      currentStatus === 'completed' ? 'in_progress' : 'completed'
    try {
      const updated = await api.updateMilestoneStatus(milestoneId, newStatus)
      if (pathway) {
        setPathway({
          ...pathway,
          milestones: pathway.milestones.map((m) =>
            m.id === milestoneId ? { ...m, status: updated.status } : m,
          ),
        })
      }
    } catch (err: unknown) {
      console.error('Failed to update milestone status:', err)
    }
  }

  const handleAskAdvisor = async (queryText: string) => {
    if (!student?.id || !queryText.trim()) return
    setAdvisorLoading(true)
    setError(null)
    try {
      const res = await api.askAiAdvisor(student.id, queryText)
      setAdvisorResult(res)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setAdvisorLoading(false)
    }
  }

  const initial = (student?.full_name || form.full_name || '')
    .trim()
    .charAt(0)
    .toUpperCase()
  const CurrentIcon = steps[step].icon
  const err = (key: keyof FormData) => {
    const message = errors[key]
    return message ? t(message) : undefined
  }
  void selectedCareerId

  return (
    <PortalShell
      initial={initial}
      activeNav={activeNav}
      onSelectNav={selectNav}
      lang={lang}
      onChangeLang={changeLang}
      tone={activeNav === 'careers' ? 'dark' : 'light'}
    >
      <main
        className={`content ${activeNav === 'profile' ? 'profile-page' : ''} ${
          activeNav === 'careers' ? 'content--flush' : ''
        }`}
      >
        {error && (
          <div className="api-alert" role="alert">
            <span>{error}</span>
            <button
              type="button"
              aria-label={t('dismissMessage')}
              onClick={() => setError(null)}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {activeNav === 'profile' && (
          <>
            <section className="hero">
              <div className="hero-copy">
                <span className="eyebrow">{t('heroEyebrow')}</span>
                <h1>
                  {t('heroTitleA')}
                  <em>{t('heroTitleB')}</em>
                </h1>
                <p>{t('heroText')}</p>
                {student && (
                  <p className="student-badge-pill">
                    <Check size={14} aria-hidden="true" />{' '}
                    {t('activeProfile', {
                      name: student.full_name,
                      state: optionLabel(lang, student.state),
                    })}
                  </p>
                )}
              </div>

              <HeroScene />
            </section>

            <div className="content-grid">
              <div className="content-col">
                <JourneyPath
                  step={step}
                  maxReached={maxReached}
                  perStep={completion.perStep}
                  onGo={goToStep}
                  onDemo={fillDemo}
                  lang={lang}
                />

                {demoFilled && (
                  <p className="demo-note" role="status">
                    {t('pfDemoNote')}
                  </p>
                )}

                <section
                  className="form-card"
                  aria-labelledby="form-step-title"
                >
                  <div className="form-heading">
                    <div className="heading-icon">
                      <CurrentIcon size={24} />
                    </div>

                    <div>
                      <h2 id="form-step-title" ref={headingRef} tabIndex={-1}>
                        {t(steps[step].titleKey)}
                      </h2>
                      <p>{t(steps[step].subtitleKey)}</p>
                    </div>
                  </div>

                  {Object.keys(errors).length > 0 && (
                    <p className="form-alert" role="alert">
                      {t(
                        Object.keys(errors).length === 1
                          ? 'pfFormAlertOne'
                          : 'pfFormAlertMany',
                      )}
                    </p>
                  )}

                  <div className="step-body" key={step}>
                    {step === 0 && (
                      <div className="form-content">
                        <div className="field-grid">
                          <Field
                            wide
                            id="field-full_name"
                            icon={UserRound}
                            label={t('fullName')}
                            required
                            value={form.full_name}
                            placeholder={t('fullNamePlaceholder')}
                            error={err('full_name')}
                            onChange={(value) =>
                              updateField('full_name', value)
                            }
                          />

                          <Field
                            id="field-email"
                            icon={Mail}
                            label={t('email')}
                            required
                            type="email"
                            value={form.email}
                            placeholder="you@example.com"
                            error={err('email')}
                            onChange={(value) => updateField('email', value)}
                          />

                          <Field
                            id="field-phone"
                            icon={Phone}
                            label={t('phone')}
                            type="tel"
                            value={form.phone}
                            placeholder="+91 9876543210"
                            error={err('phone')}
                            onChange={(value) => updateField('phone', value)}
                          />

                          <Field
                            id="field-age"
                            required
                            icon={Calendar}
                            label={t('age')}
                            type="number"
                            value={form.age}
                            placeholder={t('agePlaceholder')}
                            error={err('age')}
                            onChange={(value) => updateField('age', value)}
                          />

                          <SelectField
                            lang={lang}
                            id="field-gender"
                            required
                            error={err('gender')}
                            icon={Users}
                            label={t('gender')}
                            value={form.gender}
                            options={[
                              'Male',
                              'Female',
                              'Other',
                              'Prefer not to say',
                            ]}
                            onChange={(value) => updateField('gender', value)}
                          />

                          <Field
                            id="field-state"
                            required
                            error={err('state')}
                            icon={MapIcon}
                            label={t('state')}
                            value={form.state}
                            placeholder={t('statePlaceholder')}
                            onChange={(value) => updateField('state', value)}
                          />

                          <Field
                            id="field-district"
                            required
                            error={err('district')}
                            icon={MapPin}
                            label={t('district')}
                            value={form.district}
                            placeholder={t('pfDistrictPlaceholder')}
                            onChange={(value) => updateField('district', value)}
                          />

                          <SelectField
                            lang={lang}
                            id="field-location_tier"
                            icon={Building2}
                            label={t('locationTier')}
                            value={form.location_tier}
                            options={['Tier 1', 'Tier 2', 'Tier 3']}
                            hint={t('pfLocationTierHint')}
                            onChange={(value) =>
                              updateField('location_tier', value)
                            }
                          />

                          <SelectField
                            lang={lang}
                            id="field-category"
                            required
                            error={err('category')}
                            icon={Tags}
                            label={t('category')}
                            value={form.category}
                            options={['General', 'OBC', 'SC', 'ST', 'EWS']}
                            onChange={(value) => updateField('category', value)}
                          />
                        </div>
                      </div>
                    )}

                    {step === 1 && (
                      <div className="form-content">
                        <div className="field-grid">
                          <SelectField
                            lang={lang}
                            id="field-education_level"
                            icon={GraduationCap}
                            label={t('educationLevel')}
                            required
                            value={form.education_level}
                            options={[
                              '10th pass',
                              '12th pass',
                              'Diploma',
                              'Undergraduate',
                              'Postgraduate',
                            ]}
                            error={err('education_level')}
                            onChange={(value) =>
                              updateField('education_level', value)
                            }
                          />

                          <SelectField
                            lang={lang}
                            id="field-stream"
                            icon={BookOpen}
                            label={t('stream')}
                            value={form.stream}
                            options={[
                              'Science PCM',
                              'Science PCB',
                              'Commerce',
                              'Arts / Humanities',
                              'Computer Science',
                              'Vocational',
                              'Other',
                            ]}
                            onChange={(value) => updateField('stream', value)}
                          />

                          <Field
                            id="field-percentage_marks"
                            required
                            icon={Percent}
                            label={t('percentage')}
                            type="number"
                            value={form.percentage_marks}
                            placeholder={t('percentagePlaceholder')}
                            error={err('percentage_marks')}
                            onChange={(value) =>
                              updateField('percentage_marks', value)
                            }
                          />
                        </div>

                        <div className="info-box">
                          <GraduationCap size={20} />
                          <div>
                            <strong>{t('whyAskTitle')}</strong>
                            <p>{t('pfWhyAskText')}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="form-content">
                        <TagInput
                          lang={lang}
                          label={t('skills')}
                          placeholder={t('skillsPlaceholder')}
                          values={form.skills}
                          onAdd={(value) => addTag('skills', value)}
                          onRemove={(value) => removeTag('skills', value)}
                        />

                        <TagInput
                          lang={lang}
                          label={t('interests')}
                          placeholder={t('pfInterestsPlaceholder')}
                          values={form.interests}
                          onAdd={(value) => addTag('interests', value)}
                          onRemove={(value) => removeTag('interests', value)}
                        />

                        <TagInput
                          lang={lang}
                          label={t('languages')}
                          placeholder={t('languagesPlaceholder')}
                          values={form.languages}
                          onAdd={(value) => addTag('languages', value)}
                          onRemove={(value) => removeTag('languages', value)}
                        />

                        <TagInput
                          lang={lang}
                          label={t('aspirations')}
                          placeholder={t('pfAspirationsPlaceholder')}
                          values={form.career_aspirations}
                          onAdd={(value) => addTag('career_aspirations', value)}
                          onRemove={(value) =>
                            removeTag('career_aspirations', value)
                          }
                        />
                      </div>
                    )}

                    {step === 3 && (
                      <div className="form-content">
                        <div className="field-grid">
                          <Field
                            id="field-annual_family_income"
                            required
                            label={t('income')}
                            type="number"
                            value={form.annual_family_income}
                            placeholder={t('incomePlaceholder')}
                            prefix="₹"
                            error={err('annual_family_income')}
                            onChange={(value) =>
                              updateField('annual_family_income', value)
                            }
                          />

                          <SelectField
                            lang={lang}
                            id="field-financial_constraint"
                            icon={Wallet}
                            label={t('financialConstraint')}
                            value={form.financial_constraint}
                            options={['Low', 'Medium', 'High']}
                            onChange={(value) =>
                              updateField('financial_constraint', value)
                            }
                          />
                        </div>

                        <div className="income-cards">
                          <div>
                            <span>{t('incomeLow')}</span>
                            <p>{t('incomeLowText')}</p>
                          </div>

                          <div>
                            <span>{t('incomeMedium')}</span>
                            <p>{t('incomeMediumText')}</p>
                          </div>

                          <div>
                            <span>{t('incomeHigh')}</span>
                            <p>{t('pfIncomeHighText')}</p>
                          </div>
                        </div>

                        <div className="info-box">
                          <Wallet size={20} />
                          <div>
                            <strong>{t('mattersTitle')}</strong>
                            <p>{t('pfMattersText')}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="form-footer">
                    {step > 0 ? (
                      <button
                        className="secondary-button"
                        onClick={previousStep}
                      >
                        <ArrowLeft size={18} />
                        {t('back')}
                      </button>
                    ) : (
                      <span className="draft-note">
                        <Check size={15} aria-hidden="true" />
                        {t('pfDraftNote')}
                      </span>
                    )}

                    {step < steps.length - 1 ? (
                      <button className="primary-button" onClick={nextStep}>
                        {t('saveContinue')}
                        <ArrowRight size={18} />
                      </button>
                    ) : (
                      <button
                        className="primary-button"
                        onClick={handleSubmit}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            {t('saving')}
                          </>
                        ) : (
                          <>
                            {t('completeProfile')}
                            <Check size={18} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </section>
              </div>

              <aside className="info-panel">
                <JourneyScene progress={completion.percent} />

                <div className="info-copy">
                  <span className="info-rule" />
                  <h2>
                    {t('infoTitle1')}
                    <br />
                    {t('infoTitle2Pre')}
                    <em>{t('infoTitle2Em')}</em>
                    {t('infoTitle2Post')}
                  </h2>
                  <p>{t('pfInfoText')}</p>
                </div>

                <ProfileProgress completion={completion} lang={lang} />

                <ul className="info-list">
                  {infoPoints.map(({ titleKey, textKey, icon: Icon }) => (
                    <li key={titleKey}>
                      <span className="info-icon">
                        <Icon size={22} strokeWidth={1.6} />
                      </span>
                      <div>
                        <strong>{t(titleKey)}</strong>
                        <p>{t(textKey)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </>
        )}

        {activeNav === 'careers' && (
          <CareerDiscovery
            recommendations={careers}
            hasProfile={Boolean(student?.id)}
            onOpenRoadmap={handleSelectCareerForRoadmap}
            lang={lang}
          />
        )}

        {/* LEARNING ROADMAP VIEW */}
        {activeNav === 'pathways' && (
          <div className="dashboard-container">
            <div className="dashboard-top">
              <div className="dashboard-title">
                <h2>
                  {pathway
                    ? t('roadmapTitleFor', {
                        career: pathway.career_title,
                      })
                    : t('roadmapTitle')}
                </h2>

                <p>{t('roadmapSubtitle')}</p>
              </div>

              {pathway && (
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                  }}
                >
                  <span className="student-badge-pill">
                    {t('duration', {
                      n: pathway.total_estimated_duration_months,
                    })}
                  </span>

                  <span className="student-badge-pill">
                    {t('hoursPerWeek', { n: pathway.weekly_study_hours })}
                  </span>
                </div>
              )}
            </div>

            {!pathway ||
            pathway.milestones.length === 0 ? (
              <div className="empty-view">
                <BookOpen
                  size={48}
                  style={{
                    margin: '0 auto 16px',
                    color: '#16866a',
                  }}
                />

                <h3>{t('roadmapEmptyTitle')}</h3>

                <p>{t('roadmapEmptyText')}</p>

                <button
                  className="primary-button"
                  style={{ marginTop: '16px' }}
                  onClick={() => selectNav('careers')}
                >
                  {t('exploreCareersFirst')}
                </button>
              </div>
            ) : (
              <div className="milestones-flow">
                {pathway.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className={`milestone-box ${
                      milestone.status === 'completed'
                        ? 'completed'
                        : ''
                    }`}
                  >
                    <div className="milestone-step-num">
                      {milestone.status === 'completed' ? (
                        <Check size={20} />
                      ) : (
                        milestone.step_number
                      )}
                    </div>

                    <div className="milestone-body">
                      <div className="milestone-header">
                        <div>
                          <span className="milestone-stage-tag">
                            {codeLabel(lang, milestone.stage)}
                          </span>

                          <h3 className="milestone-title">
                            {milestone.title}
                          </h3>
                        </div>

                        <button
                          className={
                            milestone.status === 'completed'
                              ? 'secondary-button'
                              : 'primary-button'
                          }
                          style={{
                            padding: '6px 14px',
                            fontSize: '13px',
                          }}
                          onClick={() =>
                            handleToggleMilestone(
                              milestone.id,
                              milestone.status,
                            )
                          }
                        >
                          {milestone.status === 'completed'
                            ? t('markInProgress')
                            : t('markComplete')}
                        </button>
                      </div>

                      <p
                        style={{
                          color: '#35453d',
                          fontSize: '14px',
                          marginBottom: '8px',
                        }}
                      >
                        {milestone.description}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          gap: '12px',
                          fontSize: '13px',
                          color: '#5e6e66',
                          marginBottom: '8px',
                        }}
                      >
                        <span>
                          ⏱️{' '}
                          {t('weeks', { n: milestone.duration_weeks })}
                        </span>

                        {milestone.recommended_certification && (
                          <span>
                            📜{' '}
                            {t('cert', {
                              value: milestone.recommended_certification,
                            })}
                          </span>
                        )}

                        <span>
                          💰{' '}
                          {t('estCost', {
                            n: milestone.estimated_cost_inr,
                          })}
                        </span>
                      </div>

                      <div className="skills-wrap">
                        {milestone.skills_to_acquire.map(
                          (skill) => (
                            <span
                              key={skill}
                              className="skill-chip"
                            >
                              {skill}
                            </span>
                          ),
                        )}
                      </div>

                      {milestone.free_alternative_resource && (
                        <div className="free-resource-banner">
                          <span>
                            🎓{' '}
                            <strong>
                              {t('freeAlternative')}
                            </strong>{' '}
                            {
                              milestone.free_alternative_resource
                            }
                          </span>

                          <a
                            href={milestone.resource_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {t('accessPortal')}{' '}
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OPPORTUNITIES & SCHOLARSHIPS VIEW */}
        {activeNav === 'opportunities' && (
          <div className="dashboard-container">
            <div className="dashboard-top">
              <div className="dashboard-title">
                <h2>{t('oppsTitle')}</h2>

                <p>{t('oppsSubtitle')}</p>
              </div>

              <span className="student-badge-pill">
                🔒 {t('oppsBadge')}
              </span>
            </div>

            {opportunities.length === 0 ? (
              <div className="empty-view">
                <BriefcaseBusiness
                  size={48}
                  style={{
                    margin: '0 auto 16px',
                    color: '#16866a',
                  }}
                />

                <h3>{t('oppsEmptyTitle')}</h3>

                <p>{t('oppsEmptyText')}</p>

                <button
                  className="primary-button"
                  style={{ marginTop: '16px' }}
                  onClick={() => selectNav('profile')}
                >
                  {t('completeProfileBtn')}
                </button>
              </div>
            ) : (
              <div className="card-grid">
                {opportunities.map((item) => {
                  const opp = item.opportunity
                  const statusClass =
                    item.eligibility_status.toLowerCase()

                  return (
                    <div
                      key={opp.id}
                      className="item-card"
                    >
                      <div>
                        <div className="item-card-header">
                          <div>
                            <span className="category-tag">
                              {codeLabel(lang, opp.type)}
                            </span>

                            <h3 className="item-card-title">
                              {opp.title}
                            </h3>

                            <span className="item-card-subtitle">
                              {opp.provider}
                            </span>
                          </div>

                          <span
                            className={`eligibility-badge ${statusClass}`}
                          >
                            {eligibilityLabel(
                              lang,
                              item.eligibility_status,
                            )}
                          </span>
                        </div>

                        <div className="benefit-box">
                          <strong>
                            {
                              opp.financial_benefit_description
                            }
                          </strong>

                          <span>
                            {t('verifiedBy', {
                              value: codeLabel(lang, opp.verified_by),
                            })}
                          </span>
                        </div>

                        <p className="item-card-body">
                          {opp.description}
                        </p>

                        <div
                          style={{
                            marginBottom: '12px',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#063b2e',
                            }}
                          >
                            {t('eligibilityEvaluation')}
                          </span>

                          <ul className="reasons-list">
                            {item.reasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <a
                        href={opp.official_portal_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="primary-button"
                        style={{
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        {t('applyOfficial')}{' '}
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* AI CAREER ADVISOR VIEW */}
        {activeNav === 'advisor' && (
          <div className="dashboard-container">
            <div className="dashboard-top">
              <div className="dashboard-title">
                <h2>{t('advisorTitle')}</h2>

                <p>{t('advisorSubtitle')}</p>
              </div>

              <span className="student-badge-pill">
                <Sparkles size={16} /> {t('advisorBadge')}
              </span>
            </div>

            <div className="advisor-card">
              <h3
                style={{
                  fontSize: '18px',
                  color: '#052e24',
                  marginBottom: '8px',
                }}
              >
                {t('advisorAsk')}
              </h3>

              <p
                style={{
                  color: '#5e6e66',
                  fontSize: '14px',
                }}
              >
                {t('advisorAskText')}
              </p>

              <div className="prompt-chips">
                {[
                  t('advisorPrompt1'),
                  t('advisorPrompt2'),
                  t('advisorPrompt3'),
                  t('advisorPrompt4'),
                ].map((promptText) => (
                  <button
                    key={promptText}
                    type="button"
                    className="prompt-chip"
                    onClick={() => {
                      setAdvisorQuery(promptText)
                      handleAskAdvisor(promptText)
                    }}
                  >
                    {promptText}
                  </button>
                ))}
              </div>

              <div className="advisor-input-row">
                <input
                  type="text"
                  placeholder={t('advisorPlaceholder')}
                  value={advisorQuery}
                  onChange={(e) =>
                    setAdvisorQuery(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAskAdvisor(advisorQuery)
                    }
                  }}
                />

                <button
                  type="button"
                  className="primary-button"
                  disabled={
                    advisorLoading ||
                    !advisorQuery.trim()
                  }
                  onClick={() =>
                    handleAskAdvisor(advisorQuery)
                  }
                >
                  {advisorLoading ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <>
                      <Sparkles size={18} />
                      {t('advisorButton')}
                    </>
                  )}
                </button>
              </div>

              {advisorResult && (
                <div className="advisor-output">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                    }}
                  >
                    <strong
                      style={{
                        color: '#063b2e',
                        fontSize: '16px',
                      }}
                    >
                      {t('advisorRecommendation')}
                    </strong>

                    <span
                      style={{
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        color: '#0e6b52',
                        fontWeight: 600,
                      }}
                    >
                      {t('advisorProvider', {
                        value: advisorResult.provider,
                      })}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '15px',
                      color: '#16231e',
                      whiteSpace: 'pre-line',
                      marginBottom: '14px',
                    }}
                  >
                    {advisorResult.narrative_advice}
                  </p>

                  {advisorResult.key_takeaways &&
                    advisorResult.key_takeaways.length >
                      0 && (
                      <div
                        style={{
                          marginBottom: '12px',
                        }}
                      >
                        <strong
                          style={{
                            fontSize: '13.5px',
                            color: '#052e24',
                          }}
                        >
                          {t('keyTakeaways')}
                        </strong>

                        <div
                          className="skills-wrap"
                          style={{ marginTop: '6px' }}
                        >
                          {advisorResult.key_takeaways.map(
                            (item, i) => (
                              <span
                                key={i}
                                className="skill-chip"
                              >
                                {item}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {advisorResult.suggested_action_items &&
                    advisorResult.suggested_action_items
                      .length > 0 && (
                      <div
                        style={{
                          marginBottom: '12px',
                        }}
                      >
                        <strong
                          style={{
                            fontSize: '13.5px',
                            color: '#052e24',
                          }}
                        >
                          {t('actionSteps')}
                        </strong>

                        <ul
                          className="reasons-list"
                          style={{ marginTop: '6px' }}
                        >
                          {advisorResult.suggested_action_items.map(
                            (item, i) => (
                              <li key={i}>{item}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* EDUCATOR PORTAL (placeholder) */}
        {activeNav === 'educators' && (
          <div className="dashboard-container">
            <div className="dashboard-top">
              <div className="dashboard-title">
                <h2>{t('educatorsTitle')}</h2>

                <p>{t('educatorsSubtitle')}</p>
              </div>
            </div>

            <div className="empty-view">
              <GraduationCap
                size={48}
                style={{
                  margin: '0 auto 16px',
                  color: '#16866a',
                }}
              />

              <h3>{t('comingSoon')}</h3>

              <p>{t('educatorsText')}</p>

              <button
                className="primary-button"
                style={{ marginTop: '16px' }}
                onClick={() => selectNav('profile')}
              >
                {t('backToProfile')}
              </button>
            </div>
          </div>
        )}

        {activeNav !== 'careers' && (
          <footer className="footer-note">
            <span>UdaanPath</span>
            <span>•</span>
            <span>{t('footerTagline')}</span>
          </footer>
        )}
      </main>
    </PortalShell>
  )
}

/* ---------------- Journey path stepper ----------------------------------- */

// Node positions in the stepper's 800×120 drawing; the trail passes through
// each one, and its four segments are close to equal length.
const JOURNEY_NODES = [
  [70, 72],
  [300, 46],
  [520, 80],
  [740, 50],
] as const
const JOURNEY_D =
  'M 70 72 C 150 72, 210 46, 300 46 C 390 46, 430 80, 520 80 C 610 80, 650 50, 740 50'

function JourneyPath({
  step,
  maxReached,
  perStep,
  onGo,
  onDemo,
  lang,
}: {
  step: number
  maxReached: number
  perStep: { filled: number; total: number }[]
  onGo: (index: number) => void
  onDemo: () => void
  lang: Lang
}) {
  const trail = step / (steps.length - 1)

  return (
    <section
      className="journey-card"
      aria-label={translate(lang, 'ariaProfileProgress')}
    >
      <div className="journey-head">
        <span className="journey-kicker">
          {translate(lang, 'pfJourneyKicker')}
        </span>
        <span className="journey-tools">
          <button type="button" className="demo-button" onClick={onDemo}>
            {translate(lang, 'pfFillDemo')}
          </button>
          <span className="stepper-count">
            {translate(lang, 'stepCount', {
              step: step + 1,
              total: steps.length,
            })}
          </span>
        </span>
      </div>

      <div className="journey">
        <svg viewBox="0 0 800 120" aria-hidden="true" className="journey-svg">
          <defs>
            <linearGradient id="journey-trail" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#16866a" />
              <stop offset="1" stopColor="#6be7b2" />
            </linearGradient>
          </defs>
          <path className="journey-base" d={JOURNEY_D} />
          <path
            className="journey-glow"
            d={JOURNEY_D}
            pathLength={1}
            style={{ strokeDashoffset: 1 - trail }}
          />
          <path
            className="journey-trail"
            d={JOURNEY_D}
            pathLength={1}
            style={{ strokeDashoffset: 1 - trail }}
          />
        </svg>

        <ol className="journey-steps">
          {steps.map((item, index) => {
            const state =
              index === step
                ? 'active'
                : index < step || index <= maxReached
                  ? index < step
                    ? 'completed'
                    : 'visited'
                  : 'upcoming'
            const reachable = index <= maxReached && index !== step
            const [x, y] = JOURNEY_NODES[index]
            const { filled, total } = perStep[index]
            return (
              <li
                key={item.titleKey}
                className={`journey-step is-${state}`}
                style={{
                  left: `${(x / 800) * 100}%`,
                  top: `${(y / 120) * 100}%`,
                }}
              >
                <button
                  type="button"
                  className="journey-node"
                  onClick={() => onGo(index)}
                  disabled={!reachable}
                  aria-current={index === step ? 'step' : undefined}
                  aria-label={`${translate(lang, 'pfStepAria', {
                    n: index + 1,
                    title: translate(lang, item.titleKey),
                  })}${
                    state === 'completed'
                      ? translate(lang, 'pfStepDone')
                      : state === 'active'
                        ? translate(lang, 'pfStepCurrent')
                        : state === 'upcoming'
                          ? translate(lang, 'pfStepUpcoming')
                          : ''
                  }`}
                >
                  {state === 'completed' ? <Check size={16} /> : index + 1}
                </button>
                <span className="journey-label">
                  <strong>{translate(lang, item.titleKey)}</strong>
                  <small>
                    {translate(lang, 'pfStepFilled', { filled, total })}
                  </small>
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

/* ---------------- Real profile completion -------------------------------- */

function ProfileProgress({
  completion,
  lang,
}: {
  lang: Lang
  completion: {
    filled: number
    total: number
    percent: number
    perStep: { filled: number; total: number }[]
  }
}) {
  const R = 30
  const C = 2 * Math.PI * R

  return (
    <section className="progress-card" aria-labelledby="progress-title">
      <div className="progress-top">
        <svg viewBox="0 0 80 80" className="progress-ring" aria-hidden="true">
          <circle className="ring-base" cx="40" cy="40" r={R} />
          <circle
            className="ring-fill"
            cx="40"
            cy="40"
            r={R}
            strokeDasharray={C}
            strokeDashoffset={C * (1 - completion.percent / 100)}
          />
        </svg>
        <div>
          <h3 id="progress-title">
            <span className="progress-number">{completion.percent}%</span>{' '}
            {translate(lang, 'pfProgressComplete')}
          </h3>
          <p>
            {translate(lang, 'pfProgressDetails', {
              filled: completion.filled,
              total: completion.total,
            })}
          </p>
        </div>
      </div>
      <ul className="progress-steps">
        {steps.map((s, i) => {
          const { filled, total } = completion.perStep[i]
          return (
            <li key={s.titleKey}>
              <span>{translate(lang, s.titleKey)}</span>
              <span
                className="progress-bar"
                role="progressbar"
                aria-label={translate(lang, 'pfProgressStepAria', {
                  title: translate(lang, s.titleKey),
                })}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={filled}
              >
                <span style={{ width: `${(filled / total) * 100}%` }} />
              </span>
              <span className="progress-count">
                {filled}/{total}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/**
 * Portal chrome: dark-green sidebar + top bar. Student Profile and Career
 * Discovery have URLs; the other views switch inside the portal.
 */
function PortalShell({
  initial,
  activeNav,
  onSelectNav,
  lang,
  onChangeLang,
  tone = 'light',
  children,
}: {
  initial: string
  activeNav: NavId
  onSelectNav: (id: NavId) => void
  lang: Lang
  onChangeLang: (lang: Lang) => void
  tone?: 'light' | 'dark'
  children: ReactNode
}) {
  const t = (key: MessageKey, vars?: Vars) => translate(lang, key, vars)

  return (
    <div className={`portal ${tone === 'dark' ? 'portal--dark' : ''}`}>
      <aside className="side">
        <div className="brand">
          <LogoMark size={42} />
          <div>
            <span className="brand-name">UdaanPath</span>
            <span className="brand-tag">{t('brandTag')}</span>
          </div>
        </div>

        <nav className="side-nav" aria-label={t('ariaStudentPortal')}>
          {sideNavItems.map(({ id, labelKey, icon: Icon }) => {
            const isActive = activeNav === id
            return (
              <a
                key={id}
                className={`side-link ${isActive ? 'active' : ''}`}
                href={routedViews[id] ?? `#${id}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={(event) => {
                  event.preventDefault()
                  onSelectNav(id)
                }}
              >
                <Icon size={22} strokeWidth={1.6} />
                <span>{t(labelKey)}</span>
                {isActive && (
                  <ChevronRight size={18} className="side-chevron" />
                )}
              </a>
            )
          })}
        </nav>

        <div className="side-foot" aria-hidden="true">
          <SidebarScene />
          <div className="side-card">
            <p>
              {t('sideCardLine1')}
              <br />
              <strong>{t('sideCardLine2')}</strong>
            </p>
            <span className="side-card-arrow">
              <ArrowRight size={18} />
            </span>
          </div>
        </div>
      </aside>

      <div className="portal-main">
        <header className="topbar">
          <div className="topbar-brand">
            <LogoMark size={34} />
            <span>UdaanPath</span>
          </div>

          <nav className="top-nav" aria-label={t('ariaSiteNav')}>
            {topNav.map(({ labelKey, view }) => {
              const label = t(labelKey)
              if (!view) {
                return (
                  <a
                    key={labelKey}
                    href={routes.home}
                    onClick={linkTo(routes.home)}
                  >
                    {label}
                  </a>
                )
              }
              const isActive = view === activeNav
              return (
                <a
                  key={labelKey}
                  className={isActive ? 'active' : ''}
                  href={routedViews[view]}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={(event) => {
                    event.preventDefault()
                    onSelectNav(view)
                  }}
                >
                  {label}
                </a>
              )
            })}
          </nav>

          <div className="top-tools">
            <div className="top-search">
              <Search size={18} />
              <input
                type="search"
                placeholder={t('searchPlaceholder')}
                aria-label={t('searchAria')}
              />
            </div>

            <div
              className="top-lang"
              role="group"
              aria-label={t('ariaLanguage')}
            >
              <button
                type="button"
                className={lang === 'en' ? 'on' : ''}
                lang="en"
                aria-label={t('ariaEnglish')}
                aria-pressed={lang === 'en'}
                onClick={() => onChangeLang('en')}
              >
                EN
              </button>
              <span className="divider" />
              <button
                type="button"
                className={lang === 'hi' ? 'on' : ''}
                lang="hi"
                aria-label={t('ariaHindi')}
                aria-pressed={lang === 'hi'}
                onClick={() => onChangeLang('hi')}
              >
                HI
              </button>
            </div>

            <div className="top-user">
              <span className="avatar" aria-hidden="true">
                {initial || <UserRound size={18} />}
              </span>
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  )
}

type FieldProps = {
  id?: string
  error?: string
  label: string
  value: string
  placeholder?: string
  type?: string
  required?: boolean
  prefix?: string
  icon?: LucideIcon
  hint?: string
  wide?: boolean
  onChange: (value: string) => void
}

function Field({
  id,
  error,
  label,
  value,
  placeholder,
  type = 'text',
  required,
  prefix,
  icon: Icon,
  hint,
  wide,
  onChange,
}: FieldProps) {
  return (
    <label
      className={`field ${wide ? 'field--wide' : ''} ${error ? 'has-error' : ''}`}
    >
      <span>
        {label} {required && <b aria-hidden="true">*</b>}
      </span>

      <div
        className={`input-wrapper ${prefix ? 'has-prefix' : ''} ${
          Icon ? 'has-icon' : ''
        }`}
      >
        {Icon && <Icon size={18} className="field-icon" />}
        {prefix && <span className="prefix">{prefix}</span>}

        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error && id ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>

      {error ? (
        <small className="field-error" id={id ? `${id}-error` : undefined}>
          {error}
        </small>
      ) : (
        hint && <small className="field-hint">{hint}</small>
      )}
    </label>
  )
}

type SelectProps = {
  lang: Lang
  id?: string
  error?: string
  label: string
  value: string
  options: string[]
  required?: boolean
  icon?: LucideIcon
  hint?: string
  onChange: (value: string) => void
}

function SelectField({
  lang,
  id,
  error,
  label,
  value,
  options,
  required,
  icon: Icon,
  hint,
  onChange,
}: SelectProps) {
  return (
    <label className={`field ${error ? 'has-error' : ''}`}>
      <span>
        {label} {required && <b aria-hidden="true">*</b>}
      </span>

      <div
        className={`input-wrapper select-wrapper ${Icon ? 'has-icon' : ''} ${
          value === '' ? 'is-empty' : ''
        }`}
      >
        {Icon && <Icon size={18} className="field-icon" />}

        <select
          id={id}
          value={value}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error && id ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">
            {translate(lang, 'selectPrompt', {
              label: lang === 'en' ? label.toLowerCase() : label,
            })}
          </option>

          {options.map((option) => (
            <option key={option} value={option}>
              {optionLabel(lang, option)}
            </option>
          ))}
        </select>

        <ChevronDown size={18} className="select-chevron" />
      </div>

      {error ? (
        <small className="field-error" id={id ? `${id}-error` : undefined}>
          {error}
        </small>
      ) : (
        hint && <small className="field-hint">{hint}</small>
      )}
    </label>
  )
}

type TagInputProps = {
  lang: Lang
  label: string
  placeholder: string
  values: string[]
  onAdd: (value: string) => void
  onRemove: (value: string) => void
}

function TagInput({
  lang,
  label,
  placeholder,
  values,
  onAdd,
  onRemove,
}: TagInputProps) {
  const [input, setInput] = useState('')

  const handleAdd = () => {
    if (!input.trim()) return

    onAdd(input)
    setInput('')
  }

  return (
    <div className="tag-field">
      <label>{label}</label>

      <div className="tag-input">
        <input
          value={input}
          placeholder={placeholder}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              handleAdd()
            }
          }}
        />

        <button type="button" onClick={handleAdd}>
          <Plus size={18} />
          {translate(lang, 'addTag')}
        </button>
      </div>

      <div className="tags">
        {values.map((value) => (
          <span className="tag" key={value}>
            {optionLabel(lang, value)}

            <button
              type="button"
              aria-label={translate(lang, 'removeItem', {
                value: optionLabel(lang, value),
              })}
              onClick={() => onRemove(value)}
            >
              <X size={13} />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

export default App
