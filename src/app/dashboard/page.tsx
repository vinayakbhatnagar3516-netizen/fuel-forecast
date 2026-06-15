"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function KolamOrnament() {
  return (
    <div className="kolam-ornament flex items-center justify-center gap-1">
      <svg width="48" height="12" viewBox="0 0 48 12" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="6" r="1.5" fill="#C47335" opacity="0.4" />
        <circle cx="20" cy="6" r="1.5" fill="#C47335" opacity="0.4" />
        <circle cx="32" cy="6" r="1.5" fill="#C47335" opacity="0.4" />
      </svg>
    </div>
  );
}

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-heading text-2xl font-semibold text-[#1A1F2E] heading-kolam pb-3">
          Today
        </h1>
        <KolamOrnament />
        <p className="mt-2 text-sm text-muted-foreground">
          What you need to do, in one screen.
        </p>
      </div>

      {/* Decision banner — the hero element */}
      <div className="decision-banner bg-[#F0F7F4] border-l-sage">
        <p className="headline font-heading text-lg font-semibold text-[#1A1F2E] relative">
          Good morning — no urgent action needed
        </p>
        <p className="sub text-sm text-muted-foreground relative mt-1">
          No forecast data yet.{" "}
          <span className="text-[#C47335] font-medium">Generate your first forecast</span> to
          see your order recommendation.
        </p>
      </div>

      {/* Three key metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border rounded-sm shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Expected demand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-medium text-[#1A1F2E] tracking-tight">—</p>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              What we predict you'll sell today. Run a forecast to see data.
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="border-border rounded-sm shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Stockout risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-medium text-[#1A1F2E] tracking-tight">—</p>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Chance of running out before the next delivery. Lower is safer.
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="border-border rounded-sm shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Forecast confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-medium text-[#1A1F2E] tracking-tight">—</p>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              How reliable the model thinks this forecast is. Based on prediction interval width.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* P&L snapshot placeholder */}
      <div>
        <h2 className="font-heading text-base font-semibold text-[#2C3E50] mt-8 mb-4">
          Profit &amp; Loss
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Expected daily profit", desc: "What you'll likely earn each day after costs." },
            { label: "Expected monthly profit", desc: "Projected earnings over 30 days." },
            { label: "Chance of loss", desc: "Probability that a day's profit is negative." },
            { label: "Worst case (5%)", desc: "On your worst 5% of days, you'll lose at least this much." },
          ].map((m) => (
            <Card key={m.label} className="border-border rounded-sm shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {m.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-medium text-[#1A1F2E] tracking-tight">—</p>
                <CardDescription className="text-xs text-muted-foreground mt-1">{m.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Seasonal alert placeholder */}
      <div className="decision-banner bg-[#F5F7FA] border-l-slate">
        <p className="headline font-heading text-base font-semibold text-[#1A1F2E] relative">
          What's coming
        </p>
        <p className="sub text-sm text-muted-foreground relative mt-1">
          No seasonal alerts yet. They'll appear here when a season change or weather event is imminent.
        </p>
      </div>

      {/* Setting expectations */}
      <div className="pt-4">
        <p className="text-xs text-muted-foreground italic">
          This is the pilot dashboard shell. Real data will appear here once connected to the forecast
          engine. Go to <span className="text-[#C47335] font-medium">Diagnostics</span> to generate
          your first forecast.
        </p>
      </div>
    </div>
  );
}
