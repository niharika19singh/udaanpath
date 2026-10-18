/**
 * UdaanPath API Client
 * Connects frontend UI to FastAPI backend endpoints.
 */

import type { ApiCareer } from '../careers/discovery'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(
  /\/+$/,
  '',
)

export interface StudentProfileData {
  id?: number
  full_name: string
  email: string
  phone?: string
  age: number
  gender: string
  category: string
  state: string
  district: string
  location_tier?: string
  annual_family_income: number
  financial_constraint?: string
  education_level: string
  stream?: string
  percentage_marks: number
  skills: string[]
  interests: string[]
  languages: string[]
  career_aspirations: string[]
  is_at_risk?: boolean
}

export interface CareerItem {
  career_id: number
  title: string
  category: string
  sector: string
  match_score: number
  rationale: string
  starting_salary_inr: number
  mid_level_salary_inr: number
  growth_outlook: string
  entry_qualification: string
  key_skills: string[]
  financial_barrier: string
}

export interface CareerRecommendationResponse {
  student_id: number
  total_recommendations: number
  recommendations: CareerItem[]
}

export interface MilestoneItem {
  id: number
  pathway_id: number
  stage: 'foundational' | 'intermediate' | 'advanced' | 'job_ready' | string
  step_number: number
  title: string
  description: string
  duration_weeks: number
  skills_to_acquire: string[]
  recommended_certification?: string
  estimated_cost_inr: number
  free_alternative_resource: string
  resource_url: string
  status: 'not_started' | 'in_progress' | 'completed' | string
}

export interface PathwayResponse {
  id: number
  student_id: number
  career_id: number
  career_title: string
  total_estimated_duration_months: number
  total_estimated_cost_inr: number
  free_alternative_available: boolean
  weekly_study_hours: number
  is_active: boolean
  milestones: MilestoneItem[]
}

export interface OpportunityItem {
  id: number
  title: string
  slug: string
  type: string
  provider: string
  description: string
  official_portal_url: string
  verification_date: string
  verified_by: string
  financial_benefit_inr: number
  financial_benefit_description: string
  income_ceiling?: number
  min_age?: number
  max_age?: number
  min_marks_percentage?: number
  required_documents: string[]
  actionable_steps: string
}

export interface OpportunityMatchItem {
  opportunity: OpportunityItem
  match_score: number
  eligibility_status: 'ELIGIBLE' | 'PARTIALLY_ELIGIBLE' | 'INELIGIBLE' | string
  reasons: string[]
}

export interface OpportunityMatchResponse {
  student_id: number
  total_matches: number
  opportunities: OpportunityMatchItem[]
}

export interface AiAdvisorResponse {
  student_id: number
  narrative_advice: string
  key_takeaways: string[]
  is_ai_generated: boolean
  provider: string
  suggested_action_items: string[]
  /** What the question was classified as (careers, funding, ...). */
  topic?: string
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`
    try {
      const errorJson = await response.json()
      if (errorJson.detail) {
        errorMessage = Array.isArray(errorJson.detail)
          ? errorJson.detail
              .map((e: { msg?: string }) => e.msg || JSON.stringify(e))
              .join(', ')
          : String(errorJson.detail)
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

export const api = {
  createProfile: async (
    data: StudentProfileData,
  ): Promise<StudentProfileData> => {
    return request<StudentProfileData>('/profiles/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getProfile: async (id: number): Promise<StudentProfileData> => {
    return request<StudentProfileData>(`/profiles/${id}`)
  },

  listCareers: async (): Promise<ApiCareer[]> => {
    return request<ApiCareer[]>('/careers/?limit=100')
  },

  getRecommendations: async (
    studentId: number,
    limit = 6,
  ): Promise<CareerRecommendationResponse> => {
    return request<CareerRecommendationResponse>('/careers/recommend', {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId, limit }),
    })
  },

  generatePathway: async (
    studentId: number,
    careerId: number,
    weeklyHours = 12,
  ): Promise<PathwayResponse> => {
    return request<PathwayResponse>('/pathways/generate', {
      method: 'POST',
      body: JSON.stringify({
        student_id: studentId,
        career_id: careerId,
        weekly_study_hours: weeklyHours,
      }),
    })
  },

  updateMilestoneStatus: async (
    milestoneId: number,
    status: string,
  ): Promise<MilestoneItem> => {
    return request<MilestoneItem>(
      `/pathways/milestones/${milestoneId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
    )
  },

  matchOpportunities: async (
    studentId: number,
    limit = 6,
  ): Promise<OpportunityMatchResponse> => {
    return request<OpportunityMatchResponse>('/opportunities/match', {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId, limit }),
    })
  },

  listOpportunities: async (
    type?: string,
    search?: string,
  ): Promise<OpportunityItem[]> => {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    if (search) params.set('search', search)
    const queryString = params.toString() ? `?${params.toString()}` : ''
    return request<OpportunityItem[]>(`/opportunities/${queryString}`)
  },

  askAiAdvisor: async (
    studentId: number,
    query: string,
  ): Promise<AiAdvisorResponse> => {
    return request<AiAdvisorResponse>('/ai/advise', {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId, query }),
    })
  },

  checkHealth: async (): Promise<{ status: string; app: string }> => {
    return request<{ status: string; app: string }>('/health')
  },
}
