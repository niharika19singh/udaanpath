import { useState } from 'react'
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
import { HeroScene, LogoMark, SidebarScene, SproutScene } from './ProfileArt'
import { linkTo, routes, type Route } from './router.ts'
import './App.css'

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
    text: 'Explore options based on your strengths and interests.',
    icon: Compass,
  },
  {
    title: 'Learning plans you can follow',
    text: 'Get step-by-step guidance with relevant resources.',
    icon: BookOpen,
  },
  {
    title: 'Scholarships worth exploring',
    text: 'Find schemes and opportunities you may be eligible for.',
    icon: BriefcaseBusiness,
  },
]

function App() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(initialForm)
  const [submitted, setSubmitted] = useState(false)

  const updateField = (field: keyof FormData, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
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

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep((current) => current + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const previousStep = () => {
    if (step > 0) {
      setStep((current) => current - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = () => {
    console.log('Student profile:', form)

    // This object is ready to be sent to:
    // POST /api/v1/profiles/

    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

            <h1>You&apos;re all set, {form.full_name || 'Student'}!</h1>

            <p>
              Your profile has been captured successfully. We&apos;ll use your
              academic background, skills, interests and financial situation to
              personalize your UdaanPath journey.
            </p>

            <button
              className="primary-button"
              onClick={() => {
                setSubmitted(false)
                setStep(0)
              }}
            >
              Edit profile
            </button>
          </div>
        </main>
      </PortalShell>
    )
  }

  const CurrentIcon = steps[step].icon

  return (
    <PortalShell initial={initial}>
      <main className="content">
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
            <section className="stepper-card" aria-label="Profile progress">
              <ol className="stepper">
                {steps.map((item, index) => (
                  <li
                    key={item.title}
                    className={`stepper-item ${
                      index === step ? 'active' : ''
                    } ${index < step ? 'completed' : ''}`}
                    aria-current={index === step ? 'step' : undefined}
                  >
                    <span className="stepper-dot">
                      {index < step ? <Check size={16} /> : index + 1}
                    </span>
                    <span className="stepper-label">{item.title}</span>
                  </li>
                ))}
              </ol>

              <span className="stepper-count">
                Step {step + 1} of {steps.length}
              </span>
            </section>

            <section className="form-card">
              <div className="form-heading">
                <div className="heading-icon">
                  <CurrentIcon size={24} />
                </div>

                <div>
                  <h2>{steps[step].title}</h2>
                  <p>{steps[step].subtitle}</p>
                </div>
              </div>

              {step === 0 && (
                <div className="form-content">
                  <div className="field-grid">
                    <Field
                      wide
                      icon={UserRound}
                      label="Full name"
                      required
                      value={form.full_name}
                      placeholder="Enter your full name"
                      onChange={(value) => updateField('full_name', value)}
                    />

                    <Field
                      icon={Mail}
                      label="Email address"
                      required
                      type="email"
                      value={form.email}
                      placeholder="you@example.com"
                      onChange={(value) => updateField('email', value)}
                    />

                    <Field
                      icon={Phone}
                      label="Phone number"
                      value={form.phone}
                      placeholder="+91 9876543210"
                      onChange={(value) => updateField('phone', value)}
                    />

                    <Field
                      icon={Calendar}
                      label="Age"
                      type="number"
                      value={form.age}
                      placeholder="e.g. 19"
                      onChange={(value) => updateField('age', value)}
                    />

                    <SelectField
                      icon={Users}
                      label="Gender"
                      value={form.gender}
                      options={['Male', 'Female', 'Other', 'Prefer not to say']}
                      onChange={(value) => updateField('gender', value)}
                    />

                    <Field
                      icon={MapIcon}
                      label="State"
                      value={form.state}
                      placeholder="e.g. Uttar Pradesh"
                      onChange={(value) => updateField('state', value)}
                    />

                    <Field
                      icon={MapPin}
                      label="District"
                      value={form.district}
                      placeholder="Enter your city, town or district"
                      onChange={(value) => updateField('district', value)}
                    />

                    <SelectField
                      icon={Building2}
                      label="Location tier"
                      value={form.location_tier}
                      options={['Tier 1', 'Tier 2', 'Tier 3']}
                      hint="This helps us show you relevant opportunities in your area."
                      onChange={(value) => updateField('location_tier', value)}
                    />

                    <SelectField
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
                      onChange={(value) =>
                        updateField('education_level', value)
                      }
                    />

                    <SelectField
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
                      icon={Percent}
                      label="Percentage / marks"
                      type="number"
                      value={form.percentage_marks}
                      placeholder="e.g. 78.5"
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
                      label="Annual family income"
                      type="number"
                      value={form.annual_family_income}
                      placeholder="e.g. 180000"
                      prefix="₹"
                      onChange={(value) =>
                        updateField('annual_family_income', value)
                      }
                    />

                    <SelectField
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
                        education, scholarships, schemes and low-barrier career
                        paths.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-footer">
                {step > 0 ? (
                  <button className="secondary-button" onClick={previousStep}>
                    <ArrowLeft size={18} />
                    Back
                  </button>
                ) : (
                  <div />
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
            <SproutScene />

            <div className="info-copy">
              <span className="info-rule" />
              <h2>
                Every path
                <br />
                starts <em>somewhere</em>
              </h2>
              <p>
                Your profile helps us suggest careers, skills, learning
                resources and opportunities that match your interests and
                background.
              </p>
            </div>

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
    <label className={`field ${wide ? 'field--wide' : ''}`}>
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
          type={type}
          value={value}
          placeholder={placeholder}
          aria-required={required || undefined}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>

      {hint && <small className="field-hint">{hint}</small>}
    </label>
  )
}

type SelectProps = {
  label: string
  value: string
  options: string[]
  required?: boolean
  icon?: LucideIcon
  hint?: string
  onChange: (value: string) => void
}

function SelectField({
  label,
  value,
  options,
  required,
  icon: Icon,
  hint,
  onChange,
}: SelectProps) {
  return (
    <label className="field">
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
          value={value}
          aria-required={required || undefined}
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

      {hint && <small className="field-hint">{hint}</small>}
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