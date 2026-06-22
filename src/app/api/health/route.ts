import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  const start = Date.now();
  let backend: { ok: boolean; latencyMs: number; error?: string };

  try {
    const res = await fetch(`${BACKEND_URL}/health`, {
      method: "GET",
      cache: "no-store",
    });
    backend = {
      ok: res.ok,
      latencyMs: Date.now() - start,
      error: res.ok ? undefined : `HTTP ${res.status}`,
    };
  } catch (err) {
    backend = {
      ok: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "Connection failed",
    };
  }

  return NextResponse.json({
    status: backend.ok ? "ok" : "degraded",
    backend,
    timestamp: new Date().toISOString(),
  });
}
