# UdaanPath — Git Branching Strategy & Responsibilities

This document defines the purpose, responsibilities, code ownership, and merge policies for all branches in the `udaanpath` repository.

---

## Shared Branches

### `main`
- **Purpose**: Stable production releases.
- **Protection**: Direct pushes prohibited. Merges only via Pull Requests from `develop` after all tests pass.
- **Release Cadence**: Tagged releases (v1.0.0, etc.).

### `develop`
- **Purpose**: Active integration branch where completed feature branches land.
- **Rules**: Must remain in a buildable and test-passing state at all times.

---

## Backend Feature Branches

### 1. `backend/setup`
- **Initial Branch**: First backend branch created.
- **Responsibilities**:
  - FastAPI application factory (`backend/app/main.py`).
  - Configuration management with Pydantic BaseSettings (`backend/app/core/config.py`).
  - Database connectivity and session lifecycle (`backend/app/core/database.py`).
  - Base SQLAlchemy model definitions (`backend/app/models/base.py`).
  - Health (`/api/v1/health`) and Readiness (`/api/v1/ready`) probes.
  - Initial Alembic migration environment (`backend/alembic/`).
  - Root `.env.example`, `.gitignore`, `README.md`, `CONTRIBUTING.md`.

### 2. `backend/profiles`
- **Responsibilities**:
  - Student profile data model (`StudentProfile`).
  - Pydantic schemas for student profile creation, updates, and responses.
  - Academic criteria: 10th marks, 12th stream/marks, degree/diploma details.
  - Socioeconomic criteria: Family income (INR), financial constraint level, category (General/OBC/SC/ST/EWS), gender, domicile state, district, location tier.
  - Profile repository and service layer with CRUD endpoints.

### 3. `backend/careers-recommend`
- **Responsibilities**:
  - Career catalog model (`Career`) and seed dataset in `backend/data/careers.json`.
  - Diverse career tracks: Corporate, Vocational & Skilled Trades, Government & Public Sector, Creative & Emerging.
  - Multi-factor recommendation algorithm (`RecommendationService`):
    - Academic level and stream compatibility.
    - Skill and interest overlap scoring.
    - Financial constraint compatibility (prioritizing low barrier-to-entry and immediate earning potential for high-constraint students).
  - Career endpoints: Catalog browsing, detailed view, and personalized recommendations.

### 4. `backend/pathways-generate`
- **Responsibilities**:
  - Roadmap models (`Pathway`, `PathwayMilestone`).
  - Milestone generator creating a 4-stage progression:
    - Stage 1: Foundational (Months 1-3)
    - Stage 2: Intermediate (Months 4-6)
    - Stage 3: Applied & Specialization (Months 7-9)
    - Stage 4: Placement & Job-Ready (Months 10-12)
  - Identifies free course alternatives (SWAYAM, NPTEL, YouTube curated playlists) alongside recognized certifications with estimated costs.
  - Pathway endpoints: `/api/v1/pathways/generate`, `/api/v1/pathways/{id}`.

### 5. `backend/opportunities`
- **Responsibilities**:
  - Opportunity model (`Opportunity`) supporting scholarships, government schemes, and apprenticeships.
  - Verified catalog in `backend/data/opportunities.json` with real Indian schemes (NSP, PMKVY 4.0, AICTE Pragati, NATS, Vidyasaarathi, Kotak Kanya) with official URLs and verification dates.
  - Search, filtering (by type, state, education level), and matching endpoints.

### 6. `backend/eligibility`
- **Responsibilities**:
  - Deterministic Rule Engine (`EligibilityEngine`).
  - Evaluates student profiles against opportunity eligibility rules:
    - Income ceiling check (`annual_income <= income_ceiling`)
    - Age range check (`min_age <= age <= max_age`)
    - Minimum academic percentage check
    - Gender specificity check (e.g., female-only scholarships)
    - Category / caste check (SC, ST, OBC, EWS, General)
    - Domicile state criteria
    - Current educational level and stream compatibility
  - Returns auditable outcome: `ELIGIBLE`, `INELIGIBLE`, or `PARTIALLY_ELIGIBLE`, accompanied by match score, passed rules, missing rules, and required documentation checklist.

### 7. `backend/progress`
- **Responsibilities**:
  - Progress models: `MilestoneProgress`, `OpportunityApplication`, `SkillBadge`, `StudentDocument`.
  - Milestone completion toggling and progress percentage calculations.
  - Opportunity application status lifecycle: `SAVED` -> `APPLIED` -> `SHORTLISTED` -> `AWARDED` / `REJECTED`.
  - Document readiness scoring (Aadhaar, Income Certificate, Domicile, Marksheets).

### 8. `backend/facilitator`
- **Responsibilities**:
  - Facilitator/Counselor data models and assignment mappings.
  - Facilitator caseload overview: total assigned students, at-risk flags, milestone completion distribution.
  - Vulnerability scoring: identifies students requiring urgent financial or academic intervention.
  - Counselor intervention logging and direct opportunity curation/assignment.

### 9. `backend/ai-integration`
- **Responsibilities**:
  - LLM integration service with Gemini API (`app/services/ai_advisor.py`).
  - Generates personalized narrative advice and roadmap enrichment.
  - **Fail-safe fallback**: Transparently falls back to rule-based advice when API key is missing or offline.
  - No disruption to core user flow if LLM is disabled.

### 10. `backend/tests-docs`
- **Responsibilities**:
  - Full pytest test suite covering all modules, edge cases, and deterministic criteria.
  - Database seed script (`backend/data/seed.py`).
  - Comprehensive documentation updates.

---

## Frontend Branches (Tracked References)

The frontend branches remain unimplemented in the current backend focus phase. Their references and planned scopes are:

1. `frontend/setup`: Project initialization (Vite/React/Next.js), Tailwind styling, and API client configuration.
2. `frontend/student-profile`: Profile wizard, academic entry, and socioeconomic questionnaire.
3. `frontend/careers-roadmap`: Career cards, match rationale, and interactive milestone roadmap view.
4. `frontend/opportunities`: Opportunity cards, filter panel, and instant eligibility status badges.
5. `frontend/facilitator`: Counselor portal, caseload table, intervention notes, and student deep-dive.
6. `frontend/integration-polish`: Responsive UI, accessibility improvements, loading states, and error handling.
7. `frontend/ppt-demo-assets`: Presentation deck, system architecture diagrams, and product demo screenshots.
