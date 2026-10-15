# UdaanPath — Frontend API Handoff Document

This document serves as the complete specification for frontend engineers building the web and mobile interfaces for UdaanPath.

## 1. General API Specifications

- **Base URL**: `http://localhost:8000/api/v1` (Development)
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc Specification**: `http://localhost:8000/redoc`
- **Content Type**: `application/json`
- **Standard Error Response Format**:
  ```json
  {
    "detail": "Descriptive error message"
  }
  ```

---

## 2. Health & System Probes

### `GET /api/v1/health`
Liveness check for container orchestration and uptime monitoring.
- **Response `200 OK`**:
  ```json
  {
    "status": "healthy",
    "app_name": "UdaanPath",
    "version": "1.0.0",
    "timestamp": "2026-10-15T15:30:00Z"
  }
  ```

### `GET /api/v1/ready`
Readiness probe verifying database connectivity.
- **Response `200 OK`**:
  ```json
  {
    "status": "ready",
    "database": "connected",
    "llm_enabled": false,
    "timestamp": "2026-10-15T15:30:00Z"
  }
  ```

---

## 3. Student Profile APIs (`/api/v1/profiles`)

### `POST /api/v1/profiles/`
Create a new student profile.
- **Request Body**:
  ```json
  {
    "full_name": "Aarav Sharma",
    "email": "aarav.sharma@example.com",
    "phone": "+919876543210",
    "age": 19,
    "gender": "male",
    "category": "OBC",
    "state": "Uttar Pradesh",
    "district": "Varanasi",
    "location_tier": "tier_2",
    "annual_family_income": 180000.0,
    "financial_constraint": "high",
    "education_level": "12th_pass",
    "stream": "science_pcm",
    "percentage_marks": 78.5,
    "skills": ["Basic Python", "Electrical Circuits", "Problem Solving"],
    "interests": ["Solar Energy", "Electronics", "Green Tech"],
    "languages": ["Hindi", "Bhojpuri", "English"],
    "career_aspirations": ["Renewable Energy Technician", "Electrical Engineer"]
  }
  ```
- **Response `201 Created`**: Returns created `StudentProfile` with assigned `id` (integer) and timestamps.

### `GET /api/v1/profiles/{id}`
Fetch full profile by student ID.
- **Response `200 OK`**: `StudentProfile` object.

### `PUT /api/v1/profiles/{id}`
Update existing student profile.
- **Response `200 OK`**: Updated `StudentProfile` object.

### `GET /api/v1/profiles/`
List student profiles with optional search and pagination (`skip`, `limit`, `state`, `education_level`).

---

## 4. Career Recommendations (`/api/v1/careers`)

### `POST /api/v1/careers/recommend`
Generates ranked, diverse career recommendations tailored to the student.
- **Request Body**:
  ```json
  {
    "student_id": 1,
    "limit": 5
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "student_id": 1,
    "total_recommendations": 5,
    "recommendations": [
      {
        "career_id": 3,
        "title": "Solar PV Installation & Maintenance Technician",
        "category": "vocational_skilled_trades",
        "sector": "Renewable Energy",
        "match_score": 92.5,
        "rationale": "High match with your Science PCM background, interest in Solar Energy, and basic electrical skills. Excellent fast-track earning potential under PM Surya Ghar Yojana.",
        "starting_salary_inr": 240000,
        "mid_level_salary_inr": 550000,
        "growth_outlook": "Very High (Government push for rooftop solar)",
        "entry_qualification": "10th/12th or ITI Electrical/Solar",
        "key_skills": ["PV System Sizing", "Inverter Wiring", "Safety Compliance"]
      },
      {
        "career_id": 1,
        "title": "Junior Data Analyst",
        "category": "corporate_tech",
        "sector": "Information Technology & Analytics",
        "match_score": 84.0,
        "rationale": "Strong alignment with your analytical skills and Python foundation.",
        "starting_salary_inr": 350000,
        "mid_level_salary_inr": 900000,
        "growth_outlook": "High",
        "entry_qualification": "12th or Graduate in Science/Commerce",
        "key_skills": ["SQL", "Excel", "Data Visualization", "Python"]
      }
    ]
  }
  ```

### `GET /api/v1/careers`
List available career tracks in catalog with filtering by `category`, `sector`, and `min_salary`.

### `GET /api/v1/careers/{id}`
Detailed view of a specific career track.

---

## 5. Learning Roadmaps (`/api/v1/pathways`)

### `POST /api/v1/pathways/generate`
Generates a structured, 4-stage milestone roadmap for a student towards a selected career.
- **Request Body**:
  ```json
  {
    "student_id": 1,
    "career_id": 3,
    "weekly_study_hours": 15
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "id": 1,
    "student_id": 1,
    "career_id": 3,
    "career_title": "Solar PV Installation & Maintenance Technician",
    "total_estimated_duration_months": 9,
    "total_estimated_cost_inr": 3500.0,
    "free_alternative_available": true,
    "milestones": [
      {
        "id": 1,
        "stage": "foundational",
        "step_number": 1,
        "title": "Basics of DC Electrical Systems & Solar Irradiance",
        "description": "Learn fundamentals of voltage, current, power calculations, and solar panel cell mechanics.",
        "duration_weeks": 4,
        "skills_to_acquire": ["Ohm's Law", "Multimeter Usage", "Panel Types"],
        "recommended_certification": "Skill India National Solar Mission Primer",
        "estimated_cost_inr": 0.0,
        "free_alternative_resource": "SWAYAM / NPTEL Solar Energy Basics & YouTube Ministry of New and Renewable Energy playlist",
        "resource_url": "https://swayam.gov.in"
      },
      {
        "id": 2,
        "stage": "intermediate",
        "step_number": 2,
        "title": "Inverter Wiring & Safety Protocols",
        "description": "Master grid-tied vs off-grid inverters, battery management, and earthing installation.",
        "duration_weeks": 8,
        "skills_to_acquire": ["Earthing", "Conduit Bending", "Battery Storage"],
        "recommended_certification": "Skill Council for Green Jobs (SCGJ) Solar PV Installer Certificate",
        "estimated_cost_inr": 2000.0,
        "free_alternative_resource": "NISE (National Institute of Solar Energy) free course materials",
        "resource_url": "https://nise.res.in"
      }
    ]
  }
  ```

---

## 6. Opportunities & Deterministic Eligibility (`/api/v1/opportunities` & `/api/v1/eligibility`)

### `GET /api/v1/opportunities`
Browse verified scholarships, government welfare schemes, and apprenticeships.
- **Query Params**: `type` (`scholarship`, `scheme`, `apprenticeship`), `category`, `state`, `search`.
- Each opportunity includes `source_url`, `verification_date`, and `verified_by`.

### `POST /api/v1/eligibility/check`
Execute deterministic rule evaluation for a student against a specific opportunity.
- **Request Body**:
  ```json
  {
    "student_id": 1,
    "opportunity_id": 1
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "student_id": 1,
    "opportunity_id": 1,
    "opportunity_title": "National Scholarship Portal (NSP) - Post Matric Scholarship",
    "status": "ELIGIBLE",
    "match_score": 100.0,
    "passed_criteria": [
      "Annual family income (₹1,80,000) is within ceiling (₹2,50,000)",
      "Academic marks (78.5%) meet minimum requirement (50.0%)",
      "Age (19) is within range (16 - 30)",
      "Category OBC is eligible under target groups",
      "Education level (12th_pass) satisfies minimum prerequisite"
    ],
    "failed_criteria": [],
    "required_documents": [
      "Income Certificate issued by Revenue Authority / Tehsildar",
      "Aadhaar Card",
      "Class 10th & 12th Marksheets",
      "OBC Caste/Category Certificate",
      "Active Bank Account Passbook seeded with Aadhaar"
    ],
    "actionable_next_steps": "Apply via official portal before deadline. Ensure your bank account is Aadhaar-seeded for DBT (Direct Benefit Transfer).",
    "source_url": "https://scholarships.gov.in",
    "verification_date": "2026-03-15"
  }
  ```

---

## 7. Progress Tracking (`/api/v1/progress`)

### `GET /api/v1/progress/student/{student_id}`
Returns complete student progress snapshot:
- **Response `200 OK`**:
  ```json
  {
    "student_id": 1,
    "completed_milestones_count": 2,
    "total_milestones_count": 4,
    "overall_completion_percentage": 50.0,
    "document_readiness_score": 80.0,
    "earned_badges": [
      { "id": 101, "name": "Foundations Master", "earned_at": "2026-10-10T12:00:00Z" }
    ],
    "applications": [
      {
        "id": 1,
        "opportunity_id": 1,
        "opportunity_title": "National Scholarship Portal (NSP)",
        "status": "APPLIED",
        "applied_date": "2026-10-12",
        "notes": "Application submitted via CSC center"
      }
    ]
  }
  ```

### `POST /api/v1/progress/milestones/{id}/status`
Update milestone status (`not_started`, `in_progress`, `completed`).

### `POST /api/v1/progress/applications`
Record or update an opportunity application status (`SAVED`, `APPLIED`, `SHORTLISTED`, `AWARDED`, `REJECTED`).

---

## 8. Facilitator Console (`/api/v1/facilitator`)

### `GET /api/v1/facilitator/dashboard`
Returns counselor caseload overview:
- Total students assigned
- Students at-risk count (high financial constraint + lagging progress)
- Top required interventions

### `GET /api/v1/facilitator/students`
List assigned students with calculated `vulnerability_score` and filter for `is_at_risk=true`.

### `POST /api/v1/facilitator/interventions`
Log a counselor intervention or note:
```json
{
  "student_id": 1,
  "facilitator_name": "Priya Verma (Counselor)",
  "category": "financial_aid",
  "notes": "Guided student on obtaining Tehsildar income certificate for NSP scholarship application.",
  "follow_up_date": "2026-10-25"
}
```

### `POST /api/v1/facilitator/assign-opportunity`
Facilitator curates and assigns an opportunity to a student.

---

## 9. AI Narrative Advisor (`/api/v1/ai`)

### `POST /api/v1/ai/advice`
Generates personalized narrative guidance.
- If `ENABLE_LLM=True` and API key is set, generates dynamic Gemini response.
- **Always safe**: If disabled or offline, transparently falls back to rule-based advice.
- **Response**:
  ```json
  {
    "student_id": 1,
    "narrative_advice": "Aarav, your background in Science PCM paired with your interest in Solar Energy makes you a prime candidate for the booming renewable sector...",
    "key_takeaways": [
      "Prioritize obtaining the SCGJ Solar PV certification.",
      "Apply for the NSP scholarship to cover your technical tools."
    ],
    "is_ai_generated": false,
    "provider": "rule_engine_fallback"
  }
  ```

---

## 10. Frontend Implementation Recommendations

- **State Management**: Use TanStack Query (React Query) with standard keys `['profiles', id]`, `['recommendations', studentId]`, `['pathway', pathwayId]`, `['opportunities']`.
- **Badges**: Use colors green for `ELIGIBLE`, yellow for `PARTIALLY_ELIGIBLE`, and grey for `INELIGIBLE`.
- **Forms**: Implement multi-step wizard for profile onboarding: (1) Demographics & Category -> (2) Academics & Stream -> (3) Skills & Interests -> (4) Financial Constraints.
