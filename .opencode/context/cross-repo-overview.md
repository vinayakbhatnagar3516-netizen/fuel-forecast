<!-- Context: cross-repo-overview | Priority: critical | Version: 1.0 | Updated: 2026-07-09 -->
<!-- MIRROR: identical copy also lives in petrol-pump-forecast/.opencode/context/cross-repo-overview.md -->
# Cross-Repo Overview — Fuel Forecast System

This system spans **two repositories**. This document is the single mental model for how they fit
together. It is mirrored in both repos' `.opencode/context/`.

## Repositories

| Repo | Role | Stack | Deploy | URL |
|---|---|---|---|---|
| `petrol-pump-forecast` | **Backend / "the brain"** — ML + API | Python 3.9, FastAPI, CatBoost, Neon (psycopg2) | Railway | https://fuel-forecast-api-production.up.railway.app |
| `fuel-forecast` | **Frontend / product client** — UI + auth + data entry | Next.js 16, React 19, TS, Tailwind 4, shadcn, Clerk, Drizzle+Neon, Recharts | Vercel | https://fuel-forecast.vercel.app |

## Topology & Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│  fuel-forecast (Next.js / Vercel)                                 │
│                                                                    │
│  Clerk auth (middleware) + waitlist (admin/member/waitlisted)      │
│     │                                                              │
│     ├─ Dashboard reads/writes Neon directly (Drizzle)             │
│     │     • decision / trends / orders / sales / cost-matrix      │
│     │                                                              │
│     └─ "Run Forecast" → POST /api/forecast/run-backend            │
│              │  forwards Clerk JWT + body                          │
│              ▼                                                     │
└──────────────┬─────────────────────────────────────────────────┘
               │  HTTPS + Bearer Clerk JWT
               ▼
┌──────────────────────────────────────────────────────────────────┐
│  petrol-pump-forecast (FastAPI / Railway)                         │
│                                                                    │
│  api/auth.py  → verify Clerk JWT (JWKS RS256)                     │
│  api/main.py → POST /forecast (background thread)                 │
│                  → inference_pipeline.generate_daily_forecast()    │
│                  → writes forecast tables + forecast_jobs (Neon)   │
│  api/jobs.py → forecast_jobs registry (Neon)                      │
│                                                                    │
│  Frontend polls: GET /forecast/jobs/latest  →  shows job status   │
└──────────────┬─────────────────────────────────────────────────┘
               │
               ▼
        ┌──────────────┐
        │  Neon PostgreSQL (SHARED) │
        │  Schema owned by Drizzle  │
        └──────────────┘
```

## Who Owns What

| Concern | Owner | Notes |
|---|---|---|
| Neon **schema** (DDL) | Split: Drizzle owns **shared/app** tables; Python owns **internal** tables | See "Schema Ownership" below. Divergence reconciled (D014; live verified 2026-07-09). |
| Forecast **ML** | `petrol-pump-forecast` | CatBoost quantile models + inference_pipeline |
| Forecast **API** | `petrol-pump-forecast` | FastAPI endpoints |
| Dashboard **UI** | `fuel-forecast` | Next.js pages under `src/app/dashboard` |
| **Auth** (login) | Clerk (both repos use same Clerk app) | Frontend enforces waitlist; backend only checks valid JWT |
| **User roles** | `fuel-forecast` (`user_roles` table + `access-control.ts`) | Backend is role-agnostic (pilot) |
| **Sales data entry** | `fuel-forecast` (`/api/sales` → `fuel_transactions`/`daily_fuel_summary`) | Backend reads these for features |
| **Job registry** | Drizzle creates `forecast_jobs`; backend writes it | Shared table |

## Schema Ownership (the #1 drift risk — reconciled D014)

**Split ownership by table category:**
- **Drizzle `schema.ts` (frontend) owns the shared / app-facing tables** the UI reads/writes:
  `daily_forecast_quantiles`, `daily_financial_summary`, `daily_order_recommendation`,
  `fuel_transactions`, `daily_fuel_summary`, `weather_data`, `cost_matrix`, `forecast_jobs`.
- **Python owns its internal analysis tables** the frontend never reads: `daily_forecast_costs`,
  `validation_metrics`, `quantile_model_metrics`, `conformal_calibration`, `residual_analysis_summary`,
  `forecast_residuals`. (So `daily_forecast_costs` is intentionally NOT in Drizzle.)

**Live Neon schema inspected 2026-07-09 — milder than "divergent PKs":**
- All shared tables have **Drizzle's UUID `id` PK** (so `drizzle-kit push` created them; it is **not**
  silently failing into a Python composite-PK schema).
- Python adds a few **benign extra columns** the UI doesn't use: `pi_90_lower/upper/width` on
  `daily_forecast_quantiles`, `breakeven_cash/breakeven_book` on `daily_financial_summary`. Drizzle
  now defines these too (D014 fix). `daily_forecast_costs` does **not** exist in live Neon (Python-internal).
- **The one real defect:** NO unique constraint on `(forecast_date, fuel_type)` in any shared table, so
  the Python backend's `ON CONFLICT (forecast_date, fuel_type)` upsert **errors on re-runs**. Fixed by
  adding a `uniqueIndex` on `(forecastDate, fuelType)` to `dailyForecastQuantiles` in Drizzle (D014).

**Action (decision D014):** verified clean 2026-07-09; unique index created, `|| true` dropped from build.

## Dead Code (do not build on)

- `petrol-pump-forecast/scripts/app.py` (Streamlit) — superseded by Next.js frontend.
- `fuel-forecast/src/lib/proxy-forecast.ts` — synthetic toy engine, **never wired to any route**
  (tests only). The production forecaster is the Python backend.

## Environment Variables

| Var | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | Both (Neon connection string, `sslmode=require`) | DB access |
| `DB_BACKEND=neon` | Backend | Routes `db_utils` → Neon |
| `CLERK_ISSUER` / `CLERK_JWKS_URL` / `CLERK_AUDIENCE` | Backend | JWT verification |
| `ALLOWED_ORIGINS` | Backend | CORS (required, no wildcard) |
| `BACKEND_URL` | Frontend (set in **Vercel dashboard**, not in `.env.vercel`) | Points to Railway backend |
| `NEXT_PUBLIC_CLERK_*` | Frontend | Clerk publishable keys |

## Local Dev

1. Frontend: `cd fuel-forecast && npm install && npm run dev` (needs `DATABASE_URL` + Clerk keys).
2. Backend: `cd petrol-pump-forecast && source venv/bin/activate && DB_BACKEND=neon uvicorn api.main:app --reload`.
3. Ensure `drizzle-kit push` has run (from frontend repo) so Neon tables exist for the backend.

## Related Context Docs

- Backend: `petrol-pump-forecast/.opencode/context/project-intelligence/*`
- Frontend: `fuel-forecast/.opencode/context/project-intelligence/*`
- `decisions-log.md` in each repo (D009–D013 cover the split, Neon, schema, dead code, auth).
