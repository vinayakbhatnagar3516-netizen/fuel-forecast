import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;

  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Get the Clerk session token to pass to the backend
    const { getToken } = await import("@clerk/nextjs");
    const token = await getToken({ template: "backend-api" });

    // Call the backend's GET /forecast/jobs/{job_id} endpoint
    const response = await fetch(`${BACKEND_URL}/forecast/jobs/${jobId}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
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
      jobId: data.id,
      status: data.status,
      result: data.result,
      error: data.error,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (error) {
    console.error("Backend status check failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to connect to backend",
      },
      { status: 502 }
    );
  }
}
