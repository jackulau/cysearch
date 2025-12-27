import { NextRequest, NextResponse } from "next/server";
import { getDb, initializeDatabase } from "@/db";
import { trackers, sections, courses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import type { TrackedSection } from "@/types";

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    initializeDatabase();
    initialized = true;
  }
}

// Get user's tracked sections
export async function GET() {
  await ensureInitialized();

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const userTrackers = await db
      .select({
        tracker: trackers,
        section: sections,
        course: courses,
      })
      .from(trackers)
      .innerJoin(sections, eq(trackers.sectionId, sections.id))
      .innerJoin(courses, eq(sections.courseId, courses.id))
      .where(and(eq(trackers.userId, session.userId), eq(trackers.isActive, true)));

    const tracked: TrackedSection[] = userTrackers.map((t) => ({
      trackerId: t.tracker.id,
      section: {
        id: t.section.id,
        crn: t.section.crn,
        sectionNumber: t.section.sectionNumber,
        term: t.section.term,
        termCode: t.section.termCode,
        instructor: t.section.instructor,
        meetingDays: t.section.meetingDays,
        startTime: t.section.startTime,
        endTime: t.section.endTime,
        location: t.section.location,
        enrollmentMax: t.section.enrollmentMax ?? 0,
        enrollmentCurrent: t.section.enrollmentCurrent ?? 0,
        waitlistMax: t.section.waitlistMax ?? 0,
        waitlistCurrent: t.section.waitlistCurrent ?? 0,
        classType: t.section.classType,
        deliveryMode: t.section.deliveryMode,
        seatsAvailable: Math.max(0, (t.section.enrollmentMax ?? 0) - (t.section.enrollmentCurrent ?? 0)),
        isFull: (t.section.enrollmentCurrent ?? 0) >= (t.section.enrollmentMax ?? 0),
        hasWaitlist: (t.section.waitlistMax ?? 0) > 0,
      },
      course: {
        subject: t.course.subject,
        courseNumber: t.course.courseNumber,
        title: t.course.title,
      },
      createdAt: t.tracker.createdAt ?? new Date(),
    }));

    return NextResponse.json({ tracked });
  } catch (error) {
    console.error("Error fetching tracked sections:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracked sections" },
      { status: 500 }
    );
  }
}

// Track a section
export async function POST(request: NextRequest) {
  await ensureInitialized();

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const { sectionId } = await request.json();

    if (!sectionId) {
      return NextResponse.json(
        { error: "Section ID is required" },
        { status: 400 }
      );
    }

    // Check if section exists
    const [section] = await db
      .select()
      .from(sections)
      .where(eq(sections.id, sectionId))
      .limit(1);

    if (!section) {
      return NextResponse.json(
        { error: "Section not found" },
        { status: 404 }
      );
    }

    // Check if already tracking
    const [existing] = await db
      .select()
      .from(trackers)
      .where(
        and(
          eq(trackers.userId, session.userId),
          eq(trackers.sectionId, sectionId),
          eq(trackers.isActive, true)
        )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "Already tracking this section" },
        { status: 400 }
      );
    }

    // Create tracker
    const id = crypto.randomUUID();
    await db.insert(trackers).values({
      id,
      userId: session.userId,
      sectionId,
      createdAt: new Date(),
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      trackerId: id,
    });
  } catch (error) {
    console.error("Error tracking section:", error);
    return NextResponse.json(
      { error: "Failed to track section" },
      { status: 500 }
    );
  }
}

// Untrack a section
export async function DELETE(request: NextRequest) {
  await ensureInitialized();

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const { sectionId, trackerId } = await request.json();

    if (!sectionId && !trackerId) {
      return NextResponse.json(
        { error: "Section ID or Tracker ID is required" },
        { status: 400 }
      );
    }

    if (trackerId) {
      await db
        .update(trackers)
        .set({ isActive: false })
        .where(
          and(eq(trackers.id, trackerId), eq(trackers.userId, session.userId))
        );
    } else {
      await db
        .update(trackers)
        .set({ isActive: false })
        .where(
          and(
            eq(trackers.userId, session.userId),
            eq(trackers.sectionId, sectionId)
          )
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error untracking section:", error);
    return NextResponse.json(
      { error: "Failed to untrack section" },
      { status: 500 }
    );
  }
}
