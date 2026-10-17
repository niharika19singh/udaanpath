import {
  ChartColumnIncreasing,
  Cog,
  HeartHandshake,
  Landmark,
  Microscope,
  Monitor,
  Palette,
  Plane,
  SunMedium,
  Users,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'

/* --------------------------------------------------------------------------
   Career catalogue — mirrors backend/data/careers.json. `name` is a shorter
   display label for compact cards; `title` is the catalogue title.
   -------------------------------------------------------------------------- */

export type Qualification = '10th_pass' | '12th_pass'
export type Stream =
  | 'science_pcm'
  | 'science_pcb'
  | 'commerce'
  | 'arts_humanities'
  | 'vocational'
  | 'general'

export type Career = {
  id: string
  family: FamilyId
  name: string
  title: string
  sector: string
  description: string
  qualification: Qualification
  streams: Stream[]
  skills: string[]
  interests: string[]
  startingSalary: number
  midSalary: number
  growth: string
  trainingMonths: number
  costBarrier: 'low' | 'moderate' | 'high'
  icon: LucideIcon
  roadmap: 'solar' | 'data' | 'generic'
}

export type FamilyId = 'build' | 'heal' | 'lead'

export type Family = {
  id: FamilyId
  name: string
  areas: string
  icon: LucideIcon
  /** Gradient stops for the family's pathway, left → right. */
  from: string
  to: string
  /** Skills from the family's careers shown as stations on the pathway. */
  stations: string[]
}

export const families: Family[] = [
  {
    id: 'build',
    name: 'Build & Create',
    areas: 'Tech · Design · Making',
    icon: Monitor,
    from: '#3fb4ff',
    to: '#34ecdc',
    stations: ['Problem Solving', 'Visual Design'],
  },
  {
    id: 'heal',
    name: 'Help & Heal',
    areas: 'Health · Energy · Farming',
    icon: HeartHandshake,
    from: '#ff6f86',
    to: '#ffd23f',
    stations: ['Diagnostic Equipment', 'Safety Standards'],
  },
  {
    id: 'lead',
    name: 'Lead & Solve',
    areas: 'Finance · Public Service',
    icon: Users,
    from: '#bd72ff',
    to: '#ff9f43',
    stations: ['Financial Literacy', 'General Awareness'],
  },
]

export const careers: Career[] = [
  {
    id: 'junior-data-analyst',
    family: 'build',
    name: 'Junior Data Analyst',
    title: 'Junior Data Analyst & Business Intelligence Associate',
    sector: 'Information Technology & Analytics',
    description:
      'Transform operational raw data into visual dashboards, SQL queries, and actionable business insights for enterprise and SME growth.',
    qualification: '12th_pass',
    streams: ['science_pcm', 'commerce', 'arts_humanities'],
    skills: [
      'SQL',
      'Excel',
      'Data Visualization',
      'Basic Python',
      'Problem Solving',
    ],
    interests: [
      'Data Analysis',
      'Technology',
      'Mathematics',
      'Business Strategy',
    ],
    startingSalary: 360000,
    midSalary: 900000,
    growth: 'High',
    trainingMonths: 6,
    costBarrier: 'low',
    icon: ChartColumnIncreasing,
    roadmap: 'data',
  },
  {
    id: 'ui-ux-digital-product-designer',
    family: 'build',
    name: 'UI/UX & Product Designer',
    title: 'UI/UX & Digital Product Designer',
    sector: 'Design & Digital Media',
    description:
      'Craft intuitive user journeys, wireframes, mockups, and mobile application interfaces for digital startups and vernacular platforms.',
    qualification: '12th_pass',
    streams: ['arts_humanities', 'commerce', 'science_pcm', 'general'],
    skills: [
      'Figma',
      'User Research',
      'Wireframing',
      'Typography',
      'Visual Design',
    ],
    interests: ['Graphic Design', 'Creativity', 'Psychology', 'Technology'],
    startingSalary: 380000,
    midSalary: 1100000,
    growth: 'Very High',
    trainingMonths: 6,
    costBarrier: 'low',
    icon: Palette,
    roadmap: 'generic',
  },
  {
    id: 'cnc-machine-operator',
    family: 'build',
    name: 'CNC Machine Operator',
    title: 'CNC Machine Operator & Precision Machinist',
    sector: 'Advanced Manufacturing & Automotive',
    description:
      'Program, operate, and calibrate Computer Numerical Control (CNC) milling and lathe machines to fabricate precision mechanical components.',
    qualification: '10th_pass',
    streams: ['vocational', 'science_pcm', 'general'],
    skills: [
      'Blueprint Reading',
      'G-Code/M-Code',
      'Quality Inspection',
      'Micrometer & Vernier',
    ],
    interests: [
      'Manufacturing',
      'Automobiles',
      'Mechanical Engineering',
      'Industrial Tools',
    ],
    startingSalary: 250000,
    midSalary: 580000,
    growth: 'High (Make in India and PLI manufacturing push)',
    trainingMonths: 6,
    costBarrier: 'low',
    icon: Cog,
    roadmap: 'generic',
  },
  {
    id: 'medical-laboratory-technician',
    family: 'heal',
    name: 'Medical Lab Technician',
    title: 'Medical Laboratory Technician (DMLT)',
    sector: 'Healthcare & Diagnostics',
    description:
      'Perform diagnostic testing on patient samples, manage automated laboratory equipment, and report pathological indicators.',
    qualification: '12th_pass',
    streams: ['science_pcb'],
    skills: [
      'Phlebotomy',
      'Diagnostic Equipment',
      'Biochemistry',
      'Pathology Reporting',
    ],
    interests: [
      'Healthcare',
      'Biology',
      'Community Health',
      'Laboratory Science',
    ],
    startingSalary: 280000,
    midSalary: 600000,
    growth: 'High (Expanding hospital & diagnostic networks across Tier-2/3)',
    trainingMonths: 12,
    costBarrier: 'moderate',
    icon: Microscope,
    roadmap: 'generic',
  },
  {
    id: 'solar-pv-installation-technician',
    family: 'heal',
    name: 'Solar PV Technician',
    title: 'Solar PV Installation & Maintenance Technician',
    sector: 'Renewable Energy & Green Power',
    description:
      'Install, test, configure, and maintain residential and commercial rooftop solar photovoltaic systems under government clean energy missions.',
    qualification: '10th_pass',
    streams: ['vocational', 'science_pcm', 'general'],
    skills: [
      'Electrical Wiring',
      'PV System Sizing',
      'Safety Standards',
      'Inverter Maintenance',
    ],
    interests: ['Solar Energy', 'Electronics', 'Green Tech', 'Hands-on Work'],
    startingSalary: 240000,
    midSalary: 550000,
    growth: 'Very High (Backed by PM Surya Ghar Muft Bijli Yojana)',
    trainingMonths: 4,
    costBarrier: 'low',
    icon: SunMedium,
    roadmap: 'solar',
  },
  {
    id: 'smart-agriculture-drone-technician',
    family: 'heal',
    name: 'Agri-Drone Technician',
    title: 'Smart Agriculture & Drone Technician',
    sector: 'Agritech & Rural Innovation',
    description:
      'Operate and pilot agricultural drones for pesticide spraying, soil nutrient surveying, and crop health analytics under Kisan Drone schemes.',
    qualification: '10th_pass',
    streams: ['science_pcm', 'science_pcb', 'vocational', 'general'],
    skills: [
      'DGCA Drone Pilot Certification',
      'GIS Mapping',
      'Pesticide Formulation',
      'Flight Safety',
    ],
    interests: ['Agriculture', 'Drones', 'Robotics', 'Rural Economy'],
    startingSalary: 300000,
    midSalary: 700000,
    growth: 'Explosive (Government subsidizing Kisan Drones across panchayats)',
    trainingMonths: 3,
    costBarrier: 'low',
    icon: Plane,
    roadmap: 'generic',
  },
  {
    id: 'banking-financial-services-assistant',
    family: 'lead',
    name: 'Banking Services Assistant',
    title: 'Banking & Financial Services Assistant (BFSI)',
    sector: 'Banking & Financial Services',
    description:
      'Process customer transactions, microfinance credit evaluation, loan documentation, and digital KYC verification.',
    qualification: '12th_pass',
    streams: ['commerce', 'arts_humanities', 'general'],
    skills: [
      'Financial Literacy',
      'Accounting Basics',
      'Customer Communication',
      'KYC Compliance',
    ],
    interests: ['Banking', 'Finance', 'Economics', 'Customer Service'],
    startingSalary: 260000,
    midSalary: 650000,
    growth: 'High (Rapid financial inclusion and fintech adoption)',
    trainingMonths: 3,
    costBarrier: 'low',
    icon: WalletCards,
    roadmap: 'generic',
  },
  {
    id: 'ssc-junior-secretariat-assistant',
    family: 'lead',
    name: 'SSC Secretariat Assistant',
    title:
      'Staff Selection Commission (SSC) Junior Secretariat Assistant / LDC',
    sector: 'Public Administration & Central Government',
    description:
      'Administrative support, file maintenance, data processing, and document handling across Central Ministries and Departments.',
    qualification: '12th_pass',
    streams: [
      'arts_humanities',
      'commerce',
      'science_pcm',
      'science_pcb',
      'general',
    ],
    skills: [
      'Typing Speed (Hindi/English)',
      'General Awareness',
      'Numerical Aptitude',
      'Drafting',
    ],
    interests: [
      'Public Service',
      'Governance',
      'National Administration',
      'Job Stability',
    ],
    startingSalary: 320000,
    midSalary: 720000,
    growth: 'Stable (Assured 7th Pay Commission pay scale & pension benefits)',
    trainingMonths: 8,
    costBarrier: 'low',
    icon: Landmark,
    roadmap: 'generic',
  },
]

/* --------------------------------------------------------------------------
   Interest topics. Each groups the seed careers' own `typical_interests`
   (and, where noted, key skills) under a student-friendly label.
   -------------------------------------------------------------------------- */

export type Topic = { id: string; label: string; careers: string[] }

export const topics: Topic[] = [
  {
    id: 'technology',
    label: 'Technology',
    careers: ['junior-data-analyst', 'ui-ux-digital-product-designer'],
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    careers: ['medical-laboratory-technician'],
  },
  {
    id: 'environment',
    label: 'Environment',
    careers: [
      'solar-pv-installation-technician',
      'smart-agriculture-drone-technician',
    ],
  },
  {
    id: 'design',
    label: 'Design',
    careers: ['ui-ux-digital-product-designer'],
  },
  {
    id: 'business',
    label: 'Business',
    careers: ['junior-data-analyst', 'banking-financial-services-assistant'],
  },
  {
    id: 'public-service',
    label: 'Public Service',
    careers: ['ssc-junior-secretariat-assistant'],
  },
  {
    id: 'agriculture',
    label: 'Agriculture',
    careers: ['smart-agriculture-drone-technician'],
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing',
    careers: ['cnc-machine-operator'],
  },
  {
    id: 'numbers',
    label: 'Numbers & Data',
    careers: [
      'junior-data-analyst',
      'banking-financial-services-assistant',
      'ssc-junior-secretariat-assistant',
    ],
  },
  {
    id: 'community',
    label: 'Community',
    careers: [
      'medical-laboratory-technician',
      'smart-agriculture-drone-technician',
      'ssc-junior-secretariat-assistant',
    ],
  },
  {
    id: 'creativity',
    label: 'Creativity',
    careers: ['ui-ux-digital-product-designer'],
  },
  {
    id: 'hands-on',
    label: 'Hands-on Work',
    careers: [
      'solar-pv-installation-technician',
      'cnc-machine-operator',
      'smart-agriculture-drone-technician',
    ],
  },
]

/* --------------------------------------------------------------------------
   Filters — only what the catalogue actually records.
   -------------------------------------------------------------------------- */

export const streamLabels: Record<Stream, string> = {
  science_pcm: 'Science (PCM)',
  science_pcb: 'Science (PCB)',
  commerce: 'Commerce',
  arts_humanities: 'Arts & Humanities',
  vocational: 'Vocational / ITI',
  general: 'General',
}

export const qualificationLabels: Record<Qualification, string> = {
  '10th_pass': '10th pass',
  '12th_pass': '12th pass',
}

export type Filters = {
  education: '' | Qualification
  stream: '' | Stream
  sector: string
  training: '' | '3' | '6' | '12'
}

export const emptyFilters: Filters = {
  education: '',
  stream: '',
  sector: '',
  training: '',
}

export const sectors = [...new Set(careers.map((c) => c.sector))].sort()

export const passesFilters = (c: Career, f: Filters) =>
  // A 12th-pass student can also take any 10th-pass entry route.
  (f.education === '' ||
    f.education === '12th_pass' ||
    c.qualification === '10th_pass') &&
  (f.stream === '' || c.streams.includes(f.stream)) &&
  (f.sector === '' || c.sector === f.sector) &&
  (f.training === '' || c.trainingMonths <= Number(f.training))

/* --------------------------------------------------------------------------
   Typical roadmap stages — mirrors the templates in
   backend/app/services/pathway.py (solar, data and the generic template).
   -------------------------------------------------------------------------- */

export type Stage = { stage: string; weeks: number; title: string }

export const roadmapFor = (c: Career): Stage[] => {
  if (c.roadmap === 'solar') {
    return [
      {
        stage: 'Foundational',
        weeks: 4,
        title: 'Basics of DC Electrical Systems & Solar Irradiance',
      },
      {
        stage: 'Intermediate',
        weeks: 6,
        title: 'Inverter Wiring & Rooftop Mounting Standards',
      },
      {
        stage: 'Applied',
        weeks: 6,
        title: 'Grid Interconnection, Testing & Net Metering',
      },
      {
        stage: 'Job-ready',
        weeks: 8,
        title: 'Apprenticeship Placement & EPC Field Experience',
      },
    ]
  }
  if (c.roadmap === 'data') {
    return [
      {
        stage: 'Foundational',
        weeks: 5,
        title: 'Data Literacy, Spreadsheets & SQL Fundamentals',
      },
      {
        stage: 'Intermediate',
        weeks: 6,
        title: 'Business Intelligence & Interactive Dashboarding',
      },
      {
        stage: 'Applied',
        weeks: 6,
        title: 'Python for Data Analysis & Automation',
      },
      {
        stage: 'Job-ready',
        weeks: 6,
        title: 'Real-world Capstone Portfolio & Interview Prep',
      },
    ]
  }
  return [
    { stage: 'Foundational', weeks: 4, title: `Core Foundations of ${c.name}` },
    {
      stage: 'Intermediate',
      weeks: 6,
      title: 'Applied Practice & Equipment Operation',
    },
    {
      stage: 'Applied',
      weeks: 6,
      title: 'Quality Assurance & Compliance Mastery',
    },
    {
      stage: 'Job-ready',
      weeks: 8,
      title: 'Apprenticeship, Job Placement & Industry Induction',
    },
  ]
}

export const formatLakh = (inr: number) =>
  `₹${(inr / 100000).toFixed(inr % 100000 === 0 ? 0 : 1)} L`

/* --------------------------------------------------------------------------
   Live catalogue — facts from GET /api/v1/careers/ override the bundled copy
   above, matched by slug. Layout data (family, icon, short name, roadmap
   template) stays local because the API has no notion of the map.
   -------------------------------------------------------------------------- */

export type ApiCareer = {
  id: number
  slug: string
  title: string
  sector: string
  description: string
  entry_qualification: string
  eligible_streams: string[]
  key_skills: string[]
  typical_interests: string[]
  starting_salary_inr: number
  mid_level_salary_inr: number
  growth_outlook: string
  training_duration_months: number
  financial_barrier: string
}

/** Readable label for any entry qualification the API may return. */
export const labelQualification = (q: string) =>
  qualificationLabels[q as Qualification] ?? q.replace(/_/g, ' ')

export function applyCatalogue(rows: ApiCareer[]): Career[] {
  const bySlug = new Map(rows.map((r) => [r.slug, r]))
  return careers.map((c) => {
    const r = bySlug.get(c.id)
    if (!r) return c
    return {
      ...c,
      title: r.title,
      sector: r.sector,
      description: r.description,
      qualification: r.entry_qualification as Qualification,
      streams: r.eligible_streams as Stream[],
      skills: r.key_skills,
      interests: r.typical_interests,
      startingSalary: r.starting_salary_inr,
      midSalary: r.mid_level_salary_inr,
      growth: r.growth_outlook,
      trainingMonths: r.training_duration_months,
      costBarrier: r.financial_barrier as Career['costBarrier'],
    }
  })
}
