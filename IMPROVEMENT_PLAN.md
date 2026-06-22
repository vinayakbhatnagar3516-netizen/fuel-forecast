Fuel Forecast System — Improvement Plan
=========================================
Generated: 2026-06-22
Scope: frontend (fuel-forecast) + backend (petrol-pump-forecast) + Railway deployment + integration

────────────────────────────────────────────────────────────────────────
CURRENT STATE (verified by code inspection)
────────────────────────────────────────────────────────────────────────

ARCHITECTURE AS-BUILT

  Vercel (Next.js 16)          Railway (FastAPI/Docker)         Neon (PostgreSQL)
  ┌──────────────┐             ┌──────────────────┐            ┌────────────┐
  │ fuel-forecast│             │ petrol-pump-     │            │  Shared DB │
  │              │── POST ────>│ forecast backend │── writes ->│            │
  │ Clerk auth   │  /run-bkend │ CatBoost models  │            │  Both      │
  │ Drizzle ORM  │<-- poll ────│ In-memory jobs   │<-- reads --│  read/write│
  │ shadcn/ui    │  /status    │ psycopg2 → Neon  │            │            │
  └──────────────┘             └──────────────────┘            └────────────┘

WHAT IS WORKING (validated in code)
  - Backend deployed on Railway: project "fuel-forecast-backend", Dockerfile builder
  - FastAPI with 4 endpoints: /health, POST /forecast, GET /forecast/jobs/{id}, POST /weather/collect
  - Clerk JWT validation via JWKS (RS256) on backend — no shared secrets, proper key rotation
  - Frontend bridge: /api/forecast/run-backend proxies to backend, /api/forecast/status polls
  - Both codebases share Neon PostgreSQL (DB_BACKEND=neon dispatch in db_utils.py)
  - Per-route auth guards (requireAuth) on all frontend API routes
  - Access control: admin / member / waitlisted roles via user_roles table
  - Security headers on both sides (next.config.ts + SecurityHeadersMiddleware)
  - Body size limits (1MB backend, 100KB cost-matrix)
  - CORS: explicit origins only, no wildcard
  - SQL literal escaping via sql_literal() for string interpolation
  - Tests: 56 frontend (vitest), 263 backend (pytest, 1 flaky)
  - 15 CatBoost quantile models baked into Docker image
  - .dockerignore and .railwayignore properly configured
  - Docs disabled in production (no /docs, /redoc leak)

────────────────────────────────────────────────────────────────────────
ISSUES FOUND (ordered by severity)
────────────────────────────────────────────────────────────────────────

P0 — CRITICAL (fix immediately)

1. MIDDLEWARE IS DEAD CODE
   src/proxy.ts contains Clerk middleware but Next.js only activates
   middleware from a file named middleware.ts at root or src/ root.
   The file is named proxy.ts — it never runs.
   Impact: no centralized route protection. Individual requireAuth()
   guards on each route compensate, but any new route added without
   the guard is silently public. Defense-in-depth is missing.
   Fix: rename src/proxy.ts to src/middleware.ts (or move to root).
   Verify with: curl -I https://fuel-forecast.vercel.app/api/decision
   (should return 401, not 200).

2. RAILWAY ACCESS TOKEN IN PLAINTEXT
   /home/vinayak/.railway/config.json contains accessToken and
   refreshToken in plaintext. Not in git, but if this machine is
   compromised the Railway account is fully compromised.
   Fix: rotate the token (railway logout + railway login), ensure
   config.json has 600 perms (it does), consider moving to a
   secrets manager or environment-based auth.

3. ACCESS CONTROL FAILS OPEN
   src/lib/access-control.ts: on DB error, returns level="member"
   granting full access during Neon outages. An attacker could
   intentionally trigger DB errors (e.g. via request flooding) to
   bypass the waitlist.
   Fix: fail closed. Return level="denied" or "waitlisted" on DB
   error, not "member". Only existing authenticated sessions with
   cached roles should retain access during outages.

P1 — HIGH (fix before onboarding real users)

4. NO TENANT SCOPING
   The schema has organizations and pump_stations tables but NO
   query filters by org_id. Every authenticated user sees the same
   forecast data. This is the single biggest SaaS gap.
   Impact: user A sees user B's financial data. Cannot onboard a
   second pump without data collision.
   Fix: add org_id to all forecast/financial/order tables, filter
   every Drizzle query by the Clerk org_id from the session, add
   org_id to backend JWT claims validation.

5. IN-MEMORY JOB STORE LOST ON RESTART
   api/jobs.py uses a module-level dict. Railway free tier restarts
   on deploy, idle, or crash. Any in-flight job is lost; polling
   returns 404; user sees "job not found" with no recovery path.
   Fix: persist job state to Neon (a jobs table) or use Upstash Redis
   (Railway plugin). At minimum, write job_id + status to Neon on
   create/update, read from Neon on poll. This also enables multi-
   replica scaling later.

6. STUCK JOBS NEVER TIMEOUT
   If the forecast thread hangs (e.g. Neon connection timeout), the
   job stays "running" forever. TTL cleanup only removes
   succeeded/failed jobs, not stuck running ones. The 5-concurrent
   limit eventually fills up and all new requests get 429.
   Fix: add a job_timeout (e.g. 120s). In _cleanup_expired(), also
   mark running jobs older than timeout as "failed" with
   error="timeout". Or use threading.Timer to auto-fail.

7. COMBINED-ONLY FORECAST ON RAILWAY
   The backend skips per-fuel-type (Petrol/HSD) forecasts to fit
   Railway's 512MB free tier. Users selecting Petrol or HSD get
   combined results silently — no warning, no error.
   Fix: either upgrade Railway plan (512MB → 1GB+), or lazy-load
   models (load only the requested fuel type's 5 models, not all 15),
   or document the limitation and return an explicit error for
   non-combined requests until memory is resolved.

8. NO PER-USER RATE LIMITING
   The backend limits to 5 concurrent jobs globally but has no
   per-user limit. One user can monopolize all 5 slots.
   Fix: track jobs by requested_by (already captured in claims.sub),
   limit to 1 concurrent job per user, add a cooldown (e.g. 1
   forecast per 5 minutes per user).

P2 — MEDIUM (improve sturdiness and usefulness)

9. NO CI/CD PIPELINE
   No GitHub Actions. Deployments are manual (railway up, vercel
   deploy). No automated test gate before deploy.
   Fix: add .github/workflows/ci.yml — run pytest (backend) +
   vitest (frontend) + tsc --noEmit on every PR. Block merge on
   failure. Auto-deploy main to Railway/Vercel on green.

10. NO ERROR TRACKING OR MONITORING
    Backend logs to stdout only. No Sentry, no structured log
    aggregation, no metrics dashboard. Errors are invisible unless
    someone reads Railway logs manually.
    Fix: integrate Sentry (free tier) on both frontend and backend.
    Add a /metrics endpoint (Prometheus format) with job count,
    forecast duration, error rate. Set up Railway alerts for
    deploys and high error rate.

11. MODELS BAKED INTO IMAGE
    15 pickle files are COPY'd in the Dockerfile. Retraining
    requires rebuilding and redeploying the entire image. No model
    versioning, no A/B testing, no rollback.
    Fix: store models in S3/R2/Backblaze. Download at startup or
    on first request (with local cache). Tag models with version +
    training date. Add a /models endpoint showing loaded versions.

12. NO CLERK WEBHOOK FOR USER PROVISIONING
    access-control.ts inserts new users as "waitlisted" with
    email="pending-{userId}" because Clerk auth() doesn't expose
    email. The email is never updated.
    Fix: add a Clerk webhook endpoint (/api/webhooks/clerk) that
    listens for user.created and user.updated events, upserts the
    real email into user_roles. Configure the webhook in Clerk
    dashboard with signature verification.

13. NO INPUT VALIDATION ON current_stock
    The backend accepts Optional[float] for current_stock with no
    bounds. A user could pass -1000 or 999999999.
    Fix: add Pydantic validator: current_stock must be >= 0 and
    <= tank_capacity (from cost matrix). Return 422 on violation.

14. F-STRING SQL NOT PARAMETERIZED ON NEON PATH
    db_utils.py dispatches to db_neon.execute_query(query, params=())
    — the f-string SQL with interpolated values is sent as a
    complete string. sql_literal() escapes strings, but this is
    defense-in-depth, not parameterized queries.
    Fix: migrate critical queries to use %s placeholders with
    params tuple. At minimum, audit all f-string SQL in
    inference_pipeline.py for unescaped interpolation.

15. WEATHER API SINGLE POINT OF FAILURE
    Single OpenWeatherMap key, no fallback, no caching beyond DB.
    If the API is down or key expires, weather collection fails
    silently.
    Fix: add a second provider (Open-Meteo, free, no key needed)
    as fallback. Cache weather responses. Alert on collection
    failure for N consecutive days.

16. FRONTEND TRENDS/ORDERS PAGES STILL INCOMPLETE
    Git status shows modifications but these pages were empty
    shells in the summary. recharts is installed but may not be
    wired.
    Fix: verify current state, wire to /api/decision pnlHistory
    and orderRecommendation data that already exists.

P3 — LOW (nice to have, improve developer experience)

17. NO E2E TESTS
    No Playwright/Cypress. Critical flows (login, run forecast,
    view decision) are untested end-to-end.
    Fix: add Playwright with 3-4 smoke tests: login flow, forecast
    trigger, decision render, cost-matrix save.

18. NO SECRETS ROTATION POLICY
    Env vars set once in Railway/Vercel dashboards. No rotation,
    no audit trail.
    Fix: document rotation procedure. Rotate Clerk secret key +
    Neon DATABASE_URL quarterly. Use Railway/Vercel audit logs.

19. NO API VERSIONING
    Backend endpoints are unversioned (/forecast, not /v1/forecast).
    Breaking changes affect all clients immediately.
    Fix: prefix all backend routes with /v1/. Add a deprecation
    header on old routes when v2 is introduced.

20. NO REQUEST TRACING
    No correlation IDs across frontend → backend → DB. Debugging
    a failed forecast requires matching timestamps manually.
    Fix: generate a request ID in the frontend, pass as
    X-Request-ID header, log it in backend, include in error
    responses.

────────────────────────────────────────────────────────────────────────
IMPLEMENTATION PLAN (phased)
────────────────────────────────────────────────────────────────────────

PHASE 0 — EMERGENCY PATCHES (do today, ~2 hours)
  Goal: close the 3 critical security holes.

  0.1  Rename src/proxy.ts → src/middleware.ts in fuel-forecast
       - Verify: unauthenticated curl to /api/decision returns 401
       - Verify: authenticated browser session still works
       - Commit: "fix(security): activate Clerk middleware"

  0.2  Rotate Railway token
       - railway logout && railway login
       - Verify config.json has fresh token
       - Verify deploy still works: railway up

  0.3  Fix access-control.ts fail-open
       - Change catch block: return level="denied" (not "member")
       - Add a comment explaining why fail-closed is correct
       - Run frontend tests: npm test
       - Commit: "fix(security): fail closed on DB outage in access control"

PHASE 1 — TENANT ISOLATION (before second user, ~1-2 days)
  Goal: every user sees only their own data.

  1.1  Add org_id column to forecast tables in Neon
       - daily_forecast_quantiles, daily_financial_summary,
         daily_order_recommendation, daily_forecast_costs
       - Drizzle migration + backend schema update

  1.2  Extract org_id from Clerk session in frontend API routes
       - session.orgId or session.lastActiveOrganizationId
       - Pass org_id to all Drizzle queries as a WHERE filter

  1.3  Extract org_id from JWT claims in backend
       - verify_clerk_jwt already returns claims; add org_id check
       - Pass org_id to inference_pipeline.generate_daily_forecast
       - Filter all DB writes/reads by org_id

  1.4  Add pump_stations per-org relationship
       - Each org has 1+ stations; forecasts are per-station
       - Update the cost matrix to be per-station, not global

  1.5  Test: create a second Clerk org, verify data isolation

PHASE 2 — JOB RELIABILITY (~1 day)
  Goal: forecast jobs survive restarts and never get stuck.

  2.1  Create a jobs table in Neon
       - id (UUID PK), status, fuel_type, requested_by (org_id),
         result (JSONB), error, created_at, updated_at, completed_at

  2.2  Rewrite api/jobs.py to use Neon instead of in-memory dict
       - create_job: INSERT row, return id
       - get_job: SELECT by id
       - update_job: UPDATE status/result/error
       - get_active_job_count: SELECT COUNT WHERE status IN
         (pending, running) AND requested_by = ?

  2.3  Add job timeout
       - In _cleanup_expired (now a DB query): mark running jobs
         older than 120s as failed with error="timeout"
       - Or use a background thread with threading.Timer per job

  2.4  Add per-user rate limiting
       - Max 1 concurrent job per org_id
       - Min 5-minute gap between forecast requests per org_id
       - Return 429 with Retry-After header

PHASE 3 — OBSERVABILITY (~1 day)
  Goal: know when things break before users tell you.

  3.1  Integrate Sentry
       - Backend: sentry-sdk[fastapi], init in api/main.py
       - Frontend: @sentry/nextjs, configure in next.config.ts
       - Free tier is sufficient for current volume

  3.2  Add structured logging
       - Backend: switch to structlog or json logging
       - Include request_id, org_id, job_id in every log line
       - Frontend: log API errors with context

  3.3  Add /metrics endpoint
       - prometheus_fastapi_instrumentator
       - Track: http_requests_total, forecast_duration_seconds,
         forecast_jobs_active, db_query_duration_seconds

  3.4  Set up Railway + Vercel deploy notifications
       - Railway: email on deploy failure
       - Vercel: email on build failure

PHASE 4 — CI/CD (~0.5 day)
  Goal: no untested code reaches production.

  4.1  Create .github/workflows/ci.yml
       - On PR: run frontend tests (vitest) + tsc --noEmit + lint
       - On PR: run backend tests (pytest, not integration)
       - Block merge on failure (branch protection rule)

  4.2  Auto-deploy on main merge
       - Vercel: already auto-deploys from git (verify)
       - Railway: add GitHub integration for auto-deploy

  4.3  Add pre-deploy checklist script
       - scripts/pre-deploy-check.sh: runs tests, type check,
         lint, security scan (gitleaks), prints pass/fail

PHASE 5 — DATA INGESTION + USEFULNESS (~2-3 days)
  Goal: replace synthetic data with real daily entry.

  5.1  Build manual daily-entry form
       - Frontend: /dashboard/data-entry page
       - Form: date, fuel type, liters sold, revenue, opening/
         closing stock
       - API: POST /api/sales → inserts to fuel_transactions
         (table already exists in schema)

  5.2  Wire trends page to real history
       - /dashboard/trends: line chart of daily_fuel_summary
       - Weather correlation chart (temperature vs demand)
       - 7/30/90 day range selector

  5.3  Wire orders page
       - /dashboard/orders: 3-policy comparison table
       - Order history log (past recommendations vs actual)
       - "Mark as ordered" button to track fulfillment

  5.4  Add Clerk webhook for user provisioning
       - /api/webhooks/clerk: verify Svix signature
       - Handle user.created, user.updated → upsert email
       - Remove the "pending-{userId}" placeholder logic

PHASE 6 — MODEL MANAGEMENT (~1-2 days, can defer)
  Goal: retrain without redeploying.

  6.1  Move models to object storage
       - Upload to Cloudflare R2 (free 10GB) or Backblaze B2
       - Download at startup, cache locally in /app/models/
       - Add MODEL_VERSION env var to select which version to load

  6.2  Add model metadata endpoint
       - GET /models: list loaded models, training date, version,
         feature count, validation MAE

  6.3  Add retraining script (offline, not on Railway)
       - scripts/retrain.py: fetch latest data from Neon, train,
         upload to R2, update MODEL_VERSION
       - Run locally or on a separate compute instance

────────────────────────────────────────────────────────────────────────
SECURITY HARDENING CHECKLIST
────────────────────────────────────────────────────────────────────────

  [ ] middleware.ts active (not proxy.ts)
  [ ] access-control fails closed (not open)
  [ ] Railway token rotated, 600 perms
  [ ] All API routes have requireAuth or requireAccess
  [ ] org_id scoping on every DB query (frontend + backend)
  [ ] Clerk webhook signature verification (Svix)
  [ ] Rate limiting per user (1 concurrent, 5min cooldown)
  [ ] Input validation: current_stock bounds, fuel_type enum
  [ ] Body size limits (done: 1MB backend, 100KB cost-matrix)
  [ ] Security headers (done: both sides)
  [ ] CORS explicit origins (done)
  [ ] No secrets in git (verify with gitleaks scan)
  [ ] Docs disabled in prod (done)
  [ ] HSTS on HTTPS (done: backend)
  [ ] JWT max size guard (done: 4KB)
  [ ] JWKS cache with TTL + stale fallback (done)
  [ ] Parameterized queries on Neon path (TODO — currently f-string)
  [ ] Error tracking (Sentry) — TODO
  [ ] Secrets rotation documented — TODO

────────────────────────────────────────────────────────────────────────
ARCHITECTURE TARGET (after all phases)
────────────────────────────────────────────────────────────────────────

  Vercel (Next.js 16)         Railway (FastAPI)              Neon (PostgreSQL)
  ┌──────────────┐            ┌──────────────────┐          ┌────────────────┐
  │ Clerk auth   │            │ Clerk JWT verify │          │  Per-tenant    │
  │ middleware   │── /v1/ ──>│ Rate limited     │── reads ->│  data isolation│
  │ org-scoped   │  forecast  │ Neon job table   │── writes->│  (org_id)      │
  │ Drizzle ORM  │<-- poll ──>│ Model cache (R2) │          │                │
  │ shadcn/ui    │            │ Sentry + metrics │          │  jobs table    │
  │ E2E tests    │            │ CI/CD gated      │          │  user_roles    │
  │ Data entry   │            │ Webhook verified │          │  fuel_trans    │
  └──────────────┘            └──────────────────┘          └────────────────┘
        │                                                          │
        │  Clerk webhook (Svix verified)                           │
        └──────────────────────────────────────────────────────────┘

  CI/CD: GitHub Actions → test gate → auto-deploy on green
  Monitoring: Sentry (errors) + Railway alerts (deploys) + /metrics
  Models: R2 object storage, versioned, downloaded at startup
  Data: manual daily entry → future ATG/CSV/OMC API integration
