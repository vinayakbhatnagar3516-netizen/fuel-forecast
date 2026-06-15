"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrdersPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Orders</p>
        <p className="body-prose text-[14px] text-ink-muted mt-1">Order recommendations, history, and upcoming deliveries.</p>
      </div>

      <Card className="design-card">
        <CardHeader>
          <CardTitle className="section-heading font-[family-name:var(--font-inter)] heading-lotus">Current recommendation</CardTitle>
          <CardDescription className="body-prose text-[13px] text-ink-muted">Run a forecast to get an order recommendation.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center rounded-sm border border-dashed border-hairline bg-slate-50/50">
            <p className="body-prose text-[14px] text-ink-dim">No recommendation yet</p>
          </div>
        </CardContent>
      </Card>

      <Card className="design-card">
        <CardHeader>
          <CardTitle className="section-heading font-[family-name:var(--font-inter)] heading-lotus">Order history</CardTitle>
          <CardDescription className="body-prose text-[13px] text-ink-muted">Past orders and delivery status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center rounded-sm border border-dashed border-hairline bg-slate-50/50">
            <p className="body-prose text-[14px] text-ink-dim">No order history</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
