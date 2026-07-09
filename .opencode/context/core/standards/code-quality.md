<!-- Context: project/standards/code | Priority: critical | Version: 1.0 | Updated: 2026-07-09 -->
# Project Code Standards — fuel-forecast (Frontend / Next.js)

## Core Philosophy

**Typed**, **Component-based**, **Maintainable** TypeScript. Thin client: UI + auth + data entry;
the heavy ML lives in the Python backend. Golden Rule: *if you can't easily test it, refactor it.*

## Critical Patterns

| Pattern | Guideline |
|---|---|
| ✅ **Pure functions** | Same input = same output. DB/I/O/API calls isolated at route + server boundaries. |
| ✅ **Typed boundaries** | No implicit `any` in app code. Use the shared types in `src/lib/api-types.ts`. |
| ✅ **Server/Client split** | Mark interactive components `"use client"`; keep data fetching in route handlers / server components. |
| ✅ **DB only via Drizzle** | Never hand-write raw SQL in app code. Use the Drizzle query builder against `src/db/schema.ts`. |
| ✅ **Small functions** | < 50 lines ideally. Single responsibility. |
| ✅ **Explicit errors** | Return `NextResponse.json({ error, ... }, { status })`; never swallow exceptions. |

## Project-Specific Conventions

### Layout
- `src/app/` — App Router (pages + `api/` route handlers).
- `src/components/ui/` — shadcn/ui primitives (built on `@base-ui/react`). Do not edit by hand casually.
- `src/lib/` — shared logic (types, auth guards, access control). `proxy-forecast.ts` was **DELETED** (2026-07-09) — do not reintroduce.
- `src/db/` — Drizzle schema (`schema.ts` = authoritative Neon DDL) + neon client (`index.ts`).
- `src/__tests__/` — Vitest specs + `setup.ts`.

### Imports
- **Path alias**: `@/` → `src/` (configured in `tsconfig.json`). Use it everywhere.
  ```ts
  import { db } from "@/db";
  import { requireAuth } from "@/lib/auth-guard";
  ```
- **Order**: (1) external packages, (2) `@/` aliases, (3) relative `./` / `../`.

### Naming
- **Files**: `kebab-case.ts` (e.g., `api-types.ts`, `auth-guard.ts`, `access-control.ts`)
- **React components**: `PascalCase.tsx` (e.g., `DashboardPage.tsx`, `Sidebar.tsx`)
- **Functions**: `camelCase` — e.g., `runProxyForecast` (dead), `requireAuth`, `getAccessLevel`
- **Types/Interfaces**: `PascalCase` — e.g., `DecisionData`, `AccessLevel`, `CostMatrixData`
- **Constants**: `UPPER_SNAKE_CASE` for module-level constants; `camelCase` for locals
- **DB columns** (Drizzle): `snake_case` (mirrors Neon)

### Code Style
- **TypeScript**: `strict: true`. Avoid `any`; prefer `unknown` + narrowing.
- **Formatter**: Prettier (default Next.js config). Run `npm run lint` (ESLint 9 + `eslint-config-next`).
- **Tailwind**: utility classes; design tokens via `globals.css`. Use `cn()` (`clsx` + `tailwind-merge`) for conditional classes.
- **No `eslint-disable`** without a reason comment.

### API Route Handlers
```ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";

export async function GET(request: Request) {
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;        // 401 already built
  try {
    // ... work ...
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json({ error: "..." }, { status: 500 });
  }
}
```
- Protect sensitive routes with `requireAuth()` (or `requireAccess("admin")` from `access-control.ts`).
- When proxying to the Python backend, forward the Clerk token:
  `const token = await (await auth()).getToken();` → `Authorization: Bearer ${token}`.
- Never hardcode `BACKEND_URL`; read `process.env.BACKEND_URL` (defaults to `localhost:8000`).

### Auth & Access Control
- `src/middleware.ts` (Clerk) gates `/dashboard/*` and `/api/*`.
- `src/lib/access-control.ts` enforces `admin`/`member`/`waitlisted`/`denied`. Admin email is
  hardcoded (`vinayakbhatnagar3516@gmail.com`) for the pilot.
- Fail **closed**: on DB/auth error, return `denied` (never silently grant).

### DB Access
```ts
import { db } from "@/db";
import { dailyForecastQuantiles } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

const rows = await db
  .select()
  .from(dailyForecastQuantiles)
  .where(eq(dailyForecastQuantiles.fuelType, ft))
  .limit(1);
```
- The Neon schema is owned by Drizzle `schema.ts`. **Do not create tables via raw SQL.**
- Numeric columns are `decimal` → read as strings or `Number(...)`; be explicit about parsing.

## Testing (Vitest)
- **Framework**: Vitest + @testing-library/react + jsdom. Specs in `src/__tests__/`.
- **Pattern**: Arrange → Act → Assert. Mock external boundaries (DB, fetch, Clerk).
- Run: `npm test` (or `npm run test:coverage`).
- `src/__tests__/setup.ts` sets up the test environment — don't bypass it.

## Anti-Patterns (Avoid)
| Anti-Pattern | Why |
|---|---|
| ❌ Reintroducing `proxy-forecast.ts` | DELETED (2026-07-09); it was a fake synthetic-data engine. Use the Python backend for forecasts. |
| ❌ Raw SQL strings in app code | Schema drift / injection. Use Drizzle builder. |
| ❌ `any` in app code | Defeats the type system. Use `unknown` + guards. |
| ❌ Swallowing errors | Always log + return a structured error response. |
| ❌ Hardcoding `BACKEND_URL` / secrets | Use env vars; secrets never in client code. |
| ❌ Bypassing `requireAuth`/`requireAccess` | Breaks the waitlist gating. |
| ❌ Editing `src/components/ui/*` casually | shadcn-generated; regenerate via `shadcn` CLI. |

## Cross-Repo Note
This is the **frontend**; the ML/API brain is `petrol-pump-forecast` (Python). The two-repo topology,
data flow, and schema ownership are in `.opencode/context/cross-repo-overview.md`. The Neon schema
defined here is authoritative for **both** repos.
