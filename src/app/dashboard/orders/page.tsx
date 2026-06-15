"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-[#1A1F2E] heading-kolam pb-3">
          Orders
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Order recommendations, history, and upcoming deliveries.</p>
      </div>

      <Card className="border-border rounded-sm shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#2C3E50]">Current recommendation</CardTitle>
          <CardDescription className="text-xs">Run a forecast to get an order recommendation.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center rounded-sm border border-dashed border-border bg-warm-bg">
            <p className="text-sm text-muted-foreground">No recommendation yet</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border rounded-sm shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#2C3E50]">Order history</CardTitle>
          <CardDescription className="text-xs">Past orders and delivery status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center rounded-sm border border-dashed border-border bg-warm-bg">
            <p className="text-sm text-muted-foreground">No order history</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
