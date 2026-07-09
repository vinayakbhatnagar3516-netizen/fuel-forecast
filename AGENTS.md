<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your
training data. **Read the relevant guide in `node_modules/next/dist/docs/` before writing any code.**
Heed deprecation notices. (Next.js 16.2.9 / React 19.2.4 in this repo.)
<!-- END:nextjs-agent-rules -->

---

# AGENTS.md — fuel-forecast (Frontend / Product Client)

## What this is

**The product UI for the petrol-pump demand-forecasting system** (Kandaghat-Chail, Himachal Pradesh).
This Next.js app is the **client**: it renders the dashboard, handles auth, captures sales entry,
and triggers forecasts on the **separate Python backend** (`petrol-pump-forecast`, FastAPI on Railway)
which runs the real CatBoost ML. Results are read back from the **shared Neon database**.

> **This repo owns the Neon schema** (via Drizzle). The Python backend assumes those tables exist.

## Stack

| Component | Version |
|---|---|
| Framework | Next.js 16.2.9 (App Router) |
| UI | React 19.2.4, TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui (built on `@base-ui/react`), `tw-animate-css` |
| Auth | Clerk (`@clerk/nextjs` ^7.5.2) — middleware + waitlist access control |
| DB | Neon PostgreSQL via Drizzle ORM (`@neondatabase/serverless`) |
| Charts | Recharts ^3.8.1 |
| Toasts | `sonner` |
| Tests | Vitest ^4 + @testing-library/react + jsdom |
| Lint/Format | ESLint 9 (`eslint-config-next`), `tsc` strict |
| Deploy | Vercel |

## Repo topology (read this first)

```
fuel-forecast (this repo, Vercel)                petrol-pump-forecast (FastAPI, Railway)
─────────────────────────────────               ─────────────────────────────────────
Dashboard UI  ──POST /forecast──▶  api/main.py ──▶ inference_pipeline (CatBoost)
Clerk auth + waitlist                            auth.py (verify Clerk JWT)
Reads/writes Neon directly ◀── Neon DB ───▶ writes forecast_jobs + forecast tables
OWNS Neon SCHEMA (Drizzle schema.ts)             assumes tables exist
```

See `.opencode/context/cross-repo-overview.md` for the full picture and the backend repo's context.

## Quick start

```bash
npm install
cp .env.example .env.local        # fill DATABASE_URL (Neon), Clerk keys, BACKEND_URL

npm run dev                       # http://localhost:3000
npm run build                     # runs `drizzle-kit push` then `next build`
npm test                          # vitest run
npm run lint                      # eslint
```

> `BACKEND_URL` is set in the **Vercel dashboard** (not committed to `.env.vercel`). Locally it
> defaults to `http://localhost:8000` if unset.

## Key commands

```bash
npm run dev                       # dev server
npm run build                     # drizzle-kit push && next build
npm start                         # production server
npm run lint                      # eslint
npm test                          # vitest run
npm run test:coverage             # vitest run --coverage
npm run db:push                   # drizzle-kit push  (creates/updates Neon tables)
npm run db:generate               # drizzle-kit generate (migration SQL)
```

## Architecture notes

### Data flow
- **Dashboard data** (decision, trends, orders, sales, cost-matrix) is read/written **directly in
  Neon via Drizzle** (`src/db`). The dashboard does NOT call the Python backend for display data.
- **Forecasts** are triggered by `POST /api/forecast/run-backend`, which forwards the Clerk JWT to
  the backend's `POST /forecast` (Railway). The UI then polls `GET /api/forecast/latest` →
  backend `GET /forecast/jobs/latest` to show job status.
- **Sales entry** (`/api/sales`) writes `fuel_transactions` + `daily_fuel_summary` (used by the
  backend's feature engineering).

### API routes (`src/app/api/`)
| Route | Purpose |
|---|---|
| `decision` | Build DecisionData from Neon (quantiles, P&L, order recs) |
| `trends` | Historical + accuracy (coverage/MApe) from Neon |
| `orders` | Order recommendations from Neon |
| `sales` | Create/list daily sales (Neon) |
| `cost-matrix` | Read cost matrix (Neon `cost_matrix` JSONB) |
| `weather` | Weather observations (Neon `weather_data`) |
| `forecast/run-backend` | Proxy → backend `POST /forecast` (Clerk JWT forwarded) |
| `forecast/latest` | Proxy → backend `GET /forecast/jobs/latest` |
| `forecast/status/[jobId]` | Proxy → backend `GET /forecast/jobs/{id}` |
| `auth/check-access` | Current access level (admin/member/waitlisted/denied) |
| `webhooks/clerk` | Clerk webhook (user created/deleted → `user_roles`) |
| `health` | Liveness |

### Auth model (pilot stage)
- `src/middleware.ts` (Clerk) protects `/dashboard/*` and `/api/*` — unauthenticated → sign-in.
- `src/lib/access-control.ts` enforces `admin` / `member` / `waitlisted` / `denied`.
  - Admin email is **hardcoded**: `vinayakbhatnagar3516@gmail.com`.
  - Unknown users are auto-inserted as `waitlisted` (pilot = invite-only).
- The Python backend accepts **any valid Clerk JWT** (no role check) — see backend decision D013.
  During pilot only the admin should log in and run forecasts.

### Schema ownership (IMPORTANT — split; reconciled D014)
- **Split ownership:** Drizzle `schema.ts` owns the **shared / app-facing** tables the UI reads/writes
  (`daily_forecast_quantiles`, `daily_financial_summary`, `daily_order_recommendation`, `fuel_transactions`,
  `daily_fuel_summary`, `weather_data`, `cost_matrix`, `forecast_jobs`). **Python owns its internal
  analysis tables** the UI never reads (`daily_forecast_costs`, `validation_metrics`, `conformal_calibration`,
  `residual_*`, `quantile_model_metrics`). So `daily_forecast_costs` is **intentionally not** in Drizzle.
- **Live Neon inspected 2026-07-09** — all shared tables have **Drizzle's UUID PKs** (Drizzle won;
  `drizzle-kit push` was NOT silently failing). Python adds benign extra columns (`pi_90_*`,
  `breakeven_*`) which Drizzle now also defines (backend D014). The only real defect was a missing
  unique constraint on `(forecast_date, fuel_type)` breaking Python re-runs — fixed by adding
  `uniqueIndex` to `dailyForecastQuantiles` in `schema.ts`.
- **Resolved 2026-07-09:** dedupe check clean (0 duplicates), unique index created,
  `drizzle-kit push` verified clean, `|| true` dropped from build.

### Dead code (do not build on)
- **`src/lib/proxy-forecast.ts` — DELETED (2026-07-09).** It was a synthetic-data + toy
  moving-average engine, never wired to any API route (tests only). The production forecaster is the
  Python backend. Do not reintroduce it. (Its test file and the `runProxyForecast` mock in
  `api-routes.test.ts` were removed alongside it.)

## Testing
- **Vitest** with `@testing-library/react` + `jsdom`. Tests in `src/__tests__/`.
- `src/__tests__/setup.ts` configures the environment.
- Run `npm test` (or `npm run test:coverage`).

## Project structure
```
src/
  app/
    page.tsx                 # landing
    layout.tsx, globals.css
    dashboard/               # account, daily-entry, settings, diagnostics, orders, trends, page
    api/                     # route handlers (see table above)
  components/                # ui/ (shadcn), dashboard-auth-guard, indic-motifs
  hooks/                     # use-mobile
  lib/                       # api-types, auth-guard, access-control, proxy-forecast (DEAD), constants, utils
  db/                        # schema.ts (Drizzle, authoritative), index.ts (neon client), user-roles-schema.ts
  middleware.ts              # Clerk route protection
  __tests__/
```

## Environment gotchas
- `DATABASE_URL` (Neon, `sslmode=require`) is **required** — `src/db/index.ts` throws without it.
- `BACKEND_URL` is set in the **Vercel dashboard**, not in `.env.vercel` (which is empty/stub).
- Clerk keys: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY`.
- Next.js 16 has breaking changes vs. training data — **read `node_modules/next/dist/docs/` first**.

## Also see
- `petrol-pump-forecast` repo — the Python backend ("the brain")
- `.opencode/context/cross-repo-overview.md` — two-repo topology & data flow
- `.opencode/context/project-intelligence/technical-domain.md` — frontend stack & schema
- `.opencode/context/project-intelligence/decisions-log.md` — D009–D013
- `SESSION_SUMMARY.md`, `IMPROVEMENT_PLAN.md`
