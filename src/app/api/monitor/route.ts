import { NextResponse } from "next/server";
import { checkSeatAvailability } from "@/lib/monitor";
import { initializeDatabase } from "@/db";

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    initializeDatabase();
    initialized = true;
  }
}

// Manual trigger for seat availability check
export async function POST() {
  await ensureInitialized();

  try {
    await checkSeatAvailability();
    return NextResponse.json({
      success: true,
      message: "Seat availability check completed",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Monitor error:", error);
    return NextResponse.json(
      { error: "Failed to check seat availability" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ready",
    message: "Seat availability monitor is ready. POST to trigger a check.",
  });
}
