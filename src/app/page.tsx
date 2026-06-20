import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  Activity,
  BarChart3,
  CloudSun,
  Gauge,
  Layers,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { ROUTES, SITE } from "@/lib/constants";
import {
  YantraMark,
  KolamGrid,
  JaaliCorner,
  LotusRule,
  DiamondStitch,
} from "@/components/indic-motifs";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) {
    redirect(ROUTES.DASHBOARD);
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-canvas text-ink overflow-x-hidden">
      {/* subtle kolam geometry across the hero */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <KolamGrid className="text-ink opacity-[0.04]" />
      </div>

      {/* ═══════════════════════════════════════════════════════════
         NAVIGATION
         ═══════════════════════════════════════════════════════════ */}
      <header className="relative z-10 border-b border-hairline bg-canvas/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href={ROUTES.HOME} className="flex items-center gap-2.5">
            <YantraMark size={34} color="#1A1F2E" />
            <div className="flex flex-col">
              <span className="font-[family-name:var(--font-instrument-serif)] text-lg font-semibold italic leading-none tracking-tight">
                Fuel Forecast
              </span>
              <span className="font-[family-name:var(--font-inter)] text-[10px] font-medium uppercase tracking-widest text-ink-muted">
                Demand Intelligence
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="#how-it-works"
              className="font-[family-name:var(--font-inter)] text-sm text-ink-muted transition hover:text-ink"
            >
              How it works
            </Link>
            <Link
              href="#features"
              className="font-[family-name:var(--font-inter)] text-sm text-ink-muted transition hover:text-ink"
            >
              Features
            </Link>
            <Link
              href="#pilot"
              className="font-[family-name:var(--font-inter)] text-sm text-ink-muted transition hover:text-ink"
            >
              Pilot
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.SIGN_IN}
              className="hidden rounded-full border border-transparent px-4 py-2 font-[family-name:var(--font-inter)] text-sm font-medium text-ink transition hover:text-saffron sm:inline-block"
            >
              Sign in
            </Link>
            <Link
              href={ROUTES.SIGN_UP}
              className="inline-flex items-center gap-2 rounded-full border border-saffron bg-ink px-5 py-2.5 font-[family-name:var(--font-inter)] text-sm font-medium text-canvas transition hover:bg-ink/90"
            >
              Start pilot
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        {/* ═══════════════════════════════════════════════════════════
           HERO
           ═══════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden px-6 pt-20 pb-28 sm:pt-28 sm:pb-36">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="max-w-2xl">
                <div className="mb-6 flex items-center gap-3">
                  <span className="eyebrow">Pilot programme</span>
                  <span className="h-px flex-1 max-w-[60px] bg-hairline" />
                  <span className="font-[family-name:var(--font-inter)] text-xs text-ink-muted">
                    {SITE.location}
                  </span>
                </div>

                <h1 className="font-[family-name:var(--font-inter)] text-4xl font-normal tracking-tight text-ink sm:text-5xl lg:text-6xl lg:leading-[1.08]">
                  Demand intelligence{" "}
                  <span className="font-[family-name:var(--font-instrument-serif)] italic text-saffron">
                    carved from pattern
                  </span>
                  .
                </h1>

                <p className="mt-6 max-w-lg font-[family-name:var(--font-source-serif)] text-lg leading-relaxed text-ink-muted">
                  Weather-aware forecasting for petrol pump operators. Know what
                  to order, when to order, and how much risk you carry — with
                  the discipline of an almanac and the speed of machine
                  learning.
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <Link
                    href={ROUTES.SIGN_UP}
                    className="inline-flex items-center gap-2 rounded-full border border-saffron bg-ink px-7 py-3 font-[family-name:var(--font-inter)] text-sm font-medium text-canvas transition hover:bg-ink/90"
                  >
                    Start your pilot
                  </Link>
                  <Link
                    href={ROUTES.SIGN_IN}
                    className="inline-flex items-center gap-2 rounded-full border border-saffron bg-transparent px-7 py-3 font-[family-name:var(--font-inter)] text-sm font-medium text-ink transition hover:bg-ink hover:text-canvas"
                  >
                    Sign in to dashboard
                  </Link>
                </div>

                <div className="mt-10 flex items-center gap-6 text-xs text-ink-muted">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-saffron" />
                    <span className="font-[family-name:var(--font-inter)]">Bank-grade auth</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CloudSun className="size-4 text-saffron" />
                    <span className="font-[family-name:var(--font-inter)]">Weather synced</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge className="size-4 text-saffron" />
                    <span className="font-[family-name:var(--font-inter)]">30-day forecast</span>
                  </div>
                </div>
              </div>

              {/* Hero visual: a "modern manuscript" forecast card */}
              <div className="relative hidden lg:block">
                <div className="relative mx-auto max-w-md rotate-1 rounded-md border border-hairline bg-white p-6 shadow-sm">
                  <JaaliCorner
                    position="top-right"
                    size={140}
                    color="#1A1F2E"
                    className="opacity-[0.06]"
                  />
                  <div className="relative">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="eyebrow">Today&apos;s decision</span>
                      <span className="rounded-full bg-sage/10 px-2.5 py-1 font-[family-name:var(--font-inter)] text-[10px] font-semibold uppercase tracking-wider text-sage">
                        Place order
                      </span>
                    </div>
                    <p className="font-[family-name:var(--font-inter)] text-lg font-normal text-ink">
                      Order 12,000L — balanced policy
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-source-serif)] text-sm text-ink-muted">
                      Conservative recommends 15,000L. Stockout risk: 8.4%.
                    </p>

                    <div className="mt-6 grid grid-cols-3 gap-3">
                      {[
                        { label: "Demand", value: "3,240L" },
                        { label: "Risk", value: "8.4%" },
                        { label: "Confidence", value: "78%" },
                      ].map((m) => (
                        <div
                          key={m.label}
                          className="rounded-sm border border-hairline bg-canvas p-3"
                        >
                          <p className="font-[family-name:var(--font-inter)] text-[10px] uppercase tracking-wider text-ink-muted">
                            {m.label}
                          </p>
                          <p className="mt-1 font-[family-name:var(--font-inter)] text-base font-normal tabular-nums text-ink">
                            {m.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 border-t border-hairline pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-[family-name:var(--font-source-serif)] text-ink-muted">
                          Expected daily profit
                        </span>
                        <span className="font-[family-name:var(--font-inter)] tabular-nums text-sage">
                          ₹ 24,800
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* floating motif behind the card */}
                <div className="absolute -bottom-8 -left-8 -z-10 opacity-[0.04]">
                  <YantraMark size={220} color="#1A1F2E" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
           LOCATION STRIP
           ═══════════════════════════════════════════════════════════ */}
        <section className="border-y border-hairline bg-white">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-4 sm:flex-row">
            <p className="font-[family-name:var(--font-source-serif)] text-sm text-ink-muted">
              Built for the NH-22 corridor, starting with one station in the
              Himalayan foothills.
            </p>
            <div className="flex items-center gap-2">
              <span className="font-[family-name:var(--font-inter)] text-xs font-medium uppercase tracking-wider text-ink">
                {SITE.location}
              </span>
              <span className="text-ink-muted">·</span>
              <span className="font-[family-name:var(--font-inter)] text-xs text-ink-muted">
                {SITE.altitude}
              </span>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
           HOW IT WORKS
           ═══════════════════════════════════════════════════════════ */}
        <section id="how-it-works" className="px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 max-w-2xl">
              <span className="eyebrow">How it works</span>
              <h2 className="mt-3 font-[family-name:var(--font-inter)] text-3xl font-normal tracking-tight text-ink sm:text-4xl">
                Ancient pattern recognition,{" "}
                <span className="font-[family-name:var(--font-instrument-serif)] italic">
                  rebuilt with probability
                </span>
                .
              </h2>
              <p className="mt-4 font-[family-name:var(--font-source-serif)] text-base leading-relaxed text-ink-muted">
                For generations, operators have read weather, season, and
                traffic as a kind of almanac. Fuel Forecast turns those signals
                into quantile forecasts and order recommendations you can act
                on before the tank runs low.
              </p>
              <DiamondStitch color="#C47335" className="mt-6" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: "01",
                  title: "Ingest",
                  body: "Weather, sales history, and pump constraints flow into one model.",
                },
                {
                  step: "02",
                  title: "Forecast",
                  body: "Quantile predictions give you a range, not just a single number.",
                },
                {
                  step: "03",
                  title: "Decide",
                  body: "Conservative, balanced, and aggressive order policies are compared side-by-side.",
                },
                {
                  step: "04",
                  title: "Order",
                  body: "Act on a clear recommendation with P&L and stockout risk attached.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="design-card group transition hover:border-saffron/40"
                >
                  <JaaliCorner
                    position="top-right"
                    size={100}
                    color="#1A1F2E"
                    className="opacity-[0.05] transition-opacity group-hover:opacity-[0.08]"
                  />
                  <span className="font-[family-name:var(--font-instrument-serif)] text-2xl italic text-saffron/60">
                    {item.step}
                  </span>
                  <h3 className="mt-4 font-[family-name:var(--font-inter)] text-lg font-medium text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 font-[family-name:var(--font-source-serif)] text-sm leading-relaxed text-ink-muted">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
           FEATURES
           ═══════════════════════════════════════════════════════════ */}
        <section id="features" className="bg-white px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <span className="eyebrow">Features</span>
              <h2 className="mt-3 font-[family-name:var(--font-inter)] text-3xl font-normal tracking-tight text-ink sm:text-4xl">
                Everything a pump operator needs to plan ahead.
              </h2>
              <div className="mx-auto mt-5 max-w-md">
                <LotusRule color="#C47335" />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: CloudSun,
                  title: "Weather-aware forecasts",
                  body: "Temperature, rainfall, and seasonality are built into every prediction, because demand on a mountain highway is never flat.",
                },
                {
                  icon: BarChart3,
                  title: "Quantile predictions",
                  body: "See best-case, median, and worst-case demand bands instead of gambling on a single guess.",
                },
                {
                  icon: Layers,
                  title: "Three order policies",
                  body: "Compare conservative, balanced, and aggressive recommendations with cost and stockout risk for each.",
                },
                {
                  icon: TrendingUp,
                  title: "P&L in plain sight",
                  body: "Expected daily and monthly profit, chance of loss, and 5% VaR are surfaced next to every forecast.",
                },
                {
                  icon: Activity,
                  title: "Diagnostics & health",
                  body: "Run the forecast engine, inspect model health, and re-seed cost assumptions from one console.",
                },
                {
                  icon: ShieldCheck,
                  title: "Secure by default",
                  body: "Clerk authentication, organization-aware access, and encrypted database connections.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="design-card group transition hover:border-saffron/40"
                >
                  <JaaliCorner
                    position="top-right"
                    size={110}
                    color="#1A1F2E"
                    className="opacity-[0.04] transition-opacity group-hover:opacity-[0.07]"
                  />
                  <div className="mb-4 inline-flex rounded-full border border-hairline bg-canvas p-2.5">
                    <feature.icon className="size-5 text-saffron" />
                  </div>
                  <h3 className="font-[family-name:var(--font-inter)] text-base font-medium text-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-2 font-[family-name:var(--font-source-serif)] text-sm leading-relaxed text-ink-muted">
                    {feature.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
           PILOT CTA
           ═══════════════════════════════════════════════════════════ */}
        <section id="pilot" className="relative px-6 py-24 sm:py-32">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <KolamGrid className="text-saffron opacity-[0.025]" />
          </div>

          <div className="relative mx-auto max-w-4xl rounded-md border border-hairline bg-white p-8 text-center shadow-sm sm:p-12">
            <JaaliCorner
              position="top-right"
              size={160}
              color="#1A1F2E"
              className="opacity-[0.04]"
            />
            <JaaliCorner
              position="bottom-left"
              size={160}
              color="#1A1F2E"
              className="opacity-[0.04]"
            />

            <span className="eyebrow">Join the pilot</span>
            <h2 className="mx-auto mt-4 max-w-2xl font-[family-name:var(--font-inter)] text-3xl font-normal tracking-tight text-ink sm:text-4xl">
              Ready to turn demand uncertainty into a daily plan?
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-[family-name:var(--font-source-serif)] text-base leading-relaxed text-ink-muted">
              The pilot is open to petrol pump operators in the Kandaghat-Chail
              region. We&apos;ll onboard your station, configure your cost
              matrix, and run your first forecast together.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={ROUTES.SIGN_UP}
                className="inline-flex items-center gap-2 rounded-full border border-saffron bg-ink px-8 py-3 font-[family-name:var(--font-inter)] text-sm font-medium text-canvas transition hover:bg-ink/90"
              >
                Request access
              </Link>
              <Link
                href={ROUTES.SIGN_IN}
                className="inline-flex items-center gap-2 rounded-full border border-saffron bg-transparent px-8 py-3 font-[family-name:var(--font-inter)] text-sm font-medium text-ink transition hover:bg-ink hover:text-canvas"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════════════════════
         FOOTER
         ═══════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-hairline bg-white px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5">
          <YantraMark size={28} color="#1A1F2E" className="opacity-80" />
          <LotusRule color="#C47335" className="w-24" />
          <p className="text-center font-[family-name:var(--font-inter)] text-xs text-ink-muted">
            {SITE.location} · {SITE.altitude}
          </p>
          <p className="text-center font-[family-name:var(--font-source-serif)] text-xs italic text-ink-dim">
            {SITE.tagline}
          </p>
        </div>
      </footer>
    </div>
  );
}
