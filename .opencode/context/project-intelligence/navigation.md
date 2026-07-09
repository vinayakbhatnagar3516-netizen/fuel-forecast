<!-- Context: project-intelligence/navigation | Priority: high | Version: 1.0 | Updated: 2026-07-09 -->
# Project Intelligence — Fuel Forecast Frontend

## Files

| File | Purpose |
|---|---|
| [technical-domain.md](technical-domain.md) | Frontend stack, data flow, API routes, auth, **Drizzle schema ownership** |
| [decisions-log.md](decisions-log.md) | Frontend + cross-cutting decisions (D009–D013, F001–F003) |
| [../cross-repo-overview.md](../cross-repo-overview.md) | **Two-repo topology, data flow, deploy, ownership** |
| [../core/standards/code-quality.md](../core/standards/code-quality.md) | TS/Next.js code standards |

## Quick Routes

- "What's the stack?" → `technical-domain.md`
- "How does data flow?" → `technical-domain.md` (Data Flow) + `cross-repo-overview.md`
- "Which API routes exist?" → `technical-domain.md` (API Routes)
- "Who owns the Neon schema?" → `decisions-log.md` (D011) + `technical-domain.md` (DB Schema)
- "Why is the Neon schema divergent / what's the reconciliation plan?" → `decisions-log.md` (D014) + `technical-domain.md` (DB Schema)
- "Is proxy-forecast.ts used?" → `decisions-log.md` (D012) — **no, deleted**
- "How does auth/work?" → `technical-domain.md` (Auth) + `decisions-log.md` (D013)
- "How do the two repos fit?" → `cross-repo-overview.md`
- "Backend repo context?" → `petrol-pump-forecast/.opencode/context/` (see `cross-repo-overview.md`)
