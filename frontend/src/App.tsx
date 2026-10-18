import { useState, useEffect } from 'react'
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
import { HeroScene, LogoMark, SidebarScene, SproutScene } from './ProfileArt'
import {
  api,
  type StudentProfileData,
  type CareerItem,
  type OpportunityMatchItem,
  type PathwayResponse,
  type AiAdvisorResponse,
} from './api/client'
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
    text: 'Explore options based on your strengths and interests across tech, trades, government & creative.',
    icon: Compass,
  },
  {
    title: 'Learning plans you can follow',
    text: 'Get 4-stage milestone roadmaps with free SWAYAM and NPTEL certified resources.',
    icon: BookOpen,
  },
  {
    title: 'Scholarships worth exploring',
    text: 'Find verified government schemes, scholarships, and apprenticeships you qualify for.',
    icon: BriefcaseBusiness,
  },
]

type FieldErrors = Partial<Record<keyof FormData, string>>

function App() {
  const [activeNav, setActiveNav] = useState<NavId>('profile')
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(initialForm)
  const [student, setStudent] = useState<StudentProfileData | null>(null)
  const [careers, setCareers] = useState<CareerItem[]>([])
  const [opportunities, setOpportunities] = useState<OpportunityMatchItem[]>([])
  const [pathway, setPathway] = useState<PathwayResponse | null>(null)
  const [selectedCareerId, setSelectedCareerId] = useState<number | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  // AI Advisor state
  const [advisorQuery, setAdvisorQuery] = useState('')
  const [advisorLoading, setAdvisorLoading] = useState(false)
  const [advisorResult, setAdvisorResult] = useState<AiAdvisorResponse | null>(null)

  // Try to load initial profile if exists (e.g. sample seeded profile)
  useEffect(() => {
    const fetchDemo = async () => {
      try {
        const demoStudent = await api.getProfile(1)
        if (demoStudent && demoStudent.id) {
          setStudent(demoStudent)
          const [recRes, oppRes] = await Promise.all([
            api.getRecommendations(demoStudent.id, 6),
            api.matchOpportunities(demoStudent.id, 6),
          ])
          setCareers(recRes.recommendations || [])
          setOpportunities(oppRes.opportunities || [])
          if (recRes.recommendations.length > 0) {
            setSelectedCareerId(recRes.recommendations[0].career_id)
            const pathRes = await api.generatePathway(
              demoStudent.id,
              recRes.recommendations[0].career_id,
            )
            setPathway(pathRes)
          }
        }
      } catch {
        // Backend not yet running or no profile #1; user will fill form
      }
    }
    fetchDemo()
  }, [])

  const updateField = (field: keyof FormData, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))

    // Remove the error for this field as soon as the user starts fixing it.
    setFieldErrors((current) => {
      if (!current[field]) return current

      const updated = { ...current }
      delete updated[field]
      return updated
    })
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

  // Validate only the fields required for the current step.
  const validateStep = (currentStep: number): boolean => {
    const errors: FieldErrors = {}

    if (currentStep === 0) {
      if (!form.full_name.trim()) {
        errors.full_name = 'Full name is required.'
      }

      if (!form.email.trim()) {
        errors.email = 'Email address is required.'
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
      ) {
        errors.email = 'Please enter a valid email address.'
      }
    }

    if (currentStep === 1) {
      if (!form.education_level.trim()) {
        errors.education_level = 'Highest education level is required.'
      }
    }

    setFieldErrors(errors)

    return Object.keys(errors).length === 0
  }

  // Validate all required fields before final submission.
  const validateAllFields = (): boolean => {
    const errors: FieldErrors = {}

    if (!form.full_name.trim()) {
      errors.full_name = 'Full name is required.'
    }

    if (!form.email.trim()) {
      errors.email = 'Email address is required.'
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      errors.email = 'Please enter a valid email address.'
    }

    if (!form.education_level.trim()) {
      errors.education_level = 'Highest education level is required.'
    }

    setFieldErrors(errors)

    return Object.keys(errors).length === 0
  }

  const nextStep = () => {
    if (!validateStep(step)) {
      return
    }

    if (step < steps.length - 1) {
      setStep((current) => current + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const previousStep = () => {
    if (step > 0) {
      setFieldErrors({})
      setStep((current) => current - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

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

  const handleSubmit = async () => {
    // Do not submit anything if required fields are missing.
    if (!validateAllFields()) {
      setStep(0)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setLoading(true)
    setError(null)

    const payload: StudentProfileData = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      age: parseInt(form.age, 10) || 19,
      gender:
        form.gender.toLowerCase() === 'female' ? 'female' : 'male',
      category: ['General', 'OBC', 'SC', 'ST', 'EWS'].includes(form.category)
        ? form.category
        : 'General',
      state: form.state.trim() || 'Uttar Pradesh',
      district: form.district.trim() || 'Varanasi',
      location_tier:
        form.location_tier.toLowerCase().replace(' ', '_') || 'tier_2',
      annual_family_income:
        parseFloat(form.annual_family_income) || 180000,
      financial_constraint:
        form.financial_constraint.toLowerCase() === 'medium'
          ? 'moderate'
          : form.financial_constraint.toLowerCase() || 'moderate',
      education_level: mapEducationLevel(form.education_level),
      stream: mapStream(form.stream),
      percentage_marks: parseFloat(form.percentage_marks) || 75.0,
      skills:
        form.skills.length > 0 ? form.skills : ['Basic Computers'],
      interests:
        form.interests.length > 0 ? form.interests : ['Technology'],
      languages:
        form.languages.length > 0 ? form.languages : ['Hindi', 'English'],
      career_aspirations:
        form.career_aspirations.length > 0
          ? form.career_aspirations
          : ['Specialist'],
    }

    try {
      const created = await api.createProfile(payload)
      setStudent(created)

      // Fetch personalized recommendations & opportunities
      if (created.id) {
        const [recs, opps] = await Promise.all([
          api.getRecommendations(created.id, 6),
          api.matchOpportunities(created.id, 6),
        ])

        setCareers(recs.recommendations || [])
        setOpportunities(opps.opportunities || [])

        if (recs.recommendations.length > 0) {
          const topCareer = recs.recommendations[0]
          setSelectedCareerId(topCareer.career_id)

          const p = await api.generatePathway(
            created.id,
            topCareer.career_id,
          )

          setPathway(p)
        }
      }

      setActiveNav('careers')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
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
      setActiveNav('pathways')
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
      const updated = await api.updateMilestoneStatus(
        milestoneId,
        newStatus,
      )

      if (pathway) {
        setPathway({
          ...pathway,
          milestones: pathway.milestones.map((m) =>
            m.id === milestoneId
              ? { ...m, status: updated.status }
              : m,
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

  const initial = (
    student?.full_name ||
    form.full_name ||
    'U'
  )
    .trim()
    .charAt(0)
    .toUpperCase()

  const CurrentIcon = steps[step].icon

  return (
    <PortalShell
      initial={initial}
      activeNav={activeNav}
      onSelectNav={(navId) => setActiveNav(navId)}
    >
      <main className="content">
        {error && (
          <div
            style={{
              background: '#fde8e8',
              border: '1px solid #feb2b2',
              color: '#c53030',
              padding: '12px 18px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{error}</span>

            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#c53030',
              }}
              onClick={() => setError(null)}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* PROFILE ONBOARDING VIEW */}
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
                  <div style={{ marginTop: '16px' }}>
                    <span className="student-badge-pill">
                      <Check size={14} /> Active Profile: {student.full_name}{' '}
                      ({student.state})
                    </span>
                  </div>
                )}
              </div>

              <HeroScene />
            </section>

            <div className="content-grid">
              <div className="content-col">
                <section
                  className="stepper-card"
                  aria-label="Profile progress"
                >
                  <ol className="stepper">
                    {steps.map((item, index) => (
                      <li
                        key={item.title}
                        className={`stepper-item ${
                          index === step ? 'active' : ''
                        } ${index < step ? 'completed' : ''}`}
                        aria-current={
                          index === step ? 'step' : undefined
                        }
                      >
                        <span className="stepper-dot">
                          {index < step ? (
                            <Check size={16} />
                          ) : (
                            index + 1
                          )}
                        </span>

                        <span className="stepper-label">
                          {item.title}
                        </span>
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
                          error={fieldErrors.full_name}
                          onChange={(value) =>
                            updateField('full_name', value)
                          }
                        />

                        <Field
                          icon={Mail}
                          label="Email address"
                          required
                          type="email"
                          value={form.email}
                          placeholder="you@example.com"
                          error={fieldErrors.email}
                          onChange={(value) =>
                            updateField('email', value)
                          }
                        />

                        <Field
                          icon={Phone}
                          label="Phone number"
                          value={form.phone}
                          placeholder="+91 9876543210"
                          onChange={(value) =>
                            updateField('phone', value)
                          }
                        />

                        <Field
                          icon={Calendar}
                          label="Age"
                          type="number"
                          value={form.age}
                          placeholder="e.g. 19"
                          onChange={(value) =>
                            updateField('age', value)
                          }
                        />

                        <SelectField
                          icon={Users}
                          label="Gender"
                          value={form.gender}
                          options={['Male', 'Female', 'Other']}
                          onChange={(value) =>
                            updateField('gender', value)
                          }
                        />

                        <Field
                          icon={MapIcon}
                          label="State"
                          value={form.state}
                          placeholder="e.g. Uttar Pradesh"
                          onChange={(value) =>
                            updateField('state', value)
                          }
                        />

                        <Field
                          icon={MapPin}
                          label="District"
                          value={form.district}
                          placeholder="Enter your city or district"
                          onChange={(value) =>
                            updateField('district', value)
                          }
                        />

                        <SelectField
                          icon={Building2}
                          label="Location tier"
                          value={form.location_tier}
                          options={['Tier 1', 'Tier 2', 'Tier 3']}
                          hint="Helps prioritize regional opportunities."
                          onChange={(value) =>
                            updateField('location_tier', value)
                          }
                        />

                        <SelectField
                          icon={Tags}
                          label="Category"
                          value={form.category}
                          options={[
                            'General',
                            'OBC',
                            'SC',
                            'ST',
                            'EWS',
                          ]}
                          onChange={(value) =>
                            updateField('category', value)
                          }
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
                          error={fieldErrors.education_level}
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
                          ]}
                          onChange={(value) =>
                            updateField('stream', value)
                          }
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
                            careers and government scholarships you qualify
                            for.
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
                        onAdd={(value) =>
                          addTag('skills', value)
                        }
                        onRemove={(value) =>
                          removeTag('skills', value)
                        }
                      />

                      <TagInput
                        label="Interests"
                        placeholder="e.g. Technology, Solar Energy, Healthcare"
                        values={form.interests}
                        onAdd={(value) =>
                          addTag('interests', value)
                        }
                        onRemove={(value) =>
                          removeTag('interests', value)
                        }
                      />

                      <TagInput
                        label="Languages"
                        placeholder="e.g. Hindi, English"
                        values={form.languages}
                        onAdd={(value) =>
                          addTag('languages', value)
                        }
                        onRemove={(value) =>
                          removeTag('languages', value)
                        }
                      />

                      <TagInput
                        label="Career aspirations"
                        placeholder="e.g. Technician, Analyst, Public Service"
                        values={form.career_aspirations}
                        onAdd={(value) =>
                          addTag('career_aspirations', value)
                        }
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
                            updateField(
                              'annual_family_income',
                              value,
                            )
                          }
                        />

                        <SelectField
                          icon={Wallet}
                          label="Financial constraint level"
                          value={form.financial_constraint}
                          options={['Low', 'Medium', 'High']}
                          onChange={(value) =>
                            updateField(
                              'financial_constraint',
                              value,
                            )
                          }
                        />
                      </div>

                      <div className="income-cards">
                        <div>
                          <span>LOW</span>
                          <p>
                            Financial support is generally available.
                          </p>
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
                            critical.
                          </p>
                        </div>
                      </div>

                      <div className="info-box">
                        <Wallet size={20} />

                        <div>
                          <strong>Your information matters</strong>

                          <p>
                            UdaanPath prioritizes affordable education,
                            certified scholarships, and high-ROI career
                            tracks.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

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
                      <div />
                    )}

                    {step < steps.length - 1 ? (
                      <button
                        className="primary-button"
                        onClick={nextStep}
                      >
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
                            <Loader2
                              size={18}
                              className="animate-spin"
                            />
                            Saving...
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
                    resources and opportunities that match your background.
                  </p>
                </div>

                <ul className="info-list">
                  {infoPoints.map(
                    ({ title, text, icon: Icon }) => (
                      <li key={title}>
                        <span className="info-icon">
                          <Icon
                            size={22}
                            strokeWidth={1.6}
                          />
                        </span>

                        <div>
                          <strong>{title}</strong>
                          <p>{text}</p>
                        </div>
                      </li>
                    ),
                  )}
                </ul>
              </aside>
            </div>
          </>
        )}

        {/* CAREER DISCOVERY VIEW */}
        {activeNav === 'careers' && (
          <div className="dashboard-container">
            <div className="dashboard-top">
              <div className="dashboard-title">
                <h2>Personalized Career Recommendations</h2>

                <p>
                  Multi-factor matched against your academic background,
                  skills, and financial ROI.
                </p>
              </div>

              {student && (
                <div className="student-badge-pill">
                  <UserRound size={16} /> {student.full_name} ·{' '}
                  {student.stream.replace('_', ' ')}
                </div>
              )}
            </div>

            {careers.length === 0 ? (
              <div className="empty-view">
                <Compass
                  size={48}
                  style={{
                    margin: '0 auto 16px',
                    color: '#16866a',
                  }}
                />

                <h3>No recommendations generated yet</h3>

                <p>
                  Complete your student profile to unlock customized
                  career matches.
                </p>

                <button
                  className="primary-button"
                  style={{ marginTop: '16px' }}
                  onClick={() => setActiveNav('profile')}
                >
                  Go to Profile Setup
                </button>
              </div>
            ) : (
              <div className="card-grid">
                {careers.map((career) => (
                  <div
                    key={career.career_id}
                    className={`item-card ${
                      selectedCareerId === career.career_id
                        ? 'border-mint'
                        : ''
                    }`}
                  >
                    <div>
                      <div className="item-card-header">
                        <div>
                          <span className="category-tag">
                            {career.category.replace(
                              /_/g,
                              ' ',
                            )}
                          </span>

                          <h3 className="item-card-title">
                            {career.title}
                          </h3>

                          <span className="item-card-subtitle">
                            {career.sector}
                          </span>
                        </div>

                        <span className="score-badge">
                          {Math.round(career.match_score)}% Match
                        </span>
                      </div>

                      <div className="salary-row">
                        <div className="salary-item">
                          <span>Starting Salary</span>

                          <strong>
                            ₹
                            {(
                              career.starting_salary_inr /
                              100000
                            ).toFixed(1)}{' '}
                            LPA
                          </strong>
                        </div>

                        <div className="salary-item">
                          <span>Mid-Career</span>

                          <strong>
                            ₹
                            {(
                              career.mid_level_salary_inr /
                              100000
                            ).toFixed(1)}{' '}
                            LPA
                          </strong>
                        </div>

                        <div className="salary-item">
                          <span>Outlook</span>
                          <strong>{career.growth_outlook}</strong>
                        </div>
                      </div>

                      <p className="item-card-body">
                        {career.rationale}
                      </p>

                      <div className="skills-wrap">
                        {career.key_skills.map((skill) => (
                          <span
                            key={skill}
                            className="skill-chip"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      className="primary-button"
                      style={{
                        width: '100%',
                        marginTop: '12px',
                      }}
                      onClick={() =>
                        handleSelectCareerForRoadmap(
                          career.career_id,
                        )
                      }
                    >
                      <BookOpen size={16} />
                      View Learning Roadmap
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
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
                  4-stage milestone pathway with certified free
                  SWAYAM/NPTEL alternative resources.
                </p>
              </div>

              {pathway && (
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                  }}
                >
                  <span className="student-badge-pill">
                    Duration: ~
                    {pathway.total_estimated_duration_months}{' '}
                    Months
                  </span>

                  <span className="student-badge-pill">
                    {pathway.weekly_study_hours} hrs / week
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

                <h3>No roadmap loaded yet</h3>

                <p>
                  Select a career from Career Discovery to generate a
                  structured 4-stage roadmap.
                </p>

                <button
                  className="primary-button"
                  style={{ marginTop: '16px' }}
                  onClick={() => setActiveNav('careers')}
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
                            {milestone.stage}
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
                        <span>
                          ⏱️ {milestone.duration_weeks} Weeks
                        </span>

                        {milestone.recommended_certification && (
                          <span>
                            📜 Cert:{' '}
                            {milestone.recommended_certification}
                          </span>
                        )}

                        <span>
                          💰 Est. Cost: ₹
                          {milestone.estimated_cost_inr}
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
                              Free Alternative:
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
                            Access Portal{' '}
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
                <h2>
                  Verified Opportunities &amp; Scholarships
                </h2>

                <p>
                  Official government welfare schemes, scholarships,
                  and apprenticeships evaluated with deterministic
                  rules.
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
                  style={{
                    margin: '0 auto 16px',
                    color: '#16866a',
                  }}
                />

                <h3>No opportunities evaluated yet</h3>

                <p>
                  Complete your student profile to evaluate eligibility
                  across national schemes.
                </p>

                <button
                  className="primary-button"
                  style={{ marginTop: '16px' }}
                  onClick={() => setActiveNav('profile')}
                >
                  Complete Profile
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
                              {opp.type.replace(
                                /_/g,
                                ' ',
                              )}
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
                            {item.eligibility_status.replace(
                              /_/g,
                              ' ',
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
                            Verified by: {opp.verified_by}
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
                        Apply on Official Portal{' '}
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
                <h2>
                  AI Career &amp; Education Advisor
                </h2>

                <p>
                  Powered by Gemini LLM with zero-failure deterministic
                  rule fallback. Ask any questions about careers,
                  schemes, or preparation.
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

              <p
                style={{
                  color: '#5e6e66',
                  fontSize: '14px',
                }}
              >
                Get tailored advice grounded in official Indian
                schemes and free educational resources.
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
                    <strong
                      style={{
                        color: '#063b2e',
                        fontSize: '16px',
                      }}
                    >
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
                          Key Takeaways:
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

        <footer className="footer-note">
          <span>UdaanPath</span>
          <span>•</span>
          <span>
            Personalized pathways for every student
          </span>
        </footer>
      </main>
    </PortalShell>
  )
}

function PortalShell({
  initial,
  activeNav,
  onSelectNav,
  children,
}: {
  initial: string
  activeNav: NavId
  onSelectNav: (id: NavId) => void
  children: ReactNode
}) {
  return (
    <div className="portal">
      <aside className="side">
        <div className="brand">
          <LogoMark size={42} />

          <div>
            <span className="brand-name">UdaanPath</span>
            <span className="brand-tag">
              LEARN · EXPLORE · GROW
            </span>
          </div>
        </div>

        <nav
          className="side-nav"
          aria-label="Student portal"
        >
          {sideNavItems.map(
            ({ id, label, icon: Icon }) => {
              const isActive = activeNav === id

              return (
                <a
                  key={id}
                  className={`side-link ${
                    isActive ? 'active' : ''
                  }`}
                  aria-current={
                    isActive ? 'page' : undefined
                  }
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectNav(id)}
                >
                  <Icon
                    size={22}
                    strokeWidth={1.6}
                  />

                  <span>{label}</span>

                  {isActive && (
                    <ChevronRight
                      size={18}
                      className="side-chevron"
                    />
                  )}
                </a>
              )
            },
          )}
        </nav>

        <div
          className="side-foot"
          aria-hidden="true"
        >
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

          <nav
            className="top-nav"
            aria-label="Site"
          >
            {topNav.map((label, index) => (
              <a
                key={label}
                className={
                  index === 0 ? 'active' : ''
                }
                aria-current={
                  index === 0 ? 'page' : undefined
                }
              >
                {label}
              </a>
            ))}
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

            <div
              className="top-lang"
              aria-label="Language"
            >
              <span className="on">EN</span>
              <span className="divider" />
              <span>HI</span>
            </div>

            <div className="top-user">
              <span
                className="avatar"
                aria-hidden="true"
              >
                {initial || (
                  <UserRound size={18} />
                )}
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
  error?: string
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
  error,
  onChange,
}: FieldProps) {
  return (
    <label
      className={`field ${
        wide ? 'field--wide' : ''
      }`}
    >
      <span>
        {label}{' '}
        {required && (
          <b aria-hidden="true">*</b>
        )}
      </span>

      <div
        className={`input-wrapper ${
          prefix ? 'has-prefix' : ''
        } ${Icon ? 'has-icon' : ''} ${
          error ? 'has-error' : ''
        }`}
      >
        {Icon && (
          <Icon
            size={18}
            className="field-icon"
          />
        )}

        {prefix && (
          <span className="prefix">
            {prefix}
          </span>
        )}

        <input
          type={type}
          value={value}
          placeholder={placeholder}
          aria-required={
            required || undefined
          }
          aria-invalid={
            error ? true : undefined
          }
          onChange={(event) =>
            onChange(event.target.value)
          }
        />
      </div>

      {error && (
        <small className="field-error">
          {error}
        </small>
      )}

      {hint && (
        <small className="field-hint">
          {hint}
        </small>
      )}
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
  error?: string
  onChange: (value: string) => void
}

function SelectField({
  label,
  value,
  options,
  required,
  icon: Icon,
  hint,
  error,
  onChange,
}: SelectProps) {
  return (
    <label className="field">
      <span>
        {label}{' '}
        {required && (
          <b aria-hidden="true">*</b>
        )}
      </span>

      <div
        className={`input-wrapper select-wrapper ${
          Icon ? 'has-icon' : ''
        } ${
          value === '' ? 'is-empty' : ''
        } ${error ? 'has-error' : ''}`}
      >
        {Icon && (
          <Icon
            size={18}
            className="field-icon"
          />
        )}

        <select
          value={value}
          aria-required={
            required || undefined
          }
          aria-invalid={
            error ? true : undefined
          }
          onChange={(event) =>
            onChange(event.target.value)
          }
        >
          <option value="">
            Select {label.toLowerCase()}
          </option>

          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={18}
          className="select-chevron"
        />
      </div>

      {error && (
        <small className="field-error">
          {error}
        </small>
      )}

      {hint && (
        <small className="field-hint">
          {hint}
        </small>
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
          onChange={(event) =>
            setInput(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              handleAdd()
            }
          }}
        />

        <button
          type="button"
          onClick={handleAdd}
        >
          <Plus size={18} />
          Add
        </button>
      </div>

      <div className="tags">
        {values.map((value) => (
          <span
            className="tag"
            key={value}
          >
            {value}

            <button
              type="button"
              onClick={() =>
                onRemove(value)
              }
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