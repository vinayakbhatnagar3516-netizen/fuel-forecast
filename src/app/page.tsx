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
    <div className="relative min-h-screen flex flex-col bg-[#F5F0EB] text-[#2D2A26] overflow-x-hidden">
      {/* subtle kolam geometry + deodar forest whisper */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <KolamGrid className="text-[#D4834A] opacity-[0.03]" />
      </div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1/2 opacity-[0.025] pointer-events-none deodar-hero" />

      {/* ═══════════════════════════════════════════════════════════
         NAVIGATION
         ═══════════════════════════════════════════════════════════ */}
      <header className="relative z-10 border-b border-[#E0D6CC] bg-[#FFFAF5]/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href={ROUTES.HOME} className="flex items-center gap-2.5">
            <YantraMark size={34} color="#D4834A" />
            <div className="flex flex-col">
              <span className="font-[family-name:var(--font-instrument-serif)] text-lg font-semibold italic leading-none tracking-tight text-[#2D2A26]">
                Fuel Forecast
              </span>
              <span className="font-[family-name:var(--font-inter)] text-[10px] font-medium uppercase tracking-widest text-[#7A6F65]">
                Demand Intelligence
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="#how-it-works"
              className="font-[family-name:var(--font-inter)] text-sm text-[#7A6F65] transition hover:text-[#2D2A26]"
            >
              How it works
            </Link>
            <Link
              href="#features"
              className="font-[family-name:var(--font-inter)] text-sm text-[#7A6F65] transition hover:text-[#2D2A26]"
            >
              Features
            </Link>
            <Link
              href="#pilot"
              className="font-[family-name:var(--font-inter)] text-sm text-[#7A6F65] transition hover:text-[#2D2A26]"
            >
              Pilot
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.SIGN_IN}
              className="hidden rounded-full border border-transparent px-4 py-2 font-[family-name:var(--font-inter)] text-sm font-medium text-[#2D2A26] transition hover:text-[#D4834A] sm:inline-block"
            >
              Sign in
            </Link>
            <Link
              href={ROUTES.SIGN_UP}
              className="inline-flex items-center gap-2 rounded-full border border-[#D4834A] bg-[#2D2A26] px-5 py-2.5 font-[family-name:var(--font-inter)] text-sm font-medium text-[#FFFAF5] transition hover:bg-[#2D2A26]/90"
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
                  <span className="font-[family-name:var(--font-inter)] text-[10px] font-bold uppercase tracking-[0.15em] text-[#D4834A]">Pilot programme</span>
                  <span className="h-px flex-1 max-w-[60px] bg-[#E0D6CC]" />
                  <span className="font-[family-name:var(--font-inter)] text-xs text-[#7A6F65]">
                    {SITE.location}
                  </span>
                </div>

                <h1 className="font-[family-name:var(--font-inter)] text-4xl font-normal tracking-tight text-[#2D2A26] sm:text-5xl lg:text-6xl lg:leading-[1.08]">
                  Demand intelligence{" "}
                  <span className="font-[family-name:var(--font-instrument-serif)] italic text-[#D4834A]">
                    carved from pattern
                  </span>
                  .
                </h1>

                <p className="mt-6 max-w-lg font-[family-name:var(--font-source-serif)] text-lg leading-relaxed text-[#7A6F65]">
                  Weather-aware forecasting for petrol pump operators. Know what
                  to order, when to order, and how much risk you carry — with
                  the discipline of an almanac and the speed of machine
                  learning.
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <Link
                    href={ROUTES.SIGN_UP}
                    className="inline-flex items-center gap-2 rounded-full border border-[#D4834A] bg-[#2D2A26] px-7 py-3 font-[family-name:var(--font-inter)] text-sm font-medium text-[#FFFAF5] transition hover:bg-[#2D2A26]/90"
                  >
                    Start your pilot
                  </Link>
                  <Link
                    href={ROUTES.SIGN_IN}
                    className="inline-flex items-center gap-2 rounded-full border border-[#D4834A] bg-transparent px-7 py-3 font-[family-name:var(--font-inter)] text-sm font-medium text-[#2D2A26] transition hover:bg-[#2D2A26] hover:text-[#FFFAF5]"
                  >
                    Sign in to dashboard
                  </Link>
                </div>

                <div className="mt-10 flex items-center gap-6 text-xs text-[#7A6F65]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-[#2D6A4F]" />
                    <span className="font-[family-name:var(--font-inter)]">Bank-grade auth</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CloudSun className="size-4 text-[#D4834A]" />
                    <span className="font-[family-name:var(--font-inter)]">Weather synced</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge className="size-4 text-[#4A6FA5]" />
                    <span className="font-[family-name:var(--font-inter)]">30-day forecast</span>
                  </div>
                </div>
              </div>

              {/* Hero visual: a "modern manuscript" forecast card */}
              <div className="relative hidden lg:block">
                <div className="relative mx-auto max-w-md rotate-1 rounded-md border border-[#E0D6CC] bg-[#FFFAF5] p-6 shadow-sm">
                  <JaaliCorner
                    position="top-right"
                    size={140}
                    color="#D4834A"
                    className="opacity-[0.06]"
                  />
                  <div className="relative">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="font-[family-name:var(--font-inter)] text-[10px] font-bold uppercase tracking-[0.15em] text-[#D4834A]">Today&apos;s decision</span>
                      <span className="rounded-full bg-[rgba(45,106,79,0.1)] px-2.5 py-1 font-[family-name:var(--font-inter)] text-[10px] font-semibold uppercase tracking-wider text-[#2D6A4F]">
                        Place order
                      </span>
                    </div>
                    <p className="font-[family-name:var(--font-instrument-serif)] text-lg font-normal italic text-[#2D2A26]">
                      Order 12,000L — balanced policy
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-source-serif)] text-sm text-[#7A6F65]">
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
                          className="rounded-sm border border-[#E0D6CC] bg-[#F5F0EB] p-3"
                        >
                          <p className="font-[family-name:var(--font-inter)] text-[10px] uppercase tracking-wider text-[#7A6F65]">
                            {m.label}
                          </p>
                          <p className="mt-1 font-[family-name:var(--font-inter)] text-base font-normal tabular-nums text-[#2D2A26]">
                            {m.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 border-t border-[#E0D6CC] pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-[family-name:var(--font-source-serif)] text-[#7A6F65]">
                          Expected daily profit
                        </span>
                        <span className="font-[family-name:var(--font-inter)] tabular-nums text-[#2D6A4F]">
                          ₹ 24,800
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* floating motif behind the card */}
                <div className="absolute -bottom-8 -left-8 -z-10 opacity-[0.04]">
                  <YantraMark size={220} color="#D4834A" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
           LOCATION STRIP
           ═══════════════════════════════════════════════════════════ */}
        <section className="border-y border-[#E0D6CC] bg-[#FFFAF5]">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-4 sm:flex-row">
            <p className="font-[family-name:var(--font-source-serif)] text-sm text-[#7A6F65]">
              Built for the NH-22 corridor, starting with one station in the
              Himalayan foothills.
            </p>
            <div className="flex items-center gap-2">
              <span className="font-[family-name:var(--font-inter)] text-xs font-medium uppercase tracking-wider text-[#2D2A26]">
                {SITE.location}
              </span>
              <span className="text-[#A0988C]">·</span>
              <span className="font-[family-name:var(--font-inter)] text-xs text-[#A0988C]">
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
              <span className="font-[family-name:var(--font-inter)] text-[10px] font-bold uppercase tracking-[0.15em] text-[#D4834A]">How it works</span>
              <h2 className="mt-3 font-[family-name:var(--font-inter)] text-3xl font-normal tracking-tight text-[#2D2A26] sm:text-4xl">
                Ancient pattern recognition,{" "}
                <span className="font-[family-name:var(--font-instrument-serif)] italic">
                  rebuilt with probability
                </span>
                .
              </h2>
              <p className="mt-4 font-[family-name:var(--font-source-serif)] text-base leading-relaxed text-[#7A6F65]">
                For generations, operators have read weather, season, and
                traffic as a kind of almanac. Fuel Forecast turns those signals
                into quantile forecasts and order recommendations you can act
                on before the tank runs low.
              </p>
              <DiamondStitch color="#D4834A" className="mt-6" />
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
                  className="border border-[#E0D6CC] rounded-[0.5rem] bg-[#FFFAF5] p-6 transition hover:border-[#D4834A]/40"
                >
                  <JaaliCorner
                    position="top-right"
                    size={100}
                    color="#D4834A"
                    className="opacity-[0.05] transition-opacity group-hover:opacity-[0.08]"
                  />
                  <span className="font-[family-name:var(--font-instrument-serif)] text-2xl italic text-[#D4834A]/60">
                    {item.step}
                  </span>
                  <h3 className="mt-4 font-[family-name:var(--font-inter)] text-lg font-medium text-[#2D2A26]">
                    {item.title}
                  </h3>
                  <p className="mt-2 font-[family-name:var(--font-source-serif)] text-sm leading-relaxed text-[#7A6F65]">
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
        <section id="features" className="bg-[#FFFAF5] px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <span className="font-[family-name:var(--font-inter)] text-[10px] font-bold uppercase tracking-[0.15em] text-[#D4834A]">Features</span>
              <h2 className="mt-3 font-[family-name:var(--font-inter)] text-3xl font-normal tracking-tight text-[#2D2A26] sm:text-4xl">
                Everything a pump operator needs to plan ahead.
              </h2>
              <div className="mx-auto mt-5 max-w-md">
                <LotusRule color="#D4834A" />
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
                  className="border border-[#E0D6CC] rounded-[0.5rem] bg-[#FFFAF5] p-6 transition hover:border-[#D4834A]/40"
                >
                  <JaaliCorner
                    position="top-right"
                    size={110}
                    color="#D4834A"
                    className="opacity-[0.04] transition-opacity group-hover:opacity-[0.07]"
                  />
                  <div className="mb-4 inline-flex rounded-full border border-[#E0D6CC] bg-[#F5F0EB] p-2.5">
                    <feature.icon className="size-5 text-[#D4834A]" />
                  </div>
                  <h3 className="font-[family-name:var(--font-inter)] text-base font-medium text-[#2D2A26]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 font-[family-name:var(--font-source-serif)] text-sm leading-relaxed text-[#7A6F65]">
                    {feature.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
           CTA
           ═══════════════════════════════════════════════════════════ */}
        <section id="pilot" className="relative px-6 py-24 sm:py-32">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <KolamGrid className="text-[#D4834A] opacity-[0.025]" />
          </div>

          <div className="relative mx-auto max-w-4xl rounded-md border border-[#E0D6CC] bg-[#FFFAF5] p-8 text-center shadow-sm sm:p-12">
            <JaaliCorner
              position="top-right"
              size={160}
              color="#D4834A"
              className="opacity-[0.04]"
            />
            <JaaliCorner
              position="bottom-left"
              size={160}
              color="#D4834A"
              className="opacity-[0.04]"
            />

            <span className="font-[family-name:var(--font-inter)] text-[10px] font-bold uppercase tracking-[0.15em] text-[#D4834A]">Join the pilot</span>
            <h2 className="mx-auto mt-4 max-w-2xl font-[family-name:var(--font-inter)] text-3xl font-normal tracking-tight text-[#2D2A26] sm:text-4xl">
              Ready to turn demand uncertainty into a daily plan?
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-[family-name:var(--font-source-serif)] text-base leading-relaxed text-[#7A6F65]">
              The pilot is open to petrol pump operators in the Kandaghat-Chail
              region. We&apos;ll onboard your station, configure your cost
              matrix, and run your first forecast together.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={ROUTES.SIGN_UP}
                className="inline-flex items-center gap-2 rounded-full border border-[#D4834A] bg-[#2D2A26] px-8 py-3 font-[family-name:var(--font-inter)] text-sm font-medium text-[#FFFAF5] transition hover:bg-[#2D2A26]/90"
              >
                Request access
              </Link>
              <Link
                href={ROUTES.SIGN_IN}
                className="inline-flex items-center gap-2 rounded-full border border-[#D4834A] bg-transparent px-8 py-3 font-[family-name:var(--font-inter)] text-sm font-medium text-[#2D2A26] transition hover:bg-[#2D2A26] hover:text-[#FFFAF5]"
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
      <div className="strata-accent" />
      <footer className="relative z-10 bg-[#FFFAF5] px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5">
          <YantraMark size={28} color="#D4834A" className="opacity-80" />
          <LotusRule color="#D4834A" className="w-24" />
          <p className="text-center font-[family-name:var(--font-inter)] text-xs text-[#7A6F65]">
            {SITE.location} · {SITE.altitude}
          </p>
          <p className="text-center font-[family-name:var(--font-source-serif)] text-xs italic text-[#A0988C]">
            {SITE.tagline}
          </p>
        </div>
      </footer>
    </div>
  );
}
