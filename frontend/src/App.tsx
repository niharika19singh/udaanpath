import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  BriefcaseBusiness,
  Brain,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Compass,
  GraduationCap,
  Mail,
  Map as MapIcon,
  MapPin,
  Percent,
  Phone,
  Plus,
  Search,
  Sprout,
  Tags,
  UserRound,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { HeroScene, JourneyScene, LogoMark, SidebarScene } from './ProfileArt'
import { linkTo, routes, type Route } from './router.ts'
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

const sideNav: { label: string; icon: LucideIcon; href?: Route }[] = [
  { label: 'Student Profile', icon: UserRound, href: routes.onboarding },
  { label: 'Career Discovery', icon: Compass, href: routes.careers },
  { label: 'Learning Roadmap', icon: BookOpen },
  { label: 'Opportunities', icon: BriefcaseBusiness },
  { label: 'Saved', icon: Bookmark },
]

const topNav = [
  'Home',
  'Explore Careers',
  'Learning Paths',
  'Opportunities',
  'For Educators',
]

const topLinks: Partial<Record<string, Route>> = {
  Home: routes.home,
  'Explore Careers': routes.careers,
}

const infoPoints: { title: string; text: string; icon: LucideIcon }[] = [
  {
    title: 'Career paths that fit you',
    text: 'Compare real careers by interest in Career Discovery.',
    icon: Compass,
  },
  {
    title: 'Learning plans you can follow',
    text: 'Step-by-step roadmaps with free course options (coming soon).',
    icon: BookOpen,
  },
  {
    title: 'Scholarships worth exploring',
    text: 'Eligibility checks for scholarships and schemes (coming soon).',
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
    if (form.age.trim()) {
      const age = Number(form.age)
      if (!Number.isInteger(age) || age < 10 || age > 100) {
        errors.age = 'Please enter an age between 10 and 100.'
      }
    }
  }
  if (step === 1) {
    if (!form.education_level) {
      errors.education_level = 'Please choose your highest education level.'
    }
    if (form.percentage_marks.trim()) {
      const marks = Number(form.percentage_marks)
      if (Number.isNaN(marks) || marks < 0 || marks > 100) {
        errors.percentage_marks = 'Marks should be a percentage from 0 to 100.'
      }
    }
  }
  if (step === 3 && form.annual_family_income.trim()) {
    const income = Number(form.annual_family_income)
    if (Number.isNaN(income) || income < 0) {
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

function App() {
  const [draft] = useState(readDraft)
  const [step, setStep] = useState(draft?.step ?? 0)
  const [maxReached, setMaxReached] = useState(draft?.maxReached ?? 0)
  const [form, setForm] = useState<FormData>(draft?.form ?? initialForm)
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)
  // Field to focus once the errors have rendered (set when validation fails).
  const pendingFocus = useRef<keyof FormData | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const shownView = useRef(`${step}-${submitted}`)

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
    const view = `${step}-${submitted}`
    if (shownView.current === view) return
    shownView.current = view
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
  }, [step, submitted])

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

  /** Shows the errors and moves focus to the first problem field. */
  const reportErrors = (found: Errors) => {
    pendingFocus.current =
      profileFields.find((f) => found[f.key])?.key ?? null
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

  const handleSubmit = () => {
    // Re-check every step; if an earlier one has a problem, take them there.
    for (let i = 0; i < steps.length; i += 1) {
      const found = validateStep(i, form)
      if (Object.keys(found).length > 0) {
        setStep(i)
        reportErrors(found)
        return
      }
    }

    console.log('Student profile:', form)

    // This object is ready to be sent to:
    // POST /api/v1/profiles/

    setErrors({})
    setSubmitted(true)
  }

  const initial = form.full_name.trim().charAt(0).toUpperCase()

  if (submitted) {
    return (
      <PortalShell initial={initial}>
        <main className="content">
          <div className="success-card">
            <div className="success-icon">
              <Check size={34} />
            </div>

            <span className="eyebrow">PROFILE COMPLETE</span>

            <h1 ref={headingRef} tabIndex={-1}>
              You&apos;re all set, {form.full_name || 'Student'}!
            </h1>

            <p>
              Your profile is {completion.percent}% complete. It is kept in
              this browser tab for now; saving it to your UdaanPath account is
              not connected yet.
            </p>

            <div className="success-actions">
              <button
                className="secondary-button"
                onClick={() => {
                  setSubmitted(false)
                  setStep(0)
                }}
              >
                Edit profile
              </button>
              <a
                className="primary-button"
                href={routes.careers}
                onClick={linkTo(routes.careers)}
              >
                Explore careers
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </main>
      </PortalShell>
    )
  }

  const CurrentIcon = steps[step].icon
  const err = (key: keyof FormData) => errors[key]

  return (
    <PortalShell initial={initial}>
      <main className="content profile-page">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">YOUR STARTING POINT</span>
            <h1>
              Let&apos;s build your <em>path forward.</em>
            </h1>
            <p>
              A few details help us recommend careers, learning resources and
              opportunities that fit you.
            </p>
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
            />

            <section className="form-card" aria-labelledby="form-step-title">
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
                  {Object.keys(errors).length === 1 ? 'field' : 'fields'} below.
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
                        onChange={(value) => updateField('full_name', value)}
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
                        icon={Users}
                        label="Gender"
                        value={form.gender}
                        options={['Male', 'Female', 'Other', 'Prefer not to say']}
                        onChange={(value) => updateField('gender', value)}
                      />

                      <Field
                        id="field-state"
                        icon={MapIcon}
                        label="State"
                        value={form.state}
                        placeholder="e.g. Uttar Pradesh"
                        onChange={(value) => updateField('state', value)}
                      />

                      <Field
                        id="field-district"
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
                        onChange={(value) => updateField('location_tier', value)}
                      />

                      <SelectField
                        id="field-category"
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
                          careers and opportunities that match your eligibility.
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
                        <p>Some financial limitations may affect choices.</p>
                      </div>

                      <div>
                        <span>HIGH</span>
                        <p>
                          Cost-effective paths and financial aid are important.
                        </p>
                      </div>
                    </div>

                    <div className="info-box">
                      <Wallet size={20} />
                      <div>
                        <strong>Your information matters</strong>
                        <p>
                          This information helps UdaanPath prioritize affordable
                          education, scholarships, schemes and low-barrier
                          career paths.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-footer">
                {step > 0 ? (
                  <button className="secondary-button" onClick={previousStep}>
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
                  <button className="primary-button" onClick={handleSubmit}>
                    Complete profile
                    <Check size={18} />
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

        <footer className="footer-note">
          <span>UdaanPath</span>
          <span>•</span>
          <span>Personalized pathways for every student</span>
        </footer>
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
}: {
  step: number
  maxReached: number
  perStep: { filled: number; total: number }[]
  onGo: (index: number) => void
}) {
  const trail = step / (steps.length - 1)

  return (
    <section className="journey-card" aria-label="Profile progress">
      <div className="journey-head">
        <span className="journey-kicker">Your journey</span>
        <span className="stepper-count">
          Step {step + 1} of {steps.length}
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
                style={{ left: `${(x / 800) * 100}%`, top: `${(y / 120) * 100}%` }}
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
 * Portal chrome: dark-green sidebar + top bar. Entries with an `href` are
 * real pages; the rest are visual placeholders until those pages exist.
 */
export function PortalShell({
  initial,
  children,
  active = 'Student Profile',
  tone = 'light',
}: {
  initial: string
  children: ReactNode
  active?: string
  tone?: 'light' | 'dark'
}) {
  const topActive = active === 'Career Discovery' ? 'Explore Careers' : 'Home'

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
          {sideNav.map(({ label, icon: Icon, href }) => {
            const isActive = label === active
            return (
              <a
                key={label}
                className={`side-link ${isActive ? 'active' : ''}`}
                href={href}
                onClick={href ? linkTo(href) : undefined}
                aria-current={isActive ? 'page' : undefined}
                aria-disabled={href ? undefined : true}
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
              const href = topLinks[label]
              const isActive = label === topActive
              return (
                <a
                  key={label}
                  className={isActive ? 'active' : ''}
                  href={href}
                  onClick={href ? linkTo(href) : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  aria-disabled={href ? undefined : true}
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
                placeholder="Search careers, skills, scholarships..."
                aria-label="Search careers, skills, scholarships"
                disabled
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