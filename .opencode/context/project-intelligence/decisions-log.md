<!-- Context: project-intelligence/decisions-log | Priority: high | Version: 1.0 | Updated: 2026-07-09 -->
# Decisions Log — Fuel Forecast Frontend

> Mirrors the backend repo's `decisions-log.md` for the cross-cutting decisions (D009–D013) and
> adds frontend-specific ones (F001–F003). The backend is the source of truth for D001–D013.

---

### D009: Two-Repo Split — Python Backend = "Brain", Next.js Frontend = Client
*(see backend `decisions-log.md` D009)* — This repo is the client; it triggers forecasts on the
Python backend and reads results from the shared Neon DB.

---

### D010: Neon PostgreSQL is the Primary DB; Docker `petrol-db` is Legacy/Local-Dev
*(see backend D010)* — This repo uses Neon exclusively via Drizzle. No Docker DB here.

---

### D011: Drizzle Owns the Neon Schema; Python Backend Assumes Tables Exist
| | |
|---|---|
| **Date** | 2026-07-02 (revised 2026-07-09) |
| **Status** | Final — shared-table DDL reconciled (D014; verified live 2026-07-09) |
| **Context** | Both repos touch the same Neon tables; risk of schema drift. |
| **Decision** | **Split ownership by category.** Drizzle `schema.ts` owns the **shared / app-facing** tables the UI reads/writes (`daily_forecast_quantiles`, `daily_financial_summary`, `daily_order_recommendation`, `fuel_transactions`, `daily_fuel_summary`, `weather_data`, `cost_matrix`, `forecast_jobs`). Python owns its **internal analysis** tables the UI never reads (`daily_forecast_costs`, `validation_metrics`, `conformal_calibration`, `residual_*`, `quantile_model_metrics`). |
| **Rationale** | One owner per table avoids drift. The shared tables are the UI's contract; the internal tables are ML plumbing. |
| **Caveat** | Live Neon inspected 2026-07-09 — DDL is **milder** than first feared: all shared tables have Drizzle's UUID PKs (Drizzle won). Python adds benign extra columns (`pi_90_*`, `breakeven_*`) which Drizzle now also defines (D014). The only real defect was a missing unique constraint on `(forecast_date, fuel_type)` breaking Python re-runs — fixed. `daily_forecast_costs` remains intentionally Python-internal. |

---

### D012: `proxy-forecast.ts` Deleted
| | |
|---|---|
| **Date** | 2026-07-09 |
| **Status** | Final |
| **Context** | A synthetic-data + toy moving-average engine was prototyped before the Python backend existed. It was **not wired to any API route** (referenced only by tests). |
| **Decision** | **Deleted** on 2026-07-09 (removed `src/lib/proxy-forecast.ts`, its `proxy-forecast.test.ts`, and the `runProxyForecast` mock in `api-routes.test.ts`). The production forecaster is the Python CatBoost backend. |
| **Rationale** | Avoids fake data reaching users and a second competing "forecast" implementation. |

---

### D013: Clerk Auth — Backend Accepts Any Valid JWT; Frontend Enforces Waitlist (Pilot)
| | |
|---|---|
| **Date** | 2026-07-02 |
| **Status** | Final (pilot stage) |
| **Context** | During pilot, only the owner should log in and run forecasts. |
| **Decision** | Backend verifies any valid Clerk JWT (no role check). Frontend (`access-control.ts`) enforces `admin`/`member`/`waitlisted`/`denied` with a hardcoded admin email. Pilot = single admin. |
| **Rationale** | Keeps the backend simple; gating lives with product logic. Waitlist blocks public sign-ups during pilot. |

---

### F001: shadcn/ui Built on `@base-ui/react` (not Radix)
| | |
|---|---|
| **Date** | 2026-06-15 |
| **Status** | Final |
| **Context** | UI primitives needed; chose Base UI over Radix for this Next.js 16 setup. |
| **Decision** | `src/components/ui/*` generated via `shadcn` CLI on top of `@base-ui/react`. |
| **Rationale** | Base UI integrates cleanly with React 19 / Next.js 16. Do not hand-edit primitives; regenerate via CLI. |

---

### F002: Drizzle `neon-http` (serverless) Driver
| | |
|---|---|
| **Date** | 2026-06-20 |
| **Status** | Final |
| **Context** | Need DB access from Vercel serverless functions without a long-lived pool. |
| **Decision** | Use `@neondatabase/serverless` + `drizzle-orm/neon-http` (`src/db/index.ts`). |
| **Rationale** | HTTP driver fits serverless; no connection pooling config. The Python backend uses psycopg2 pooling (different driver, same Neon). |

---

### F003: `BACKEND_URL` Configured in Vercel Dashboard, Not in `.env.vercel`
| | |
|---|---|
| **Date** | 2026-07-02 |
| **Status** | Final |
| **Context** | The frontend proxies forecast calls to the Railway backend. |
| **Decision** | `BACKEND_URL` is set as a Vercel project env var (dashboard). `.env.vercel` / `.env.prod` stubs are empty. Code defaults to `http://localhost:8000` when unset. |
| **Rationale** | Keeps the Railway URL out of committed files. Local dev points at a local backend. |

---

### D014: Reconcile Shared-Table DDL (Neon) — Live Schema Inspected, Fix Applied
| | |
|---|---|
| **Date** | 2026-07-09 |
| **Status** | Finaled 2026-07-09 — unique index created, `|| true` dropped from build |
| **Context** | Live Neon schema inspected 2026-07-09. Reality is **milder** than first feared: all shared tables have **Drizzle's UUID `id` PK** (so `drizzle-kit push` did create them — it is NOT silently failing into a Python composite-PK schema). Python adds a few **benign extra columns** the UI doesn't use: `pi_90_lower/upper/width` on `daily_forecast_quantiles`, `breakeven_cash/breakeven_book` on `daily_financial_summary`. `daily_forecast_costs` does **not** exist in live Neon (Python-internal; created on demand). **Confirmed bug:** NO unique constraint exists on `(forecast_date, fuel_type)` in any shared table, so the Python backend's `ON CONFLICT (forecast_date, fuel_type)` upsert **errors on any re-run for an already-forecast date** (first insert works; conflicts fail). |
| **Decision** | (1) Made Drizzle the **complete** definition: added `pi_90_lower/upper/width` to `dailyForecastQuantiles` and `breakeven_cash/breakeven_book` to `dailyFinancialSummary` in `src/db/schema.ts` (idempotent — columns already exist in live). (2) Added a `uniqueIndex` on `(forecastDate, fuelType)` to `dailyForecastQuantiles` so Python's upsert works. (3) Executed 2026-07-09: verified 0 duplicate rows in live, created unique index via SQL, resolved `user_roles` unique constraint prompt, verified `drizzle-kit push` clean (exit 0), dropped `|| true` from build. |
| **Rationale** | Drizzle is effectively already the owner (UUID PKs win). The only real defect was the missing unique constraint breaking Python re-runs; the extra Python columns are harmless. Making Drizzle define everything removes the "Python adds surprise columns" gap. |
| **Trade-off** | Required verifying 0 duplicates in live before unique index creation (confirmed clean). `|| true` removed after push verified clean. |
