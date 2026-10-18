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
import {
  eligibilityLabel,
  optionLabel,
  optionValue,
  readStoredLang,
  storeLang,
  t as translate,
  tParts,
  type Lang,
  type MessageKey,
  type Vars,
} from './i18n'
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

// The top navigation reuses the same `activeNav` state as the sidebar.
const topNav: { labelKey: MessageKey; target: NavId }[] = [
  { labelKey: 'navHome', target: 'profile' },
  { labelKey: 'navExploreCareers', target: 'careers' },
  { labelKey: 'navLearningPaths', target: 'pathways' },
  { labelKey: 'navOpportunities', target: 'opportunities' },
  { labelKey: 'navForEducators', target: 'educators' },
]

const infoPoints: {
  titleKey: MessageKey
  textKey: MessageKey
  icon: LucideIcon
}[] = [
  { titleKey: 'info1Title', textKey: 'info1Text', icon: Compass },
  { titleKey: 'info2Title', textKey: 'info2Text', icon: BookOpen },
  { titleKey: 'info3Title', textKey: 'info3Text', icon: BriefcaseBusiness },
]

// Errors are stored as message keys (not text) so a visible error switches
// language immediately, without re-running validation.
type FieldErrors = Partial<Record<keyof FormData, MessageKey>>

function App() {
  const [activeNav, setActiveNav] = useState<NavId>('profile')
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
        errors.full_name = 'errFullNameRequired'
      }

      if (!form.email.trim()) {
        errors.email = 'errEmailRequired'
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
      ) {
        errors.email = 'errEmailInvalid'
      }
    }

    if (currentStep === 1) {
      if (!form.education_level.trim()) {
        errors.education_level = 'errEducationRequired'
      }
    }

    setFieldErrors(errors)

    return Object.keys(errors).length === 0
  }

  // Validate all required fields before final submission.
  const validateAllFields = (): boolean => {
    const errors: FieldErrors = {}

    if (!form.full_name.trim()) {
      errors.full_name = 'errFullNameRequired'
    }

    if (!form.email.trim()) {
      errors.email = 'errEmailRequired'
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      errors.email = 'errEmailInvalid'
    }

    if (!form.education_level.trim()) {
      errors.education_level = 'errEducationRequired'
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
      lang={lang}
      onChangeLang={changeLang}
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
                <span className="eyebrow">{t('heroEyebrow')}</span>

                <h1>
                  {t('heroTitleA')}
                  <em>{t('heroTitleB')}</em>
                </h1>

                <p>{t('heroText')}</p>

                {student && (
                  <div style={{ marginTop: '16px' }}>
                    <span className="student-badge-pill">
                      <Check size={14} />{' '}
                      {t('activeProfile', {
                        name: optionLabel(lang, student.full_name),
                        state: optionLabel(lang, student.state),
                      })}
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
                  aria-label={t('ariaProfileProgress')}
                >
                  <ol className="stepper">
                    {steps.map((item, index) => (
                      <li
                        key={item.titleKey}
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
                          {t(item.titleKey)}
                        </span>
                      </li>
                    ))}
                  </ol>

                  <span className="stepper-count">
                    {tParts(lang, 'stepCount', {
                      step: step + 1,
                      total: steps.length,
                    })}
                  </span>
                </section>

                <section className="form-card">
                  <div className="form-heading">
                    <div className="heading-icon">
                      <CurrentIcon size={24} />
                    </div>

                    <div>
                      <h2>{t(steps[step].titleKey)}</h2>
                      <p>{t(steps[step].subtitleKey)}</p>
                    </div>
                  </div>

                  {step === 0 && (
                    <div className="form-content">
                      <div className="field-grid">
                        <Field
                          wide
                          icon={UserRound}
                          label={t('fullName')}
                          required
                          value={form.full_name}
                          placeholder={t('fullNamePlaceholder')}
                          error={fieldErrors.full_name ? t(fieldErrors.full_name) : undefined}
                          onChange={(value) =>
                            updateField('full_name', value)
                          }
                        />

                        <Field
                          icon={Mail}
                          label={t('email')}
                          required
                          type="email"
                          value={form.email}
                          placeholder="you@example.com"
                          error={fieldErrors.email ? t(fieldErrors.email) : undefined}
                          onChange={(value) =>
                            updateField('email', value)
                          }
                        />

                        <Field
                          icon={Phone}
                          label={t('phone')}
                          value={form.phone}
                          placeholder="+91 9876543210"
                          onChange={(value) =>
                            updateField('phone', value)
                          }
                        />

                        <Field
                          icon={Calendar}
                          label={t('age')}
                          type="number"
                          value={form.age}
                          placeholder={t('agePlaceholder')}
                          onChange={(value) =>
                            updateField('age', value)
                          }
                        />

                        <SelectField
                          lang={lang}
                          icon={Users}
                          label={t('gender')}
                          value={form.gender}
                          options={['Male', 'Female', 'Other']}
                          onChange={(value) =>
                            updateField('gender', value)
                          }
                        />

                        <Field
                          lang={lang}
                          localizeValue
                          icon={MapIcon}
                          label={t('state')}
                          value={form.state}
                          placeholder={t('statePlaceholder')}
                          onChange={(value) =>
                            updateField('state', value)
                          }
                        />

                        <Field
                          lang={lang}
                          localizeValue
                          icon={MapPin}
                          label={t('district')}
                          value={form.district}
                          placeholder={t('districtPlaceholder')}
                          onChange={(value) =>
                            updateField('district', value)
                          }
                        />

                        <SelectField
                          lang={lang}
                          icon={Building2}
                          label={t('locationTier')}
                          value={form.location_tier}
                          options={['Tier 1', 'Tier 2', 'Tier 3']}
                          hint={t('locationTierHint')}
                          onChange={(value) =>
                            updateField('location_tier', value)
                          }
                        />

                        <SelectField
                          lang={lang}
                          icon={Tags}
                          label={t('category')}
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
                          lang={lang}
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
                          error={fieldErrors.education_level ? t(fieldErrors.education_level) : undefined}
                          onChange={(value) =>
                            updateField('education_level', value)
                          }
                        />

                        <SelectField
                          lang={lang}
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
                          ]}
                          onChange={(value) =>
                            updateField('stream', value)
                          }
                        />

                        <Field
                          icon={Percent}
                          label={t('percentage')}
                          type="number"
                          value={form.percentage_marks}
                          placeholder={t('percentagePlaceholder')}
                          onChange={(value) =>
                            updateField('percentage_marks', value)
                          }
                        />
                      </div>

                      <div className="info-box">
                        <GraduationCap size={20} />

                        <div>
                          <strong>{t('whyAskTitle')}</strong>

                          <p>{t('whyAskText')}</p>
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
                        onAdd={(value) =>
                          addTag('skills', value)
                        }
                        onRemove={(value) =>
                          removeTag('skills', value)
                        }
                      />

                      <TagInput
                        lang={lang}
                        label={t('interests')}
                        placeholder={t('interestsPlaceholder')}
                        values={form.interests}
                        onAdd={(value) =>
                          addTag('interests', value)
                        }
                        onRemove={(value) =>
                          removeTag('interests', value)
                        }
                      />

                      <TagInput
                        lang={lang}
                        label={t('languages')}
                        placeholder={t('languagesPlaceholder')}
                        values={form.languages}
                        onAdd={(value) =>
                          addTag('languages', value)
                        }
                        onRemove={(value) =>
                          removeTag('languages', value)
                        }
                      />

                      <TagInput
                        lang={lang}
                        label={t('aspirations')}
                        placeholder={t('aspirationsPlaceholder')}
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
                          label={t('income')}
                          type="number"
                          value={form.annual_family_income}
                          placeholder={t('incomePlaceholder')}
                          prefix="₹"
                          onChange={(value) =>
                            updateField(
                              'annual_family_income',
                              value,
                            )
                          }
                        />

                        <SelectField
                          lang={lang}
                          icon={Wallet}
                          label={t('financialConstraint')}
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
                          <span>{t('incomeLow')}</span>
                          <p>{t('incomeLowText')}</p>
                        </div>

                        <div>
                          <span>{t('incomeMedium')}</span>
                          <p>{t('incomeMediumText')}</p>
                        </div>

                        <div>
                          <span>{t('incomeHigh')}</span>
                          <p>{t('incomeHighText')}</p>
                        </div>
                      </div>

                      <div className="info-box">
                        <Wallet size={20} />

                        <div>
                          <strong>{t('mattersTitle')}</strong>

                          <p>{t('mattersText')}</p>
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
                        {t('back')}
                      </button>
                    ) : (
                      <div />
                    )}

                    {step < steps.length - 1 ? (
                      <button
                        className="primary-button"
                        onClick={nextStep}
                      >
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
                            <Loader2
                              size={18}
                              className="animate-spin"
                            />
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
                <SproutScene />

                <div className="info-copy">
                  <span className="info-rule" />

                  <h2>
                    {t('infoTitle1')}
                    <br />
                    {t('infoTitle2Pre')}
                    <em>{t('infoTitle2Em')}</em>
                    {t('infoTitle2Post')}
                  </h2>

                  <p>{t('infoText')}</p>
                </div>

                <ul className="info-list">
                  {infoPoints.map(
                    ({ titleKey, textKey, icon: Icon }) => (
                      <li key={titleKey}>
                        <span className="info-icon">
                          <Icon
                            size={22}
                            strokeWidth={1.6}
                          />
                        </span>

                        <div>
                          <strong>{t(titleKey)}</strong>
                          <p>{t(textKey)}</p>
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
                <h2>{t('careersTitle')}</h2>

                <p>{t('careersSubtitle')}</p>
              </div>

              {student && (
                <div className="student-badge-pill">
                  <UserRound size={16} /> {student.full_name} ·{' '}
                  {optionLabel(lang, student.stream)}
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

                <h3>{t('careersEmptyTitle')}</h3>

                <p>{t('careersEmptyText')}</p>

                <button
                  className="primary-button"
                  style={{ marginTop: '16px' }}
                  onClick={() => setActiveNav('profile')}
                >
                  {t('goToProfileSetup')}
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
                          {t('matchPercent', {
                            n: Math.round(career.match_score),
                          })}
                        </span>
                      </div>

                      <div className="salary-row">
                        <div className="salary-item">
                          <span>{t('startingSalary')}</span>

                          <strong>
                            ₹
                            {(
                              career.starting_salary_inr /
                              100000
                            ).toFixed(1)}{' '}
                            {t('lpa')}
                          </strong>
                        </div>

                        <div className="salary-item">
                          <span>{t('midCareer')}</span>

                          <strong>
                            ₹
                            {(
                              career.mid_level_salary_inr /
                              100000
                            ).toFixed(1)}{' '}
                            {t('lpa')}
                          </strong>
                        </div>

                        <div className="salary-item">
                          <span>{t('outlook')}</span>
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
                      {t('viewRoadmap')}
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
                  onClick={() => setActiveNav('careers')}
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
                  onClick={() => setActiveNav('profile')}
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
                              value: opp.verified_by,
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
                onClick={() => setActiveNav('profile')}
              >
                {t('backToProfile')}
              </button>
            </div>
          </div>
        )}

        <footer className="footer-note">
          <span>UdaanPath</span>
          <span>•</span>
          <span>{t('footerTagline')}</span>
        </footer>
      </main>
    </PortalShell>
  )
}

function PortalShell({
  initial,
  activeNav,
  onSelectNav,
  lang,
  onChangeLang,
  children,
}: {
  initial: string
  activeNav: NavId
  onSelectNav: (id: NavId) => void
  lang: Lang
  onChangeLang: (lang: Lang) => void
  children: ReactNode
}) {
  const t = (key: MessageKey, vars?: Vars) => translate(lang, key, vars)

  return (
    <div className="portal">
      <aside className="side">
        <div className="brand">
          <LogoMark size={42} />

          <div>
            <span className="brand-name">UdaanPath</span>
            <span className="brand-tag">
              {t('brandTag')}
            </span>
          </div>
        </div>

        <nav
          className="side-nav"
          aria-label={t('ariaStudentPortal')}
        >
          {sideNavItems.map(
            ({ id, labelKey, icon: Icon }) => {
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

                  <span>{t(labelKey)}</span>

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

          <nav
            className="top-nav"
            aria-label={t('ariaSiteNav')}
          >
            {topNav.map(({ labelKey, target }) => {
              const isActive = activeNav === target

              return (
                <button
                  key={target}
                  type="button"
                  className={isActive ? 'active' : ''}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => onSelectNav(target)}
                >
                  {t(labelKey)}
                </button>
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
                English
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
                Hindi
              </button>
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
  lang?: Lang
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
  localizeValue?: boolean
  onChange: (value: string) => void
}

function Field({
  lang = 'en',
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
  localizeValue = false,
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
          value={localizeValue ? optionLabel(lang, value) : value}
          placeholder={placeholder}
          aria-required={
            required || undefined
          }
          aria-invalid={
            error ? true : undefined
          }
          onChange={(event) =>
            onChange(
              localizeValue
                ? optionValue(lang, event.target.value)
                : event.target.value,
            )
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
  lang: Lang
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
  lang,
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
            {translate(lang, 'selectPrompt', {
              label: lang === 'en' ? label.toLowerCase() : label,
            })}
          </option>

          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {optionLabel(lang, option)}
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
          {translate(lang, 'addTag')}
        </button>
      </div>

      <div className="tags">
        {values.map((value) => (
          <span
            className="tag"
            key={value}
          >
            {optionLabel(lang, value)}

            <button
              type="button"
              aria-label={translate(lang, 'removeItem', {
                value: optionLabel(lang, value),
              })}
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
