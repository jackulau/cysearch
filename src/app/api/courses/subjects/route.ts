import { NextResponse } from "next/server";
import { getDb, initializeDatabase } from "@/db";
import { courses } from "@/db/schema";

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    initializeDatabase();
    initialized = true;
  }
}

export async function GET() {
  await ensureInitialized();

  try {
    const subjects = await getDb()
      .selectDistinct({ subject: courses.subject })
      .from(courses)
      .orderBy(courses.subject);

    return NextResponse.json({
      subjects: subjects.map((s) => s.subject),
    });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}
