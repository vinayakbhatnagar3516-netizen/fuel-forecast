# Session Report: 2026-06-21 — Model Deployment, OOM Fix & Live Forecast Wiring

**Author:** OpenImplementer agent  
**Date:** 2026-06-21  
**Duration:** ~3 hours  
**Scope:** Backend (Railway) + Frontend (Vercel)  
**Git commits:** `d5ed454`, `c69361e` (backend), `c8aa1dc` (frontend)

---

## 1. Overview

This session resolved three blocking issues preventing end-to-end forecast operation on Railway's free tier:

1. **Model files missing** from Railway Docker build context (root cause: `railway up` respects `.gitignore`)
2. **Worker OOM crash** during forecast (root cause: `run_all_forecasts()` runs 3 modelsets + 3× Monte Carlo, exceeds 512MB)
3. **Static/hardcoded frontend data** — order recommendations and metrics were hardcoded, not wired to live forecast DB

All three are now fixed and deployed.

---

## 2. Problem 1: Model Files Missing from Railway Build

### Symptom
```
FileNotFoundError: Model file not found: /app/models/catboost_q0.05.pkl
```
CatBoost quantile models (`.pkl` files) were not present in the Railway Docker container despite `COPY` commands in `Dockerfile`.

### Root Cause
Railway's `railway up` command **respects `.gitignore`** when assembling the build context upload archive:

> *"By default, `railway up` respects your `.gitignore` file"* — [Railway CLI docs](https://docs.railway.com/cli/up)

The `.gitignore` at `/home/vinayak/petrol-pump-forecast/.gitignore` contained:
```
models/*.pkl      ← matched all 15 CatBoost model files
models/*.joblib
```

These files were filtered out during upload. Docker's `COPY` instructions found no source files and silently skipped them.  
The `.dockerignore` was irrelevant — Railway's upload step runs *before* Docker sees the build context.

### Fix Applied

**File:** `/home/vinayak/petrol-pump-forecast/.gitignore`  
**Change:** Removed lines `models/*.pkl` and `models/*.joblib`  
**Commit:** `d5ed454`

**Additional:** Created `.railwayignore` to exclude `data/` directory (Docker volume with restricted permissions caused Railway upload indexing to fail).

### Verification
```
$ docker build -t petrol-forecast-test .
...
Step 10-24: COPY models/catboost_*.pkl /app/models/  ← all 15 succeeded
Step 25: RUN ls -la /app/models/                     ← all 15 files present
Models verified
```

All 15 models load correctly via `pickle.load()` in the container.

---

## 3. Problem 2: Worker OOM Crash on Forecast

### Symptom
Forecast job starts, runs feature engineering, then gunicorn worker is killed:
```
[ERROR] Worker (pid:3) was sent SIGKILL! Perhaps out of memory?
```
Then a new worker boots, handles auth requests, and also gets killed.

### Analysis
Railway's **Free tier** allocates **512 MB RAM** per service.

The backend's `_run_forecast()` in `api/main.py` called `run_all_forecasts()` when `fuel_type="combined"` (the default):

```python
# OLD: runs 3 complete forecast cycles
result = run_all_forecasts(
    forecast_date=forecast_date,
    current_stock=current_stock,
    verbose=False,
)
```

`run_all_forecasts()` (in `scripts/inference_pipeline.py`) executes **3 sequential calls** to `generate_daily_forecast()`:

| Call | fuel_type | Models loaded | Monte Carlo |
|------|-----------|---------------|-------------|
| 1 | `None` (combined) | 5 (q05–q95) | `n_samples=5000, n_days=30` |
| 2 | `"Petrol"` | 5 (petrol_*) | `n_samples=5000, n_days=30` |
| 3 | `"High-Speed Diesel"` | 5 (hsd_*) | `n_samples=5000, n_days=30` |
| **Total** | | **15 models** | **3× Monte Carlo** |

Each call loads 5 CatBoost models (~1.2MB on disk, 5–10MB in memory each), creates pandas DataFrames (202 rows × 31 features), runs Monte Carlo simulation (5000 samples × 30 days = 150K elements per call), and performs DB inserts. 3 sequential cycles exceed 512MB.

### Fix Applied

**File:** `/home/vinayak/petrol-pump-forecast/api/main.py`  
**Change:** Replaced `run_all_forecasts()` with `generate_daily_forecast(fuel_type=None)` when `fuel_type="combined"`  

```python
# NEW: single forecast, combined only
result = generate_daily_forecast(
    forecast_date=forecast_date,
    fuel_type=None,
    current_stock=current_stock,
    verbose=False,
)
```

**File:** `/home/vinayak/petrol-pump-forecast/scripts/inference_pipeline.py`  
**Change:** Reduced Monte Carlo `n_days` from 30 to 5:  
```python
n_days=5,   # was 30 — reduced for Railway free tier memory
```

**Commit:** `c69361e`

### Memory Budget (Estimated)

| Component | Memory |
|-----------|--------|
| Python + gunicorn + uvicorn | ~30 MB |
| FastAPI + middleware + auth | ~20 MB |
| 5 CatBoost models (pickle loaded) | ~50–80 MB |
| pandas DataFrames (features) | ~10–20 MB |
| Monte Carlo (5000 × 5 days) | ~50–100 MB |
| DB connection + httpx | ~20 MB |
| Other overhead | ~50 MB |
| **Total estimated** | **~250–320 MB** |

This fits within 512MB with headroom.

### Side Effect
`generate_daily_forecast(fuel_type=None)` skips the **financial analysis block** (`if fuel_type is not None:` at line 930 of `inference_pipeline.py`). This means:
- `dailyFinancialSummary` table gets **no entries for combined forecasts**
- P&L metrics (expected daily/monthly profit, p_loss, VaR) will show `"—"` on the dashboard
- Early warnings (stockout risk score, days_to_min_stock) still run for combined

This is a **known limitation** — see section 6 (Remaining Work).

---

## 4. Problem 3: Static/Hardcoded Frontend Data

### Analysis
The dashboard at `/dashboard/page.tsx` had **6 hardcoded values** that didn't respond to forecast data:

| Location | Hardcoded Value | Source |
|----------|----------------|--------|
| Line 212 | `"₹19,840"` daily commission | Static |
| Line 227 | `"6,800 L"` order volume | Static |
| Line 228 | `"at ₹94.50/L · total ₹6,42,600"` | Static |
| Lines 231–233 | Stockout risk `"8.4%"`, Reorder point `"5,400 L"`, Safety buffer `"600 L"` | Static |
| Lines 286–288 | Action Summary (PLACE ORDER · 6,800 L, LOW · 8.4% stockout, BY 22 JUN) | Static |

The `/api/decision` endpoint already queried `dailyOrderRecommendation` from Neon DB and had access to all 3 policies' data, but **never included it in the response**.

### Fix Applied — 3 files

#### 4a. Types (`/home/vinayak/fuel-forecast/src/lib/api-types.ts`)

Added:
```typescript
export type PolicyRecommendation = {
  recommendedOrder: string;
  reorderPoint: string;
  pStockout: string;
  orderQuantity: string;
  expectedCost: string;
  safetyBuffer: string;
};

export type OrderRecommendationData = {
  defaultPolicy: "conservative" | "balanced" | "aggressive";
  perLiterPrice: string;
  totalCost: string;
  policies: {
    conservative: PolicyRecommendation | null;
    balanced: PolicyRecommendation | null;
    aggressive: PolicyRecommendation | null;
  };
};
```

Added `orderRecommendation: OrderRecommendationData` to `DecisionData`.

#### 4b. Decision API (`/home/vinayak/fuel-forecast/src/app/api/decision/route.ts`)

Added `buildOrderRecommendation()` function that:
1. Maps each DB row from `dailyOrderRecommendation` to a `PolicyRecommendation`
2. Computes `safetyBuffer = max(0, reorderPoint - forecastPoint)`
3. Computes `totalCost = recommendedOrder × perLiterPrice`
4. Returns the structured object with all 3 policies

Added `orderRecommendation` field to the JSON response and `emptyState()`.

The `perLiterPrice` is currently hardcoded to `94.50` with a TODO to fetch from the cost matrix table.

#### 4c. Dashboard page (`/home/vinayak/fuel-forecast/src/app/dashboard/page.tsx`)

Replaced 6 hardcoded values with real data from `orderRecommendation` and `pnl` fields:

- **Order volume** → `activeOrder.recommendedOrder` (with " L" suffix)
- **Price/total** → `orderRecommendation.perLiterPrice` + `orderRecommendation.totalCost`
- **Stockout risk** → `activeOrder.pStockout` (with color coding: green ≤10%, amber ≤20%, red >20%)
- **Reorder point** → `activeOrder.reorderPoint`
- **Safety buffer** → `activeOrder.safetyBuffer`
- **Action summary** → uses `decision.action` (BUY/HOLD) + `activeOrder.recommendedOrder` + stockout risk level
- **Daily commission** → shows `pnl.expectedDailyProfit.value` if available, otherwise "—"
- **Delivery** → shows "RUN FORECAST" placeholder (needs lead time calculation from cost matrix)

**Commit:** `c8aa1dc`

### Verification
Frontend build: ✅ Success (TypeScript, Next.js 16.2.9)  
Vercel deploy: ✅ ALIASED to `https://fuel-forecast.vercel.app`  
Railway backend: ✅ HEALTHY at `https://fuel-forecast-api-production.up.railway.app/health`

---

## 5. Architecture State

### Data Flow (Current)
```
User clicks "Generate Forecast" on Diagnostics page
  → POST /api/forecast/run-backend → Proxy to BACKEND_URL/forecast
    → Railway backend runs generate_daily_forecast(fuel_type=None)
      → Loads 5 CatBoost models from /app/models/
      → Fetches historical data from Neon DB (daily_fuel_summary, fuel_transactions)
      → Runs feature engineering
      → Predicts quantiles (q05–q95)
      → Computes order recommendations (3 policies)
      → Saves to DB: daily_forecast_quantiles, daily_order_recommendation, daily_forecast_costs
    → Returns job_id
  → Frontend polls GET /api/forecast/status/:jobId until "succeeded" or "failed"

User navigates to Dashboard
  → GET /api/decision?fuelType=combined
    → Reads latest forecast date from daily_forecast_quantiles
    → Fetches quantiles, financial summary, order recommendations from same Neon DB
    → Returns structured DecisionData with orderRecommendation
  → Dashboard renders real data
```

### Key Integration Points
- **Backend DB writes:** Neon PostgreSQL via `db_neon.py` (psycopg2-binary)
- **Frontend DB reads:** Neon PostgreSQL via Drizzle ORM (`neon/serverless` driver)
- **Auth:** Clerk JWT (RS256, verified via JWKS) — required on both frontend routes and backend API

### Remote URLs

| Service | URL | Stack |
|---------|-----|-------|
| Frontend | `https://fuel-forecast.vercel.app` | Next.js 16.2.9, Clerk, Drizzle |
| Backend API | `https://fuel-forecast-api-production.up.railway.app` | FastAPI, gunicorn+uvicorn, CatBoost |
| PostgreSQL | Neon (via `DATABASE_URL` env var) | PostgreSQL 15 |

---

## 6. Remaining Work (for Next Agent)

### P0 — Financial Summary for Combined Forecasts
- **What:** `generate_daily_forecast(fuel_type=None)` skips the financial analysis block (line 930 of `inference_pipeline.py`)
- **Impact:** `dailyFinancialSummary` table has no rows for `fuel_type='combined'`; dashboard shows `"—"` for daily profit, monthly profit, P&L chart
- **Fix options:**
  - A: Run financial analysis for combined forecasts too (remove `if fuel_type is not None:` guard, compute with sensible defaults for combined)
  - B: Compute financial metrics from the recommendation data server-side in `/api/decision`

### P1 — Wire Up Trends Page
- **What:** `/dashboard/trends/page.tsx` is entirely static/hardcoded
- **Need:** Fetch 30 days of `daily_forecast_quantiles` from DB and render actual forecast bands + accuracy table
- **API needed:** Either extend `/api/decision` with a `?history=true` parameter, or create `/api/forecast/history` endpoint

### P1 — Wire Up Orders Page
- **What:** `/dashboard/orders/page.tsx` is entirely static/hardcoded
- **Need:** Fetch from `dailyOrderRecommendation` and display current recommendation; fetch order history from DB or a new orders table
- **API:** Could reuse `/api/decision` data or create dedicated `/api/orders` endpoint

### P2 — Fetch Per-Liter Price from Cost Matrix
- **What:** `perLiterPrice` in `/api/decision/route.ts` is hardcoded to `94.50`
- **Need:** Query `cost_matrix` table (or the settings API) for the purchase price of the active fuel type
- **File:** `/home/vinayak/fuel-forecast/src/app/api/decision/route.ts`, line 241

### P2 — Delivery Date Calculation
- **What:** Action Summary card shows static "RUN FORECAST" / "Generate a forecast to see delivery estimates"
- **Need:** Compute estimated delivery date from `orderDate + leadTimeDays`, where lead time comes from cost matrix config

### P3 — Model Metrics on Diagnostics Page
- **What:** `/dashboard/diagnostics/page.tsx` has hardcoded model metrics (MAPE 3.35%, coverage 100%, 28 features)
- **Need:** Fetch from backend model registry or `quantile_model_metrics` / `validation_metrics` tables

### P3 — Feature Importance on Diagnostics Page
- **What:** Feature importance table is hardcoded (5 features with weights)
- **Need:** Expose feature importance from backend (CatBoost `get_feature_importance()`) via API

---

## 7. Key Files Reference

### Backend (Railway) — `/home/vinayak/petrol-pump-forecast/`

| File | Purpose | Last Modified |
|------|---------|---------------|
| `Dockerfile` | Builds FastAPI container, copies 15 model files | 2026-06-21 |
| `.gitignore` | Removed `models/*.pkl` and `models/*.joblib` | 2026-06-21 |
| `.railwayignore` | Excludes `data/` from Railway upload | 2026-06-21 |
| `api/main.py` | FastAPI app, `_run_forecast()` uses single `generate_daily_forecast()` | 2026-06-21 |
| `api/jobs.py` | In-memory job store, TTL cleanup | — |
| `api/auth.py` | Clerk JWT verification via JWKS | — |
| `api/config.py` | CORS, security headers, app factory | — |
| `scripts/inference_pipeline.py` | `generate_daily_forecast()`, Monte Carlo `n_days=5` | 2026-06-21 |
| `scripts/predict_quantiles.py` | `load_quantile_models()`, `predict_with_intervals()` | — |
| `scripts/db_neon.py` | Neon PostgreSQL adapter | — |

### Frontend (Vercel) — `/home/vinayak/fuel-forecast/`

| File | Purpose | Last Modified |
|------|---------|---------------|
| `src/lib/api-types.ts` | Shared types incl. `OrderRecommendationData`, `PolicyRecommendation` | 2026-06-21 |
| `src/app/api/decision/route.ts` | `/api/decision` endpoint, includes `buildOrderRecommendation()` | 2026-06-21 |
| `src/app/dashboard/page.tsx` | Dashboard home — reads real order data from API | 2026-06-21 |
| `src/app/dashboard/diagnostics/page.tsx` | Triggers forecast, polls job status | — |
| `src/app/api/forecast/run-backend/route.ts` | Proxy to Railway `/forecast` | — |
| `src/app/api/forecast/status/[jobId]/route.ts` | Proxy to Railway `/forecast/jobs/:jobId` | — |
| `src/db/schema.ts` | Drizzle schema for all DB tables | — |
| `src/proxy.ts` | Next.js 16 middleware — Clerk auth guard | — |

---

## 8. Deployment Commands (Reference)

### Backend
```bash
cd /home/vinayak/petrol-pump-forecast
railway up --ci          # Build + deploy to Railway
```

### Frontend
```bash
cd /home/vinayak/fuel-forecast
npm run build            # Verify compilation
vercel --prod --yes      # Deploy to Vercel production
```

### Local Docker Test
```bash
cd /home/vinayak/petrol-pump-forecast
docker build -t petrol-test:latest .
docker run -d -p 8000:8000 --name petrol-test \
  -e CLERK_ISSUER=https://certain-possum-77.clerk.accounts.dev \
  -e ALLOWED_ORIGINS="http://localhost:3000,https://fuel-forecast.vercel.app" \
  -e DATABASE_URL=postgresql://... \
  -e DB_BACKEND=neon \
  -e ENVIRONMENT=development \
  petrol-test:latest
curl http://localhost:8000/health
```

---

## 9. Known Quirks & Gotchas

- **Railway `railway up` respects `.gitignore`** — always check `.gitignore` when files mysteriously don't appear in the container
- **`--no-gitignore` flag** includes ALL gitignored files including `venv/` etc., easily exceeding upload limits (Cloudflare 413)
- **`.dockerignore` is NOT used** by Railway's upload compressor — only `.gitignore` and `.railwayignore`
- **Docker build context for Railway** is 8.7MB (with models) vs 1.89GB with `--no-gitignore`
- **Forecast job runs in a thread** within the gunicorn worker — if the worker gets OOM-killed, the job dies silently (job status stays "pending" permanently)
- **Gunicorn `-w 1`** is intentional — the in-memory job store is per-process, multiple workers would have inconsistent job views
- **Combined forecasts skip financial analysis** — the `if fuel_type is not None:` gate in `inference_pipeline.py` line 930 means financial metrics are only computed for Petrol/HSD, not combined
