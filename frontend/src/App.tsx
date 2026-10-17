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

const steps = [
  {
    title: 'About You',
    subtitle: "Let's start with some basic information.",
    icon: Sprout,
  },
  {
    title: 'Education',
    subtitle: 'Help us understand your academic background',
    icon: GraduationCap,
  },
  {
    title: 'Skills & Interests',
    subtitle: 'What are you good at and what interests you?',
    icon: Brain,
  },
  {
    title: 'Financial Background',
    subtitle: 'This helps us find suitable opportunities for you',
    icon: Wallet,
  },
]

type NavId = 'profile' | 'careers' | 'pathways' | 'opportunities' | 'advisor'

const sideNavItems: { id: NavId; label: string; icon: LucideIcon }[] = [
  { id: 'profile', label: 'Student Profile', icon: UserRound },
  { id: 'careers', label: 'Career Discovery', icon: Compass },
  { id: 'pathways', label: 'Learning Roadmap', icon: BookOpen },
  { id: 'opportunities', label: 'Opportunities', icon: BriefcaseBusiness },
  { id: 'advisor', label: 'AI Advisor', icon: Brain },
]

/** Each portal view has its own URL so Back/Forward moves between them. */
const routedViews: Record<NavId, Route> = {
  profile: routes.onboarding,
  careers: routes.careers,
  pathways: routes.roadmap,
  opportunities: routes.opportunities,
  advisor: routes.advisor,
}

const topNav = [
  'Home',
  'Explore Careers',
  'Learning Paths',
  'Opportunities',
  'For Educators',
]

const infoPoints: { title: string; text: string; icon: LucideIcon }[] = [
  {
    title: 'Career paths that fit you',
    text: 'Compare real careers and see how each matches your profile.',
    icon: Compass,
  },
  {
    title: 'Learning plans you can follow',
    text: '4-stage roadmaps with free SWAYAM and NPTEL options for a career you pick.',
    icon: BookOpen,
  },
  {
    title: 'Scholarships worth exploring',
    text: 'Schemes, scholarships and apprenticeships checked against your profile.',
    icon: BriefcaseBusiness,
  },
]

type Errors = Partial<Record<keyof FormData, string>>

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
  const need = (key: keyof FormData, message: string) => {
    if (!String(form[key]).trim()) errors[key] = message
  }
  if (step === 0) {
    if (form.full_name.trim().length < 2) {
      errors.full_name = 'Please enter your full name.'
    }
    if (!form.email.trim()) {
      errors.email = 'Please enter your email address.'
    } else if (!EMAIL_RE.test(form.email.trim())) {
      errors.email = 'Please enter a valid email, like name@example.com.'
    }
    if (form.phone.trim() && form.phone.replace(/\D/g, '').length < 10) {
      errors.phone = 'Phone numbers need at least 10 digits.'
    }
    const age = Number(form.age)
    if (!form.age.trim()) {
      errors.age = 'Please enter your age.'
    } else if (!Number.isInteger(age) || age < 12 || age > 60) {
      errors.age = 'Please enter an age between 12 and 60.'
    }
    need('gender', 'Please choose an option.')
    need('category', 'Please choose your category.')
    if (form.state.trim().length < 2) errors.state = 'Please enter your state.'
    if (form.district.trim().length < 2) {
      errors.district = 'Please enter your district.'
    }
  }
  if (step === 1) {
    need('education_level', 'Please choose your highest education level.')
    const marks = Number(form.percentage_marks)
    if (!form.percentage_marks.trim()) {
      errors.percentage_marks = 'Please enter your percentage.'
    } else if (Number.isNaN(marks) || marks < 0 || marks > 100) {
      errors.percentage_marks = 'Marks should be a percentage from 0 to 100.'
    }
  }
  if (step === 3) {
    const income = Number(form.annual_family_income)
    if (!form.annual_family_income.trim()) {
      errors.annual_family_income = 'Please enter an amount (0 is fine).'
    } else if (Number.isNaN(income) || income < 0) {
      errors.annual_family_income = 'Please enter an amount of 0 or more.'
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
  const err = (key: keyof FormData) => errors[key]
  void selectedCareerId

  return (
    <PortalShell
      initial={initial}
      activeNav={activeNav}
      onSelectNav={selectNav}
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
              aria-label="Dismiss message"
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
                <span className="eyebrow">YOUR STARTING POINT</span>
                <h1>
                  Let&apos;s build your <em>path forward.</em>
                </h1>
                <p>
                  A few details help us recommend careers, learning resources
                  and opportunities that fit you.
                </p>
                {student && (
                  <p className="student-badge-pill">
                    <Check size={14} aria-hidden="true" /> Active profile:{' '}
                    {student.full_name} ({student.state})
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
                />

                {demoFilled && (
                  <p className="demo-note" role="status">
                    Demo values are filled in. Replace them with your own
                    details before you submit.
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
                        {steps[step].title}
                      </h2>
                      <p>{steps[step].subtitle}</p>
                    </div>
                  </div>

                  {Object.keys(errors).length > 0 && (
                    <p className="form-alert" role="alert">
                      Please check the highlighted{' '}
                      {Object.keys(errors).length === 1 ? 'field' : 'fields'}{' '}
                      below.
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
                            label="Full name"
                            required
                            value={form.full_name}
                            placeholder="Enter your full name"
                            error={err('full_name')}
                            onChange={(value) =>
                              updateField('full_name', value)
                            }
                          />

                          <Field
                            id="field-email"
                            icon={Mail}
                            label="Email address"
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
                            label="Phone number"
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
                            label="Age"
                            type="number"
                            value={form.age}
                            placeholder="e.g. 19"
                            error={err('age')}
                            onChange={(value) => updateField('age', value)}
                          />

                          <SelectField
                            id="field-gender"
                            required
                            error={err('gender')}
                            icon={Users}
                            label="Gender"
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
                            label="State"
                            value={form.state}
                            placeholder="e.g. Uttar Pradesh"
                            onChange={(value) => updateField('state', value)}
                          />

                          <Field
                            id="field-district"
                            required
                            error={err('district')}
                            icon={MapPin}
                            label="District"
                            value={form.district}
                            placeholder="Enter your city, town or district"
                            onChange={(value) => updateField('district', value)}
                          />

                          <SelectField
                            id="field-location_tier"
                            icon={Building2}
                            label="Location tier"
                            value={form.location_tier}
                            options={['Tier 1', 'Tier 2', 'Tier 3']}
                            hint="This helps us show you relevant opportunities in your area."
                            onChange={(value) =>
                              updateField('location_tier', value)
                            }
                          />

                          <SelectField
                            id="field-category"
                            required
                            error={err('category')}
                            icon={Tags}
                            label="Category"
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
                            id="field-education_level"
                            icon={GraduationCap}
                            label="Highest education level"
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
                            id="field-stream"
                            icon={BookOpen}
                            label="Stream"
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
                            label="Percentage / marks"
                            type="number"
                            value={form.percentage_marks}
                            placeholder="e.g. 78.5"
                            error={err('percentage_marks')}
                            onChange={(value) =>
                              updateField('percentage_marks', value)
                            }
                          />
                        </div>

                        <div className="info-box">
                          <GraduationCap size={20} />
                          <div>
                            <strong>Why do we ask this?</strong>
                            <p>
                              Your education level and stream help us identify
                              careers and opportunities that match your
                              eligibility.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="form-content">
                        <TagInput
                          label="Skills"
                          placeholder="e.g. Python, Excel, Communication"
                          values={form.skills}
                          onAdd={(value) => addTag('skills', value)}
                          onRemove={(value) => removeTag('skills', value)}
                        />

                        <TagInput
                          label="Interests"
                          placeholder="e.g. Technology, Solar Energy, Finance"
                          values={form.interests}
                          onAdd={(value) => addTag('interests', value)}
                          onRemove={(value) => removeTag('interests', value)}
                        />

                        <TagInput
                          label="Languages"
                          placeholder="e.g. Hindi, English"
                          values={form.languages}
                          onAdd={(value) => addTag('languages', value)}
                          onRemove={(value) => removeTag('languages', value)}
                        />

                        <TagInput
                          label="Career aspirations"
                          placeholder="e.g. Data Analyst, Software Engineer"
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
                            label="Annual family income"
                            type="number"
                            value={form.annual_family_income}
                            placeholder="e.g. 180000"
                            prefix="₹"
                            error={err('annual_family_income')}
                            onChange={(value) =>
                              updateField('annual_family_income', value)
                            }
                          />

                          <SelectField
                            id="field-financial_constraint"
                            icon={Wallet}
                            label="Financial constraint level"
                            value={form.financial_constraint}
                            options={['Low', 'Medium', 'High']}
                            onChange={(value) =>
                              updateField('financial_constraint', value)
                            }
                          />
                        </div>

                        <div className="income-cards">
                          <div>
                            <span>LOW</span>
                            <p>Financial support is generally available.</p>
                          </div>

                          <div>
                            <span>MEDIUM</span>
                            <p>
                              Some financial limitations may affect choices.
                            </p>
                          </div>

                          <div>
                            <span>HIGH</span>
                            <p>
                              Cost-effective paths and financial aid are
                              important.
                            </p>
                          </div>
                        </div>

                        <div className="info-box">
                          <Wallet size={20} />
                          <div>
                            <strong>Your information matters</strong>
                            <p>
                              This information helps UdaanPath prioritize
                              affordable education, scholarships, schemes and
                              low-barrier career paths.
                            </p>
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
                        Back
                      </button>
                    ) : (
                      <span className="draft-note">
                        <Check size={15} aria-hidden="true" />
                        Your answers stay in this tab as you go.
                      </span>
                    )}

                    {step < steps.length - 1 ? (
                      <button className="primary-button" onClick={nextStep}>
                        Save &amp; Continue
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
                            Saving…
                          </>
                        ) : (
                          <>
                            Complete profile
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
                    Every path
                    <br />
                    starts <em>somewhere</em>
                  </h2>
                  <p>
                    Your profile is the starting point for career, learning and
                    scholarship guidance on UdaanPath.
                  </p>
                </div>

                <ProfileProgress completion={completion} />

                <ul className="info-list">
                  {infoPoints.map(({ title, text, icon: Icon }) => (
                    <li key={title}>
                      <span className="info-icon">
                        <Icon size={22} strokeWidth={1.6} />
                      </span>
                      <div>
                        <strong>{title}</strong>
                        <p>{text}</p>
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
          />
        )}

        {/* LEARNING ROADMAP VIEW */}
        {activeNav === 'pathways' && (
          <div className="dashboard-container">
            <div className="dashboard-top">
              <div className="dashboard-title">
                <h2>
                  {pathway
                    ? `${pathway.career_title} Learning Roadmap`
                    : 'Learning Roadmap'}
                </h2>
                <p>
                  4-stage milestone pathway with certified free SWAYAM/NPTEL
                  alternative resources.
                </p>
              </div>
              {pathway && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span className="student-badge-pill">
                    Duration: ~{pathway.total_estimated_duration_months} Months
                  </span>
                  <span className="student-badge-pill">
                    {pathway.weekly_study_hours} hrs / week
                  </span>
                </div>
              )}
            </div>

            {!pathway || pathway.milestones.length === 0 ? (
              <div className="empty-view">
                <BookOpen
                  size={48}
                  style={{ margin: '0 auto 16px', color: '#16866a' }}
                />
                <h3>No roadmap loaded yet</h3>
                <p>
                  Select a career from Career Discovery to generate a structured
                  4-stage roadmap.
                </p>
                <button
                  className="primary-button"
                  style={{ marginTop: '16px' }}
                  onClick={() => selectNav('careers')}
                >
                  Explore Careers First
                </button>
              </div>
            ) : (
              <div className="milestones-flow">
                {pathway.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className={`milestone-box ${
                      milestone.status === 'completed' ? 'completed' : ''
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
                            {milestone.stage}
                          </span>
                          <h3 className="milestone-title">{milestone.title}</h3>
                        </div>
                        <button
                          className={
                            milestone.status === 'completed'
                              ? 'secondary-button'
                              : 'primary-button'
                          }
                          style={{ padding: '6px 14px', fontSize: '13px' }}
                          onClick={() =>
                            handleToggleMilestone(
                              milestone.id,
                              milestone.status,
                            )
                          }
                        >
                          {milestone.status === 'completed'
                            ? 'Mark In Progress'
                            : 'Mark Complete'}
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
                        <span>⏱️ {milestone.duration_weeks} Weeks</span>
                        {milestone.recommended_certification && (
                          <span>
                            📜 Cert: {milestone.recommended_certification}
                          </span>
                        )}
                        <span>
                          💰 Est. Cost: ₹{milestone.estimated_cost_inr}
                        </span>
                      </div>

                      <div className="skills-wrap">
                        {milestone.skills_to_acquire.map((skill) => (
                          <span key={skill} className="skill-chip">
                            {skill}
                          </span>
                        ))}
                      </div>

                      {milestone.free_alternative_resource && (
                        <div className="free-resource-banner">
                          <span>
                            🎓 <strong>Free Alternative:</strong>{' '}
                            {milestone.free_alternative_resource}
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
                            Access Portal <ExternalLink size={13} />
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
                <h2>Verified Opportunities &amp; Scholarships</h2>
                <p>
                  Official government welfare schemes, scholarships, and
                  apprenticeships evaluated with deterministic rules.
                </p>
              </div>
              <span className="student-badge-pill">
                🔒 100% Traceable Indian Schemes
              </span>
            </div>

            {opportunities.length === 0 ? (
              <div className="empty-view">
                <BriefcaseBusiness
                  size={48}
                  style={{ margin: '0 auto 16px', color: '#16866a' }}
                />
                <h3>No opportunities evaluated yet</h3>
                <p>
                  Complete your student profile to evaluate eligibility across
                  national schemes.
                </p>
                <button
                  className="primary-button"
                  style={{ marginTop: '16px' }}
                  onClick={() => selectNav('profile')}
                >
                  Complete Profile
                </button>
              </div>
            ) : (
              <div className="card-grid">
                {opportunities.map((item) => {
                  const opp = item.opportunity
                  const statusClass = item.eligibility_status.toLowerCase()
                  return (
                    <div key={opp.id} className="item-card">
                      <div>
                        <div className="item-card-header">
                          <div>
                            <span className="category-tag">
                              {opp.type.replace(/_/g, ' ')}
                            </span>
                            <h3 className="item-card-title">{opp.title}</h3>
                            <span className="item-card-subtitle">
                              {opp.provider}
                            </span>
                          </div>
                          <span className={`eligibility-badge ${statusClass}`}>
                            {item.eligibility_status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div className="benefit-box">
                          <strong>{opp.financial_benefit_description}</strong>
                          <span>Verified by: {opp.verified_by}</span>
                        </div>

                        <p className="item-card-body">{opp.description}</p>

                        <div style={{ marginBottom: '12px' }}>
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#063b2e',
                            }}
                          >
                            Eligibility Evaluation:
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
                        Apply on Official Portal <ExternalLink size={16} />
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
                <h2>AI Career &amp; Education Advisor</h2>
                <p>
                  Powered by Gemini LLM with zero-failure deterministic rule
                  fallback. Ask any questions about careers, schemes, or
                  preparation.
                </p>
              </div>
              <span className="student-badge-pill">
                <Sparkles size={16} /> Intelligent Guidance
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
                Ask your question
              </h3>
              <p style={{ color: '#5e6e66', fontSize: '14px' }}>
                Get tailored advice grounded in official Indian schemes and free
                educational resources.
              </p>

              <div className="prompt-chips">
                {[
                  'What high-paying vocational careers can I start after 12th?',
                  'How can I get government funding for my skill development?',
                  'What are the job prospects and salary for Solar PV Technicians in India?',
                  'Suggest free online certifications recognized by employers.',
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
                  placeholder="e.g. Which scholarship is best for girls in engineering with low family income?"
                  value={advisorQuery}
                  onChange={(e) => setAdvisorQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAskAdvisor(advisorQuery)
                  }}
                />
                <button
                  type="button"
                  className="primary-button"
                  disabled={advisorLoading || !advisorQuery.trim()}
                  onClick={() => handleAskAdvisor(advisorQuery)}
                >
                  {advisorLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Ask Advisor
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
                    <strong style={{ color: '#063b2e', fontSize: '16px' }}>
                      Advisor Recommendation:
                    </strong>
                    <span
                      style={{
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        color: '#0e6b52',
                        fontWeight: 600,
                      }}
                    >
                      Provider: {advisorResult.provider}
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
                    advisorResult.key_takeaways.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <strong
                          style={{ fontSize: '13.5px', color: '#052e24' }}
                        >
                          Key Takeaways:
                        </strong>
                        <div
                          className="skills-wrap"
                          style={{ marginTop: '6px' }}
                        >
                          {advisorResult.key_takeaways.map((item, i) => (
                            <span key={i} className="skill-chip">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {advisorResult.suggested_action_items &&
                    advisorResult.suggested_action_items.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <strong
                          style={{ fontSize: '13.5px', color: '#052e24' }}
                        >
                          Action Steps:
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

        {activeNav !== 'careers' && (
          <footer className="footer-note">
            <span>UdaanPath</span>
            <span>•</span>
            <span>Personalized pathways for every student</span>
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
}: {
  step: number
  maxReached: number
  perStep: { filled: number; total: number }[]
  onGo: (index: number) => void
  onDemo: () => void
}) {
  const trail = step / (steps.length - 1)

  return (
    <section className="journey-card" aria-label="Profile progress">
      <div className="journey-head">
        <span className="journey-kicker">Your journey</span>
        <span className="journey-tools">
          <button type="button" className="demo-button" onClick={onDemo}>
            Fill demo profile
          </button>
          <span className="stepper-count">
            Step {step + 1} of {steps.length}
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
                key={item.title}
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
                  aria-label={`Step ${index + 1}: ${item.title}${
                    state === 'completed'
                      ? ', done'
                      : state === 'active'
                        ? ', current step'
                        : state === 'upcoming'
                          ? ', not reached yet'
                          : ''
                  }`}
                >
                  {state === 'completed' ? <Check size={16} /> : index + 1}
                </button>
                <span className="journey-label">
                  <strong>{item.title}</strong>
                  <small>
                    {filled}/{total} filled
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
}: {
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
            complete
          </h3>
          <p>
            {completion.filled} of {completion.total} details added
          </p>
        </div>
      </div>
      <ul className="progress-steps">
        {steps.map((s, i) => {
          const { filled, total } = completion.perStep[i]
          return (
            <li key={s.title}>
              <span>{s.title}</span>
              <span
                className="progress-bar"
                role="progressbar"
                aria-label={`${s.title} details`}
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
  tone = 'light',
  children,
}: {
  initial: string
  activeNav: NavId
  onSelectNav: (id: NavId) => void
  tone?: 'light' | 'dark'
  children: ReactNode
}) {
  return (
    <div className={`portal ${tone === 'dark' ? 'portal--dark' : ''}`}>
      <aside className="side">
        <div className="brand">
          <LogoMark size={42} />
          <div>
            <span className="brand-name">UdaanPath</span>
            <span className="brand-tag">LEARN · EXPLORE · GROW</span>
          </div>
        </div>

        <nav className="side-nav" aria-label="Student portal">
          {sideNavItems.map(({ id, label, icon: Icon }) => {
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
                <span>{label}</span>
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
              Different backgrounds.
              <br />
              <strong>Brighter futures.</strong>
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

          <nav className="top-nav" aria-label="Site">
            {topNav.map((label) => {
              const isActive =
                label === 'Explore Careers' && activeNav === 'careers'
              if (label === 'Home') {
                return (
                  <a
                    key={label}
                    href={routes.home}
                    onClick={linkTo(routes.home)}
                  >
                    {label}
                  </a>
                )
              }
              if (label === 'Explore Careers') {
                return (
                  <a
                    key={label}
                    className={isActive ? 'active' : ''}
                    href={routes.careers}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={(event) => {
                      event.preventDefault()
                      onSelectNav('careers')
                    }}
                  >
                    {label}
                  </a>
                )
              }
              return (
                <a key={label} aria-disabled="true">
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
                placeholder="Search careers, skills, scholarships..."
                aria-label="Search careers, skills, scholarships"
              />
            </div>

            <div className="top-lang" aria-label="Language">
              <span className="on">EN</span>
              <span className="divider" />
              <span>HI</span>
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
          <option value="">Select {label.toLowerCase()}</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
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
  label: string
  placeholder: string
  values: string[]
  onAdd: (value: string) => void
  onRemove: (value: string) => void
}

function TagInput({
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
          Add
        </button>
      </div>

      <div className="tags">
        {values.map((value) => (
          <span className="tag" key={value}>
            {value}

            <button type="button" onClick={() => onRemove(value)}>
              <X size={13} />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

export default App
