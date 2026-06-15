"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TrendsPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Trends</p>
        <p className="body-prose text-[14px] text-ink-muted mt-1">How demand has moved and what&apos;s driving it.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="design-card col-span-full">
          <CardHeader>
            <CardTitle className="section-heading font-[family-name:var(--font-inter)] heading-lotus">Forecast history</CardTitle>
            <CardDescription className="body-prose text-[13px] text-ink-muted">Forecast trend chart will appear here once data is connected.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-sm border border-dashed border-hairline bg-slate-50/50">
              <p className="body-prose text-[14px] text-ink-dim">No forecast history yet</p>
            </div>
          </CardContent>
        </Card>

        <Card className="design-card">
          <CardHeader>
            <CardTitle className="section-heading font-[family-name:var(--font-inter)] heading-lotus">Temperature</CardTitle>
            <CardDescription className="body-prose text-[13px] text-ink-muted">High and low temperatures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center rounded-sm border border-dashed border-hairline bg-slate-50/50">
              <p className="body-prose text-[14px] text-ink-dim">No weather data</p>
            </div>
          </CardContent>
        </Card>

        <Card className="design-card">
          <CardHeader>
            <CardTitle className="section-heading font-[family-name:var(--font-inter)] heading-lotus">Rainfall</CardTitle>
            <CardDescription className="body-prose text-[13px] text-ink-muted">Daily rainfall in mm</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center rounded-sm border border-dashed border-hairline bg-slate-50/50">
              <p className="body-prose text-[14px] text-ink-dim">No weather data</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
