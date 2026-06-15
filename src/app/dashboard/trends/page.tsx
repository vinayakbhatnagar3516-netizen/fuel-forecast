"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TrendsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-[#1A1F2E] heading-kolam pb-3">
          Trends
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">How demand has moved and what's driving it.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border rounded-sm shadow-none col-span-full">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#2C3E50]">Forecast history</CardTitle>
            <CardDescription className="text-xs">Forecast trend chart will appear here once data is connected.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-sm border border-dashed border-border bg-warm-bg">
              <p className="text-sm text-muted-foreground">No forecast history yet</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border rounded-sm shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#2C3E50]">Temperature</CardTitle>
            <CardDescription className="text-xs">High and low temperatures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center rounded-sm border border-dashed border-border bg-warm-bg">
              <p className="text-sm text-muted-foreground">No weather data</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border rounded-sm shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#2C3E50]">Rainfall</CardTitle>
            <CardDescription className="text-xs">Daily rainfall in mm</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center rounded-sm border border-dashed border-border bg-warm-bg">
              <p className="text-sm text-muted-foreground">No weather data</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
