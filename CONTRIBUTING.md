# Contributing to UdaanPath

Welcome to the **UdaanPath** project developed for the Citi India Hackathon! We are building an equitable career guidance and verified opportunity pathway platform for Indian youth.

## Git Branching Strategy

Our repository uses a trunk-and-feature branching workflow:

### Shared Branches
- `main`: Production-ready, stable releases only. Protected branch.
- `develop`: Primary integration branch for verified feature releases.

### Backend Feature Branches
- `backend/setup`: Core project architecture, FastAPI app factory, configuration, DB session management, and base models.
- `backend/profiles`: Comprehensive student profile data modeling, validation schemas, repository, and CRUD endpoints.
- `backend/careers-recommend`: Multi-factor career recommendation engine (corporate, vocational, government, creative) with explainable matching scores.
- `backend/pathways-generate`: Learning roadmap generator producing milestone-based progression steps, free/low-cost courses, and cost estimates.
- `backend/opportunities`: Directory of scholarships, government schemes, and apprenticeships backed by traceable source URLs and verification dates.
- `backend/eligibility`: Deterministic rule evaluation engine verifying age, income, marks, gender, category, and domicile criteria.
- `backend/progress`: Student milestone tracking, document readiness scoring, and opportunity application pipeline.
- `backend/facilitator`: Counselor/facilitator portal APIs, student vulnerability scoring, intervention notes, and curated opportunity assignment.
- `backend/ai-integration`: Optional Gemini/LLM integration with transparent deterministic rule-based fallback.
- `backend/tests-docs`: Comprehensive pytest suite, OpenAPI documentation, and frontend handoff specs.

### Frontend Branches (Tracked for Reference)
- `frontend/setup`: UI scaffolding, routing, design system, and API client.
- `frontend/student-profile`: Student onboarding, profile management, and document checklist UI.
- `frontend/careers-roadmap`: Interactive career explorer, recommendation cards, and timeline roadmaps.
- `frontend/opportunities`: Opportunity finder with instant eligibility badges and direct apply links.
- `frontend/facilitator`: Facilitator dashboard, caseload management, and intervention tooling.
- `frontend/integration-polish`: End-to-end UX polish, responsive layouts, and performance auditing.
- `frontend/ppt-demo-assets`: Hackathon pitch deck, high-resolution architecture diagrams, and demo recordings.

## Pull Request Guidelines

1. Never commit secrets, passwords, or production API keys to any branch.
2. Ensure all unit and integration tests pass before opening a PR (`pytest backend/tests`).
3. Follow PEP 8 style conventions and Pydantic v2 validation standards.
4. Keep PRs focused on single feature branches.
