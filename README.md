# UdaanPath (उड़ानपथ) 🚀

> **Citi India Hackathon Project**  
> An equitable, AI-assisted career guidance, vocational empowerment, and verified opportunity pathway platform tailored for Indian students and job-seekers.

[![UdaanPath CI](https://github.com/niharika19singh/udaanpath/actions/workflows/ci.yml/badge.svg)](https://github.com/niharika19singh/udaanpath/actions)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB.svg?logo=python&logoColor=white)](https://www.python.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0%2B-red.svg)](https://www.sqlalchemy.org)
[![Pydantic](https://img.shields.io/badge/Pydantic-v2-E92063.svg)](https://docs.pydantic.dev)
[![Alembic](https://img.shields.io/badge/Alembic-Migrations-black.svg)](https://alembic.sqlalchemy.org)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 The Problem & Our Solution

Millions of students in India, especially from Tier-2/Tier-3 cities, rural regions, and low-income households, lack access to personalized, actionable career guidance. Traditional counseling is inaccessible or narrowly biased towards conventional software engineering and medical degrees, often overlooking high-growth vocational, public sector, green energy, and skilled technical pathways.

Furthermore, students struggle to navigate complex government scholarships, corporate CSR grants (like Citi Foundation), and apprenticeship schemes due to opaque and confusing eligibility criteria.

**UdaanPath bridges this gap through:**
1. **Holistic Student Profiles**: Capturing academic records, stream, skills, location tier, family income constraints, and career interests.
2. **Diverse Career Recommendations**: Multi-dimensional scoring recommending corporate, vocational/trades, government, and creative careers.
3. **Step-by-Step Learning Roadmaps**: Actionable 4-stage milestones (Foundational -> Intermediate -> Advanced -> Job-Ready) with free/low-cost courses and cost estimations.
4. **Verified Opportunities with Deterministic Eligibility**: Real Indian schemes (NSP, PMKVY 4.0, AICTE Pragati, NATS, Vidyasaarathi) with auditable eligibility verification based on official rules.
5. **Progress & Readiness Tracking**: Milestone completion tracking, badge rewards, and document readiness scoring.
6. **Facilitator & Counselor Portal**: Enabling teachers, mentors, and NGO workers to monitor vulnerable students, log interventions, and assign opportunities.
7. **Optional AI Narrative Advice with Rule-Based Fallback**: Seamless LLM integration (Gemini) for natural counseling narratives, with instant deterministic rule-based fallback if offline or disabled.

---

## 🏗️ Architecture & Stack

```
                                  ┌─────────────────────────────┐
                                  │      Client Applications    │
                                  │   (Web React / Mobile App)  │
                                  └──────────────┬──────────────┘
                                                 │ HTTP / REST
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 UdaanPath FastAPI Backend                               │
│                                                                                         │
│  ┌───────────────────┐    ┌────────────────────┐    ┌────────────────────────────────┐  │
│  │   Profile Engine  │    │ Career Rec Engine  │    │    Deterministic Eligibility   │  │
│  │  (Demographics,   │    │  (Multi-factor     │    │       Verification Engine      │  │
│  │   Academics,      │    │   rule scoring,    │    │ (Age, Income, Marks, Category, │  │
│  │   Socioeconomic)  │    │   diversity-first) │    │  Domicile, Stream criteria)    │  │
│  └─────────┬─────────┘    └─────────┬──────────┘    └───────────────┬────────────────┘  │
│            │                        │                               │                   │
│  ┌─────────┴─────────┐    ┌─────────┴──────────┐    ┌───────────────┴────────────────┐  │
│  │ Pathway Generator │    │ Progress Tracker   │    │      Facilitator Console       │  │
│  │ (4-Stage Roadmap, │    │ (Milestones,       │    │   (Caseload, At-Risk scoring,  │  │
│  │  Free Alternatives)│   │  Badges, Docs)     │    │    Interventions, Assignments) │  │
│  └─────────┬─────────┘    └─────────┬──────────┘    └───────────────┬────────────────┘  │
│            │                        │                               │                   │
│  ┌─────────┴────────────────────────┴───────────────────────────────┴────────────────┐  │
│  │                   Optional AI Advisor (Gemini API / Rule Fallback)                │  │
│  └──────────────────────────────────┬────────────────────────────────────────────────┘  │
└─────────────────────────────────────┼───────────────────────────────────────────────────┘
                                      │ SQLAlchemy 2.0 / Alembic
                                      ▼
                        ┌───────────────────────────┐
                        │    PostgreSQL Database    │
                        │ (SQLite in-memory for CI) │
                        └───────────────────────────┘
```

---

## 📁 Repository Structure

```
udaanpath/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions Automated CI
├── .gitignore                   # Safe git ignore rules (no secrets/virtualenvs)
├── .env.example                 # Environment configuration template
├── README.md                    # Project overview and instructions
├── CONTRIBUTING.md              # Branching model & contributing guidelines
├── docs/
│   ├── ARCHITECTURE.md          # In-depth architectural blueprint
│   ├── BRANCHES.md              # Documentation of each branch's responsibility
│   └── FRONTEND_API_HANDOFF.md  # Complete API handoff guide for frontend team
├── frontend/
│   └── README.md                # Frontend status, tracked branches, and wireframes
└── backend/
    ├── alembic.ini              # Alembic migration configuration
    ├── pyproject.toml           # Packaging and pytest configuration
    ├── requirements.txt         # Pinned backend dependencies
    ├── alembic/                 # Database schema migrations
    │   ├── env.py
    │   └── versions/
    │       └── 0001_initial_schema.py
    ├── data/
    │   ├── careers.json         # Seed catalog of diverse career profiles
    │   ├── opportunities.json   # Verified Indian scholarships & schemes
    │   └── seed.py              # CLI seed script for database
    ├── app/
    │   ├── main.py              # FastAPI application entry point
    │   ├── api/
    │   │   ├── router.py        # Central API v1 router
    │   │   └── v1/
    │   │       ├── health.py    # Health & readiness probes
    │   │       ├── profiles.py  # Student profile endpoints
    │   │       ├── careers.py   # Career recommendations & catalog
    │   │       ├── pathways.py  # Learning roadmap endpoints
    │   │       ├── opportunities.py # Opportunity search & match
    │   │       ├── eligibility.py   # Deterministic eligibility engine
    │   │       ├── progress.py  # Milestones, badges, applications
    │   │       ├── facilitator.py   # Counselor dashboard & interventions
    │   │       └── ai.py        # AI narrative advice (with fallback)
    │   ├── core/
    │   │   ├── config.py        # Settings via Pydantic BaseSettings
    │   │   ├── database.py      # Engine, sessionmaker, Base model
    │   │   └── logging.py       # Structured application logger
    │   ├── models/              # SQLAlchemy ORM Models
    │   ├── schemas/             # Pydantic v2 Request/Response Schemas
    │   ├── repositories/        # Database access layer
    │   └── services/            # Pure business logic & algorithms
    └── tests/                   # Pytest test suite
```

---

## 🌿 Git Branches & Responsibilities

| Branch | Domain | Description |
|---|---|---|
| `main` | Shared | Production-ready, stable codebase |
| `develop` | Shared | Central staging & integration branch |
| `backend/setup` | Backend | Scaffolding, configuration, database engine, health probes |
| `backend/profiles` | Backend | Student profiles, academic details, socioeconomic attributes |
| `backend/careers-recommend` | Backend | Diverse career catalog and multi-factor recommendation engine |
| `backend/pathways-generate` | Backend | Step-by-step milestone roadmaps with free alternatives |
| `backend/opportunities` | Backend | Verified Indian scholarships, government schemes, and apprenticeships |
| `backend/eligibility` | Backend | Deterministic, explainable rule-checking engine |
| `backend/progress` | Backend | Milestone tracking, badges, document readiness, applications |
| `backend/facilitator` | Backend | Facilitator console, at-risk filtering, interventions |
| `backend/ai-integration` | Backend | Optional Gemini LLM integration with rule-based fallback |
| `backend/tests-docs` | Backend | Pytest suite, API documentation, seed scripts |
| `frontend/*` | Frontend | Tracked reference branches for future UI work (unimplemented) |

---

## 🚀 Local Quick Start

### 1. Prerequisites
- Python 3.10+ (Tested on Python 3.11 & 3.13)
- PostgreSQL 14+ (or use SQLite mode by default)
- Git

### 2. Setup Environment
```bash
git clone https://github.com/niharika19singh/udaanpath.git
cd udaanpath

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt
```

### 3. Environment Configuration
```bash
cp .env.example .env
# Edit .env if you wish to configure a PostgreSQL database or Gemini API key.
# By default, SQLite (sqlite:///./udaanpath.db) is supported for seamless instant setup!
```

### 4. Database Initialization & Seed Data
```bash
cd backend
# Run database migrations
alembic upgrade head

# Seed verified careers and opportunities
python -m data.seed
cd ..
```

### 5. Run the Server
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

The interactive OpenAPI documentation will be live at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
- **Readiness Check**: [http://localhost:8000/api/v1/ready](http://localhost:8000/api/v1/ready)

### 6. Run the Test Suite
```bash
cd backend
pytest -v
```

---

## 🔐 Access Control

- **Students:** creating a profile (`POST /api/v1/profiles/`) returns an `access_key` once; only its SHA-256 hash is stored. Every request for that student's data must send `Authorization: Bearer <access_key>`. The web app keeps the key in the browser tab's session storage, so it is lost when the tab closes.
- **Facilitators:** accounts are created by an admin (no self sign-up). `POST /api/v1/facilitator/login` returns a token that expires after `FACILITATOR_TOKEN_TTL_MINUTES`. Listing students (`GET /api/v1/profiles/`, `/api/v1/facilitator/*`) requires it.
- **Public:** profile creation, the career and opportunity catalogues, and health checks.

Create or reset a facilitator account (the password is asked for at a hidden prompt):
```bash
python backend/scripts/create_facilitator.py counselor@example.org "Full Name"
```

After pulling these changes, upgrade an existing local database once with `cd backend && alembic upgrade head`.

---

## ☁️ Deployment (Render)

`render.yaml` is a Render Blueprint with three resources: `udaanpath-api` (FastAPI), `udaanpath-web` (static Vite build with an `index.html` rewrite so `/onboarding`, `/careers`, `/roadmap`, `/opportunities`, `/advisor` and `/educators` survive refresh), and `udaanpath-db` (Postgres).

1. In Render, create a **Blueprint** from this repository. Render generates `SECRET_KEY` and wires `DATABASE_URL`.
2. Copy the **web** service's URL from the dashboard and set it on `udaanpath-api` as `CORS_ORIGINS`, e.g. `["https://<web-service>.onrender.com"]`. With `APP_ENV=production` the API refuses to start until this lists only `https://` origins and `SECRET_KEY` is a real secret.
3. Copy the **api** service's URL and set it on `udaanpath-web` as `VITE_API_BASE_URL`, e.g. `https://<api-service>.onrender.com/api/v1`, then redeploy the web service. Vite reads it at build time.
4. Create the first facilitator account by running the script above with `DATABASE_URL` set to the database's external connection string (or from the API service's shell).
5. Check `https://<api-service>.onrender.com/api/v1/health`, then open the web URL and refresh on `/roadmap`.

| Variable | Service | Required | Notes |
|---|---|---|---|
| `DATABASE_URL` | api | yes | From the Render database |
| `SECRET_KEY` | api | yes | Generated by Render; signs facilitator tokens |
| `CORS_ORIGINS` | api | yes | JSON list of the frontend's `https://` origin(s) |
| `APP_ENV` | api | yes | `production` turns on the safety checks |
| `FACILITATOR_TOKEN_TTL_MINUTES` | api | no | Default 480 |
| `ENABLE_LLM`, `GEMINI_API_KEY`, `LLM_MODEL` | api | no | Advisor answers are rule-based unless set |
| `VITE_API_BASE_URL` | web | yes | Build-time; the API URL plus `/api/v1` |

Never commit real values; local examples are in `.env.example` and `frontend/.env.example`.

---

## 🛡️ Deterministic Eligibility Guarantee

In accordance with Citi India Hackathon guidelines:
- We **never invent or hallucinate** government schemes or eligibility criteria.
- All sample opportunities in `backend/data/opportunities.json` are linked to official portals (`scholarships.gov.in`, `pmkvyofficial.org`, `nats.education.gov.in`, `aicte-india.org`) with explicit verification dates.
- Eligibility checks are **strictly deterministic**: rule-based evaluation of income ceilings, age brackets, minimum marks, gender constraints, caste categories, and state domiciles.

---

## 👥 Hackathon Team & Acknowledgements

Developed for the **Citi India Hackathon 2026**.  
Dedicated to empowering every Indian student to take flight on their own path (*Udaan*).
