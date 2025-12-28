import { NextRequest, NextResponse } from "next/server";
import { getDb, initializeDatabase } from "@/db";
import { courses, sections } from "@/db/schema";
import { eq, like, or, and, sql, gte, lte } from "drizzle-orm";
import type { CourseWithSections, SearchFilters, SectionDisplay } from "@/types";

// Initialize database on first request
let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    initializeDatabase();
    initialized = true;
  }
}

export async function GET(request: NextRequest) {
  await ensureInitialized();

  const searchParams = request.nextUrl.searchParams;

  const subjectsParam = searchParams.get("subjects");
  const filters: SearchFilters = {
    query: searchParams.get("q") || undefined,
    subject: searchParams.get("subject") || undefined,
    subjects: subjectsParam ? subjectsParam.split(",") : undefined,
    term: searchParams.get("term") || undefined,
    instructor: searchParams.get("instructor") || undefined,
    classType: searchParams.get("classType") || undefined,
    deliveryMode: searchParams.get("deliveryMode") || undefined,
    openOnly: searchParams.get("openOnly") === "true",
    courseNumberMin: searchParams.get("courseNumberMin") ? parseInt(searchParams.get("courseNumberMin")!) : undefined,
    courseNumberMax: searchParams.get("courseNumberMax") ? parseInt(searchParams.get("courseNumberMax")!) : undefined,
  };

  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const offset = (page - 1) * pageSize;

  try {
    // Build query conditions
    const conditions = [];

    if (filters.query) {
      const query = `%${filters.query}%`;
      conditions.push(
        or(
          like(courses.subject, query),
          like(courses.courseNumber, query),
          like(courses.title, query),
          like(courses.description, query)
        )
      );
    }

    if (filters.subjects && filters.subjects.length > 0) {
      // Multiple subjects - use OR
      conditions.push(
        or(...filters.subjects.map((s) => eq(courses.subject, s)))
      );
    } else if (filters.subject) {
      conditions.push(eq(courses.subject, filters.subject));
    }

    // Course number range filter - cast to integer for comparison
    if (filters.courseNumberMin !== undefined) {
      conditions.push(sql`CAST(${courses.courseNumber} AS INTEGER) >= ${filters.courseNumberMin}`);
    }
    if (filters.courseNumberMax !== undefined) {
      conditions.push(sql`CAST(${courses.courseNumber} AS INTEGER) <= ${filters.courseNumberMax}`);
    }

    // If filtering by instructor, term, classType, or deliveryMode, we need to filter courses
    // that have matching sections BEFORE pagination
    const db = getDb();

    // Build section-level conditions for pre-filtering courses
    const sectionFilterConditions = [];
    if (filters.term) {
      sectionFilterConditions.push(sql`${sections.termCode} = ${filters.term}`);
    }
    if (filters.instructor) {
      sectionFilterConditions.push(sql`${sections.instructor} LIKE ${'%' + filters.instructor + '%'}`);
    }
    if (filters.classType) {
      sectionFilterConditions.push(sql`${sections.classType} = ${filters.classType}`);
    }
    if (filters.deliveryMode) {
      sectionFilterConditions.push(sql`${sections.deliveryMode} = ${filters.deliveryMode}`);
    }

    let allCourses;

    if (sectionFilterConditions.length > 0) {
      // Get course IDs that have matching sections first
      const sectionWhere = sectionFilterConditions.length > 1
        ? sql`${sql.join(sectionFilterConditions, sql` AND `)}`
        : sectionFilterConditions[0];

      const matchingCourseIds = await db
        .selectDistinct({ courseId: sections.courseId })
        .from(sections)
        .where(sectionWhere);

      const courseIds = matchingCourseIds.map(r => r.courseId);

      if (courseIds.length === 0) {
        // No matching sections found
        return NextResponse.json({
          courses: [],
          total: 0,
          page,
          pageSize,
          hasMore: false,
        });
      }

      // Add course ID filter to conditions
      conditions.push(sql`${courses.id} IN (${sql.join(courseIds.map(id => sql`${id}`), sql`, `)})`);

      let courseQuery = db.select().from(courses);
      if (conditions.length > 0) {
        courseQuery = courseQuery.where(and(...conditions)) as typeof courseQuery;
      }

      allCourses = await courseQuery
        .orderBy(courses.subject, courses.courseNumber)
        .limit(pageSize)
        .offset(offset);
    } else {
      // No section-level filters, use original query
      let courseQuery = db.select().from(courses);

      if (conditions.length > 0) {
        courseQuery = courseQuery.where(and(...conditions)) as typeof courseQuery;
      }

      allCourses = await courseQuery
        .orderBy(courses.subject, courses.courseNumber)
        .limit(pageSize)
        .offset(offset);
    }

    // Get sections for each course with additional filters
    const coursesWithSections: CourseWithSections[] = [];

    for (const course of allCourses) {
      const sectionConditions = [eq(sections.courseId, course.id)];

      if (filters.term) {
        sectionConditions.push(eq(sections.termCode, filters.term));
      }

      if (filters.instructor) {
        sectionConditions.push(like(sections.instructor, `%${filters.instructor}%`));
      }

      if (filters.classType) {
        sectionConditions.push(eq(sections.classType, filters.classType));
      }

      if (filters.deliveryMode) {
        sectionConditions.push(eq(sections.deliveryMode, filters.deliveryMode));
      }

      const courseSections = await db
        .select()
        .from(sections)
        .where(and(...sectionConditions))
        .orderBy(sections.sectionNumber);

      // Filter for open sections if requested
      let filteredSections = courseSections;
      if (filters.openOnly) {
        filteredSections = courseSections.filter(
          (s) => (s.enrollmentCurrent ?? 0) < (s.enrollmentMax ?? 0)
        );
      }

      if (filteredSections.length === 0 && (filters.term || filters.openOnly || filters.instructor)) {
        // Skip courses with no matching sections
        continue;
      }

      const sectionDisplays: SectionDisplay[] = filteredSections.map((s) => ({
        id: s.id,
        crn: s.crn,
        sectionNumber: s.sectionNumber,
        term: s.term,
        termCode: s.termCode,
        instructor: s.instructor,
        meetingDays: s.meetingDays,
        startTime: s.startTime,
        endTime: s.endTime,
        location: s.location,
        enrollmentMax: s.enrollmentMax ?? 0,
        enrollmentCurrent: s.enrollmentCurrent ?? 0,
        waitlistMax: s.waitlistMax ?? 0,
        waitlistCurrent: s.waitlistCurrent ?? 0,
        classType: s.classType,
        deliveryMode: s.deliveryMode,
        seatsAvailable: Math.max(0, (s.enrollmentMax ?? 0) - (s.enrollmentCurrent ?? 0)),
        isFull: (s.enrollmentCurrent ?? 0) >= (s.enrollmentMax ?? 0),
        hasWaitlist: (s.waitlistMax ?? 0) > 0,
      }));

      coursesWithSections.push({
        id: course.id,
        subject: course.subject,
        courseNumber: course.courseNumber,
        title: course.title,
        description: course.description,
        credits: course.credits,
        prerequisites: course.prerequisites,
        sections: sectionDisplays,
      });
    }

    // Get total count for pagination
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(courses);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions)) as typeof countQuery;
    }
    const [{ count: total }] = await countQuery;

    return NextResponse.json({
      courses: coursesWithSections,
      total,
      page,
      pageSize,
      hasMore: offset + coursesWithSections.length < total,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
