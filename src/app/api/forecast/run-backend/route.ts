import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: Request) {
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;

  try {
    // Get the Clerk session token to pass to the backend
    const { getToken } = await import("@clerk/nextjs");
    const token = await getToken({ template: "backend-api" });

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const fuelType = body.fuelType || "combined";
    const currentStock = body.currentStock || null;

    // Call the backend's POST /forecast endpoint
    const response = await fetch(`${BACKEND_URL}/forecast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        fuel_type: fuelType,
        current_stock: currentStock,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: errorData.detail || `Backend returned ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      jobId: data.job_id,
      status: data.status,
      forecastDate: data.forecast_date,
    });
  } catch (error) {
    console.error("Backend forecast call failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to connect to backend",
      },
      { status: 502 }
    );
  }
}
