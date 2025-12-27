import { NextRequest, NextResponse } from "next/server";
import { loadSampleData } from "@/scraper";
import { initializeDatabase } from "@/db";

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    initializeDatabase();
    initialized = true;
  }
}

// Load sample data
export async function POST(request: NextRequest) {
  await ensureInitialized();

  try {
    const { action } = await request.json();

    if (action === "load-sample") {
      await loadSampleData();
      return NextResponse.json({
        success: true,
        message: "Sample data loaded successfully!",
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: "Failed to load data" },
      { status: 500 }
    );
  }
}

// Get scrape status
export async function GET() {
  await ensureInitialized();

  return NextResponse.json({
    status: "ready",
    lastUpdated: new Date().toISOString(),
  });
}
