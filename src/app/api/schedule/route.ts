import { NextRequest, NextResponse } from "next/server";
import { getDb, initializeDatabase } from "@/db";
import { savedSchedules, sections, courses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import type { Schedule, ScheduleEvent } from "@/types";
import { getScheduleColor } from "@/lib/utils";

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    initializeDatabase();
    initialized = true;
  }
}

// Get user's saved schedules
export async function GET(request: NextRequest) {
  await ensureInitialized();

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const scheduleId = searchParams.get("id");

  try {
    const db = getDb();

    if (scheduleId) {
      // Get specific schedule
      const [schedule] = await db
        .select()
        .from(savedSchedules)
        .where(
          and(
            eq(savedSchedules.id, scheduleId),
            eq(savedSchedules.userId, session.userId)
          )
        )
        .limit(1);

      if (!schedule) {
        return NextResponse.json(
          { error: "Schedule not found" },
          { status: 404 }
        );
      }

      const sectionIds = JSON.parse(schedule.sectionIds) as string[];
      const events = await buildScheduleEvents(sectionIds);

      return NextResponse.json({
        schedule: {
          id: schedule.id,
          name: schedule.name,
          term: schedule.term,
          events,
          totalCredits: calculateTotalCredits(events),
        },
      });
    } else {
      // Get all schedules
      const userSchedules = await db
        .select()
        .from(savedSchedules)
        .where(eq(savedSchedules.userId, session.userId))
        .orderBy(savedSchedules.updatedAt);

      const schedules: Schedule[] = [];

      for (const schedule of userSchedules) {
        const sectionIds = JSON.parse(schedule.sectionIds) as string[];
        const events = await buildScheduleEvents(sectionIds);

        schedules.push({
          id: schedule.id,
          name: schedule.name,
          term: schedule.term,
          events,
          totalCredits: calculateTotalCredits(events),
        });
      }

      return NextResponse.json({ schedules });
    }
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

// Create a new schedule
export async function POST(request: NextRequest) {
  await ensureInitialized();

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const { name, term, sectionIds } = await request.json();

    if (!name || !term) {
      return NextResponse.json(
        { error: "Name and term are required" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    await db.insert(savedSchedules).values({
      id,
      userId: session.userId,
      name,
      term,
      sectionIds: JSON.stringify(sectionIds || []),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      scheduleId: id,
    });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    );
  }
}

// Update a schedule
export async function PUT(request: NextRequest) {
  await ensureInitialized();

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const { id, name, sectionIds } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Schedule ID is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name;
    if (sectionIds) updateData.sectionIds = JSON.stringify(sectionIds);

    await db
      .update(savedSchedules)
      .set(updateData)
      .where(
        and(eq(savedSchedules.id, id), eq(savedSchedules.userId, session.userId))
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}

// Delete a schedule
export async function DELETE(request: NextRequest) {
  await ensureInitialized();

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Schedule ID is required" },
        { status: 400 }
      );
    }

    await db
      .delete(savedSchedules)
      .where(
        and(eq(savedSchedules.id, id), eq(savedSchedules.userId, session.userId))
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { error: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}

async function buildScheduleEvents(sectionIds: string[]): Promise<ScheduleEvent[]> {
  const db = getDb();
  const events: ScheduleEvent[] = [];
  let colorIndex = 0;

  for (const sectionId of sectionIds) {
    const [result] = await db
      .select({
        section: sections,
        course: courses,
      })
      .from(sections)
      .innerJoin(courses, eq(sections.courseId, courses.id))
      .where(eq(sections.id, sectionId))
      .limit(1);

    if (result && result.section.meetingDays && result.section.startTime) {
      events.push({
        sectionId: result.section.id,
        courseId: result.course.id,
        subject: result.course.subject,
        courseNumber: result.course.courseNumber,
        title: result.course.title,
        sectionNumber: result.section.sectionNumber,
        instructor: result.section.instructor,
        meetingDays: result.section.meetingDays,
        startTime: result.section.startTime,
        endTime: result.section.endTime || result.section.startTime,
        location: result.section.location,
        color: getScheduleColor(colorIndex++),
      });
    }
  }

  return events;
}

function calculateTotalCredits(events: ScheduleEvent[]): number {
  // This is a simplified calculation
  // In reality, we'd need to look up credits from the courses table
  return events.length * 3;
}
