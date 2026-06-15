"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-[#1A1F2E] heading-kolam pb-3">
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Station configuration and preferences.</p>
      </div>

      <Card className="border-border rounded-sm shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#2C3E50]">Station Information</CardTitle>
          <CardDescription className="text-xs">Configure your pump station details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">Station name</Label>
              <Input id="name" placeholder="Kandaghat-Chail Pump" className="border-border rounded-sm" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="location" className="text-xs font-medium text-muted-foreground">Location</Label>
              <Input id="location" placeholder="Kandaghat, Himachal Pradesh" className="border-border rounded-sm" />
            </div>
          </div>
          <Button className="bg-[#2C3E50] hover:bg-[#3D5166] text-white rounded-sm">Save</Button>
        </CardContent>
      </Card>

      <Card className="border-border rounded-sm shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#2C3E50]">Tank Capacities</CardTitle>
          <CardDescription className="text-xs">Set your underground tank capacities in liters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="petrol-cap" className="text-xs font-medium text-muted-foreground">Petrol tank (L)</Label>
              <Input id="petrol-cap" type="number" placeholder="30000" className="border-border rounded-sm" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="hsd-cap" className="text-xs font-medium text-muted-foreground">HSD tank (L)</Label>
              <Input id="hsd-cap" type="number" placeholder="24000" className="border-border rounded-sm" />
            </div>
          </div>
          <Button className="bg-[#2C3E50] hover:bg-[#3D5166] text-white rounded-sm">Save</Button>
        </CardContent>
      </Card>
    </div>
  );
}
