"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DiagnosticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-[#1A1F2E] heading-kolam pb-3">
          Diagnostics
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Model accuracy, backtesting, and maintenance actions.</p>
      </div>

      <Card className="border-border rounded-sm shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#2C3E50]">Generate fresh forecast</CardTitle>
          <CardDescription className="text-xs">Run the full ML pipeline to produce a new forecast.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button className="bg-[#2C3E50] hover:bg-[#3D5166] text-white rounded-sm">Generate forecast</Button>
            <p className="text-xs text-muted-foreground">This will trigger the inference pipeline (~30s).</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border rounded-sm shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#2C3E50]">Model accuracy</CardTitle>
          <CardDescription className="text-xs">Per-quantile error metrics and training stats.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-center justify-center rounded-sm border border-dashed border-border bg-warm-bg">
            <p className="text-sm text-muted-foreground">No model metrics yet — run a forecast first</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border rounded-sm shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#2C3E50]">System health</CardTitle>
          <CardDescription className="text-xs">Database, forecast, and weather data status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { label: "Database", status: "Not connected", color: "text-burgundy" },
              { label: "Forecast", status: "None available", color: "text-muted-foreground" },
              { label: "Weather data", status: "Not collected", color: "text-muted-foreground" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-sm border border-border px-3 py-2">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className={`text-sm font-medium ${item.color}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
