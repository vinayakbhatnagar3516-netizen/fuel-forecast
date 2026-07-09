<!-- Context: project-intelligence/technical-domain | Priority: critical | Version: 1.0 | Updated: 2026-07-09 -->
# Technical Domain — Fuel Forecast Frontend (Next.js Client)

> **Repo role:** This is the **frontend / product client**. The ML brain is the separate
> `petrol-pump-forecast` Python repo. See `cross-repo-overview.md` for the full topology.

## Stack

| Component | Version / Detail |
|---|---|
| Framework | Next.js 16.2.9 (App Router) |
| UI | React 19.2.4, TypeScript 5 (strict) |
| Styling | Tailwind CSS 4, shadcn/ui (`@base-ui/react`), `tw-animate-css` |
| Auth | Clerk (`@clerk/nextjs` ^7.5.2) — middleware + waitlist access control |
| DB | Neon PostgreSQL via Drizzle ORM (`@neondatabase/serverless`, `drizzle-orm/neon-http`) |
| Charts | Recharts ^3.8.1 |
| Toasts | `sonner` |
| Theming | `next-themes` |
| Icons | `lucide-react` |
| Tests | Vitest ^4 + @testing-library/react + jsdom |
| Quality | ESLint 9 (`eslint-config-next`), `tsc` strict |
| Deploy | Vercel |

## Architecture Overview

Thin client. The dashboard reads/writes Neon **directly via Drizzle**; forecasts are delegated to
the Python backend and their status polled back.

```
src/app/dashboard/*  ──▶  src/app/api/*  ──▶  Neon (Drizzle)        [display + sales data]
        │                          │
        │  /api/forecast/run-backend  ──▶  Python backend (Railway)  [real CatBoost ML]
        │  /api/forecast/latest       ◀──  GET /forecast/jobs/latest  [job status]
```

### Data Flow
1. **Display data** (decision/trends/orders/sales/cost-matrix/weather) → read/write Neon via Drizzle.
2. **Run forecast** → `POST /api/forecast/run-backend` forwards Clerk JWT + body to backend
   `POST /forecast`; backend runs `inference_pipeline` and writes forecast tables + `forecast_jobs`.
3. **Job status** → `GET /api/forecast/latest` → backend `GET /forecast/jobs/latest`; UI shows
   color-coded status (green/red/amber/gray).

### API Routes (`src/app/api/`)
| Route | Purpose | Auth |
|---|---|---|
| `decision` | Build `DecisionData` from Neon (quantiles, P&L, order recs) | `requireAuth` |
| `trends` | Historical + accuracy (coverage/MAPE) from Neon | `requireAuth` |
| `orders` | Order recommendations from Neon | `requireAuth` |
| `sales` | Create/list daily sales → `fuel_transactions` + `daily_fuel_summary` | `requireAuth` |
| `cost-matrix` | Read cost matrix (`cost_matrix` JSONB) | `requireAuth` |
| `weather` | Weather observations (`weather_data`) | `requireAuth` |
| `forecast/run-backend` | Proxy → backend `POST /forecast` (JWT forwarded) | `requireAuth` |
| `forecast/latest` | Proxy → backend `GET /forecast/jobs/latest` | `requireAuth` |
| `forecast/status/[jobId]` | Proxy → backend `GET /forecast/jobs/{id}` | `requireAuth` |
| `auth/check-access` | Current access level | `requireAuth` |
| `webhooks/clerk` | Clerk webhook → sync `user_roles` | Clerk signature |
| `health` | Liveness | public |

### Auth & Access Control
- `src/middleware.ts` (Clerk) protects `/dashboard/*` and `/api/*`.
- `src/lib/access-control.ts`: `admin` / `member` / `waitlisted` / `denied`.
  - Admin email hardcoded: `vinayakbhatnagar3516@gmail.com`.
  - Unknown users auto-inserted as `waitlisted` (pilot invite-only).
- The Python backend accepts **any valid Clerk JWT** (no role check) — pilot stage (see backend D013).

## DB Schema (Drizzle owns the shared / app-facing tables)

Defined in `src/db/schema.ts`. **Drizzle owns the shared / app-facing tables** the UI reads/writes
(see the split-ownership boundary in backend decision **D011**). `drizzle-kit push` creates/updates
these (runs in the Vercel build). Python owns its internal analysis tables (`daily_forecast_costs`,
`validation_metrics`, `conformal_calibration`, `residual_*`, `quantile_model_metrics`) — those are
**not** defined here by design.

> ✅ **Schema reconciled 2026-07-09.** Live Neon inspected: Drizzle UUID PKs present; pi_90 and
> breakeven columns added to schema.ts; unique index on `(forecast_date, fuel_type)` created.
> `drizzle-kit push` verified clean (exit 0), `|| true` dropped from build. Build now fails
> loudly on schema drift.

| Table | Purpose | Owner note |
|---|---|---|
| `organizations` | Clerk-org → pump org mapping | Frontend-only |
| `pump_stations` | Stations per org (tanks, lead time) | Frontend-only |
| `user_roles` | `admin`/`member`/`waitlisted`/`denied` | Frontend-only (access control) |
| `pilot_feedback` | Pilot feedback | Frontend-only |
| `usage_events` | Usage analytics | Frontend-only |
| `daily_forecast_quantiles` | Quantile forecasts (q05..q95, point) | **Shared — Drizzle defines DDL; Python also `CREATE TABLE IF NOT EXISTS`. Unique index added (D014).** |
| `daily_financial_summary` | P&L projections | **Shared — Drizzle + Python `CREATE`. breakeven_* cols added (D014). No unique constraint yet.** |
| `daily_order_recommendation` | 3 policies (conservative/balanced/aggressive) | **Shared — Drizzle + Python `CREATE`. No unique constraint yet.** |
| `weather_data` | Daily weather | Shared |
| `cost_matrix` | Editable financial config (JSONB) | Shared |
| `forecast_jobs` | Async job registry (UUID, status, result JSONB) | **Shared — Drizzle defines DDL; backend writes only** |
| `fuel_transactions` | Sales transactions (feature source) | Shared |
| `daily_fuel_summary` | Aggregated daily sales | Shared |
| `daily_forecast_costs` | Cost projections | **Python-internal** (frontend never reads; intentionally not in Drizzle) |

> **Schema ownership rule:** Drizzle owns the shared/app tables; Python owns its internal tables
> (backend decision **D011**). Schema reconciled (**D014**; verified clean 2026-07-09): unique index
> created, `|| true` dropped from build.

## Dead Code
- **`src/lib/proxy-forecast.ts` — DELETED (2026-07-09).** It was a synthetic-data + toy
  moving-average engine, never wired to any route (tests only). The production forecaster is the
  Python backend. Do not reintroduce it.

## Build & Deploy
- `npm run build` = `npx drizzle-kit push && next build`.
  - Schema reconciled 2026-07-09: unique index added, `|| true` dropped. Build now fails loudly on
    schema drift.
- Deployed to **Vercel**. `BACKEND_URL` is set in the **Vercel dashboard** (not in `.env.vercel`).
- Required env: `DATABASE_URL` (Neon), `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`,
  `BACKEND_URL`.

## Testing
- Vitest + @testing-library/react + jsdom. Specs in `src/__tests__/` (`setup.ts` configures env).
- `npm test` / `npm run test:coverage`.

## Next.js 16 Note
This Next.js version has breaking changes vs. training data. **Read
`node_modules/next/dist/docs/` before writing framework code.** Heed deprecation notices.
