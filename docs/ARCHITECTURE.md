# UdaanPath — Architectural Blueprint

## System Overview

UdaanPath is designed as a modular, service-oriented backend following clean architecture principles. It decouples core business logic (services) from database storage (repositories) and HTTP transport (FastAPI routers).

```
                      ┌────────────────────────┐
                      │    FastAPI Routers     │
                      │ (app/api/v1/*.py)      │
                      └───────────┬────────────┘
                                  │
                                  ▼
                      ┌────────────────────────┐
                      │    Service Layer       │
                      │ (app/services/*.py)    │
                      │ - Recommendation       │
                      │ - Eligibility Engine   │
                      │ - Pathway Generator    │
                      │ - AI Advisor Fallback  │
                      └───────────┬────────────┘
                                  │
                                  ▼
                      ┌────────────────────────┐
                      │   Repository Layer     │
                      │ (app/repositories/*.py)│
                      └───────────┬────────────┘
                                  │
                                  ▼
                      ┌────────────────────────┐
                      │  SQLAlchemy ORM Models │
                      │ (app/models/*.py)      │
                      └───────────┬────────────┘
                                  │
                                  ▼
                      ┌────────────────────────┐
                      │ PostgreSQL / SQLite DB │
                      └────────────────────────┘
```

## Core Architectural Modules

### 1. Deterministic Eligibility Engine (`app/services/eligibility.py`)
- Evaluates student attributes against strict criteria defined on each Opportunity:
  - `income_ceiling`: Checks student's annual household income.
  - `min_age` & `max_age`: Bounds student's age.
  - `min_percentage`: Validates academic marks threshold.
  - `allowed_genders`: Enforces gender-specific affirmative action schemes (e.g., Pragati Scholarship for Girls).
  - `allowed_categories`: Verifies caste/economic reservation eligibility (SC, ST, OBC, EWS, General).
  - `domicile_states`: Validates state-specific reservations.
  - `education_levels`: Ensures scheme matches current academic stage (e.g., Diploma vs Undergraduate).
- **Explainability**: Every result returns `passed_criteria`, `failed_criteria`, `match_score`, and `required_documents`.

### 2. Multi-Factor Career Recommendation Engine (`app/services/recommendation.py`)
- Scored across 4 weighted dimensions:
  1. **Academic Alignment (35%)**: Minimum education, stream fit, and prerequisite marks.
  2. **Skill Overlap (30%)**: Jaccard similarity between student skills and required career skills.
  3. **Interest & Sector Match (20%)**: Sector preferences and aspirations.
  4. **Socioeconomic & Feasibility Fit (15%)**: For high financial constraint students, prioritizes trades, apprenticeships, and vocational routes with low training cost and fast income generation.
- **Diversity Enforcement**: Returns options across corporate, vocational, government, and creative domains.

### 3. Pathway Generator (`app/services/pathway.py`)
- Generates a 4-stage progression roadmap tailored to the target career:
  - **Foundational**: Core principles, tools, and terminology.
  - **Intermediate**: Practical projects, intermediate frameworks, and domain standards.
  - **Applied / Advanced**: Industry-standard certifications and specialized workflows.
  - **Job-Ready**: Portfolio building, interview preparation, and apprenticeship/entry applications.
- Pairs every paid certification with a verified free alternative (SWAYAM, NPTEL, YouTube).

### 4. Optional AI Advisor (`app/services/ai_advisor.py`)
- Configured via `ENABLE_LLM` and `GEMINI_API_KEY`.
- If enabled, invokes the Gemini API to compose empathetic, culturally attuned counseling narratives.
- If disabled or if an error occurs, transparently invokes the deterministic rule-based advice generator.

### 5. Facilitator Caseload Management (`app/services/facilitator.py`)
- Computes a vulnerability index:
  $$\text{Vulnerability} = 0.4 \times \text{FinancialConstraint} + 0.3 \times \text{AcademicRisk} + 0.3 \times \text{MilestoneLag}$$
- Helps counselors triage students who need immediate intervention.
