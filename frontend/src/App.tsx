import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GraduationCap,
  UserRound,
  Brain,
  Wallet,
  Plus,
  X,
} from 'lucide-react'
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
    title: 'About you',
    subtitle: 'Tell us a little about yourself',
    icon: UserRound,
  },
  {
    title: 'Education',
    subtitle: 'Help us understand your academic background',
    icon: GraduationCap,
  },
  {
    title: 'Skills & interests',
    subtitle: 'What are you good at and what interests you?',
    icon: Brain,
  },
  {
    title: 'Financial background',
    subtitle: 'This helps us find suitable opportunities for you',
    icon: Wallet,
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

  if (submitted) {
    return (
      <main className="app">
        <div className="success-card">
          <div className="success-icon">
            <Check size={36} />
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
    )
  }

  const CurrentIcon = steps[step].icon

  return (
    <main className="app">
      <div className="page-shell">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark">U</div>
            <span>UdaanPath</span>
          </div>

          <span className="save-text">Your progress is saved locally</span>
        </header>

        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">LET&apos;S GET STARTED</span>
            <h1>Build your <span>UdaanPath</span></h1>
            <p>
              Tell us about yourself and we&apos;ll help you discover
              opportunities that actually fit your goals.
            </p>
          </div>

          <div className="progress-wrapper">
            <div className="progress-header">
              <span>Profile setup</span>
              <strong>
                Step {step + 1} of {steps.length}
              </strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${((step + 1) / steps.length) * 100}%`,
                }}
              />
            </div>

            <div className="step-labels">
              {steps.map((item, index) => {
                const Icon = item.icon

                return (
                  <div
                    key={item.title}
                    className={`step-label ${
                      index === step ? 'active' : ''
                    } ${index < step ? 'completed' : ''}`}
                  >
                    <div className="step-dot">
                      {index < step ? <Check size={13} /> : <Icon size={14} />}
                    </div>
                    <span>{item.title}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="form-card">
          <div className="form-heading">
            <div className="heading-icon">
              <CurrentIcon size={22} />
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
                  label="Full name"
                  required
                  value={form.full_name}
                  placeholder="e.g. Aarav Sharma"
                  onChange={(value) => updateField('full_name', value)}
                />

                <Field
                  label="Email address"
                  required
                  type="email"
                  value={form.email}
                  placeholder="you@example.com"
                  onChange={(value) => updateField('email', value)}
                />

                <Field
                  label="Phone number"
                  value={form.phone}
                  placeholder="+91 9876543210"
                  onChange={(value) => updateField('phone', value)}
                />

                <Field
                  label="Age"
                  type="number"
                  value={form.age}
                  placeholder="e.g. 19"
                  onChange={(value) => updateField('age', value)}
                />

                <SelectField
                  label="Gender"
                  value={form.gender}
                  options={['Male', 'Female', 'Other', 'Prefer not to say']}
                  onChange={(value) => updateField('gender', value)}
                />

                <SelectField
                  label="Category"
                  value={form.category}
                  options={['General', 'OBC', 'SC', 'ST', 'EWS']}
                  onChange={(value) => updateField('category', value)}
                />

                <Field
                  label="State"
                  value={form.state}
                  placeholder="e.g. Uttar Pradesh"
                  onChange={(value) => updateField('state', value)}
                />

                <Field
                  label="District"
                  value={form.district}
                  placeholder="e.g. Varanasi"
                  onChange={(value) => updateField('district', value)}
                />

                <SelectField
                  label="Location tier"
                  value={form.location_tier}
                  options={['Tier 1', 'Tier 2', 'Tier 3']}
                  onChange={(value) => updateField('location_tier', value)}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="form-content">
              <div className="field-grid">
                <SelectField
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
                  onChange={(value) => updateField('education_level', value)}
                />

                <SelectField
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
                    Your education level and stream help us identify careers
                    and opportunities that match your eligibility.
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
                  <p>Cost-effective paths and financial aid are important.</p>
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
                Continue
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

        <footer className="footer-note">
          <span>UdaanPath</span>
          <span>•</span>
          <span>Personalized pathways for every student</span>
        </footer>
      </div>
    </main>
  )
}

type FieldProps = {
  label: string
  value: string
  placeholder?: string
  type?: string
  required?: boolean
  prefix?: string
  onChange: (value: string) => void
}

function Field({
  label,
  value,
  placeholder,
  type = 'text',
  required,
  prefix,
  onChange,
}: FieldProps) {
  return (
    <label className="field">
      <span>
        {label} {required && <b>*</b>}
      </span>

      <div className={`input-wrapper ${prefix ? 'has-prefix' : ''}`}>
        {prefix && <span className="prefix">{prefix}</span>}

        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </label>
  )
}

type SelectProps = {
  label: string
  value: string
  options: string[]
  required?: boolean
  onChange: (value: string) => void
}

function SelectField({
  label,
  value,
  options,
  required,
  onChange,
}: SelectProps) {
  return (
    <label className="field">
      <span>
        {label} {required && <b>*</b>}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select an option</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
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