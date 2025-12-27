import type {
  PoolCourse,
  GeneratedScheduleOption,
  ScheduleSection,
  BlockedTime,
  CourseWithSections,
  SectionDisplay,
} from "@/types";
import { hasTimeConflict, checkBlockedTimeConflict, parseCredits } from "./utils";
import { MAX_SCHEDULE_COMBINATIONS, DEFAULT_MAX_SCHEDULE_OPTIONS } from "./constants";

/**
 * Convert SectionDisplay to ScheduleSection
 */
function toScheduleSection(
  section: SectionDisplay,
  course: CourseWithSections
): ScheduleSection {
  return {
    id: section.id,
    courseId: course.id,
    subject: course.subject,
    courseNumber: course.courseNumber,
    title: course.title,
    sectionNumber: section.sectionNumber,
    crn: section.crn,
    instructor: section.instructor,
    meetingDays: section.meetingDays,
    startTime: section.startTime,
    endTime: section.endTime,
    location: section.location,
    credits: course.credits,
  };
}

/**
 * Check if a section conflicts with any in the existing list
 */
function hasAnyConflict(
  section: ScheduleSection,
  existing: ScheduleSection[]
): boolean {
  return existing.some((s) => hasTimeConflict(section, s));
}

/**
 * Calculate the total gap minutes between classes per day
 */
function calculateDailyGaps(sections: ScheduleSection[]): number {
  const days = ["M", "T", "W", "R", "F"];
  let totalGaps = 0;

  for (const day of days) {
    const daySections = sections
      .filter((s) => s.meetingDays?.includes(day) && s.startTime && s.endTime)
      .map((s) => ({
        start: parseInt(s.startTime!.replace(":", "")),
        end: parseInt(s.endTime!.replace(":", "")),
      }))
      .sort((a, b) => a.start - b.start);

    for (let i = 1; i < daySections.length; i++) {
      const gap = daySections[i].start - daySections[i - 1].end;
      if (gap > 0) {
        // Convert from HHMM format to minutes
        const gapHours = Math.floor(gap / 100);
        const gapMins = gap % 100;
        totalGaps += gapHours * 60 + gapMins;
      }
    }
  }

  return totalGaps;
}

/**
 * Calculate metadata for a schedule option
 */
function calculateMetadata(sections: ScheduleSection[]): GeneratedScheduleOption["metadata"] {
  const times = sections
    .filter((s) => s.startTime && s.endTime)
    .map((s) => ({
      start: s.startTime!,
      end: s.endTime!,
    }));

  const sortedStarts = times.map((t) => t.start).sort();
  const sortedEnds = times.map((t) => t.end).sort();

  // Calculate average seats available (would need enrollment data)
  // For now, return 0 as placeholder
  const averageSeatsAvailable = 0;

  return {
    earliestStart: sortedStarts[0] || null,
    latestEnd: sortedEnds[sortedEnds.length - 1] || null,
    totalGapMinutes: calculateDailyGaps(sections),
    averageSeatsAvailable,
  };
}

/**
 * Score a schedule - higher is better
 */
function scoreSchedule(sections: ScheduleSection[]): number {
  let score = 0;

  // Base score for number of courses
  score += sections.length * 100;

  // Penalty for gaps between classes
  const gapMinutes = calculateDailyGaps(sections);
  score -= gapMinutes * 0.5;

  // Bonus for compactness - fewer unique time slots is better
  const uniqueStartTimes = new Set(sections.map((s) => s.startTime).filter(Boolean));
  score += (10 - uniqueStartTimes.size) * 10;

  // Slight randomization to provide variety
  score += Math.random() * 5;

  return score;
}

/**
 * Generate valid schedule combinations using backtracking
 */
function generateCombinations(
  courses: Array<{ course: CourseWithSections; isRequired: boolean }>,
  blockedTimes: BlockedTime[],
  currentSections: ScheduleSection[],
  combinationsCount: { count: number }
): ScheduleSection[][] {
  // Early termination
  if (combinationsCount.count >= MAX_SCHEDULE_COMBINATIONS) {
    return [];
  }

  // Base case - all courses processed
  if (courses.length === 0) {
    return [currentSections];
  }

  const [{ course }, ...remaining] = courses;
  const results: ScheduleSection[][] = [];

  // Get valid sections for this course (not full, have meeting times)
  const validSections = course.sections.filter(
    (s) => !s.isFull && s.meetingDays && s.startTime
  );

  for (const section of validSections) {
    const scheduleSection = toScheduleSection(section, course);

    // Check conflicts with current sections
    if (hasAnyConflict(scheduleSection, currentSections)) continue;

    // Check blocked time conflicts
    if (checkBlockedTimeConflict(scheduleSection, blockedTimes)) continue;

    // Recurse with this section added
    combinationsCount.count++;
    const subResults = generateCombinations(
      remaining,
      blockedTimes,
      [...currentSections, scheduleSection],
      combinationsCount
    );
    results.push(...subResults);

    // Early termination check
    if (combinationsCount.count >= MAX_SCHEDULE_COMBINATIONS) break;
  }

  return results;
}

/**
 * Main function to generate schedule options
 */
export function generateSchedules(
  pool: PoolCourse[],
  blockedTimes: BlockedTime[],
  maxOptions: number = DEFAULT_MAX_SCHEDULE_OPTIONS
): GeneratedScheduleOption[] {
  // Separate required and optional courses
  const requiredCourses = pool.filter((p) => p.isRequired);
  const optionalCourses = pool.filter((p) => !p.isRequired);

  const combinationsCount = { count: 0 };
  let allSchedules: ScheduleSection[][] = [];

  if (requiredCourses.length === 0 && optionalCourses.length === 0) {
    return [];
  }

  // If there are required courses, start with those
  if (requiredCourses.length > 0) {
    // Generate all valid combinations for required courses
    const requiredCombinations = generateCombinations(
      requiredCourses,
      blockedTimes,
      [],
      combinationsCount
    );

    if (requiredCombinations.length === 0) {
      // No valid combinations for required courses
      return [];
    }

    // For each required combination, try to add optional courses
    for (const requiredSchedule of requiredCombinations) {
      if (optionalCourses.length > 0) {
        const fullSchedules = generateCombinations(
          optionalCourses,
          blockedTimes,
          requiredSchedule,
          combinationsCount
        );
        allSchedules.push(...fullSchedules);
      } else {
        allSchedules.push(requiredSchedule);
      }

      if (combinationsCount.count >= MAX_SCHEDULE_COMBINATIONS) break;
    }
  } else {
    // Only optional courses
    allSchedules = generateCombinations(
      optionalCourses,
      blockedTimes,
      [],
      combinationsCount
    );
  }

  // Score and sort results
  const scoredSchedules = allSchedules.map((sections) => ({
    sections,
    score: scoreSchedule(sections),
  }));

  scoredSchedules.sort((a, b) => b.score - a.score);

  // Create unique options (avoid near-duplicates)
  const uniqueOptions: GeneratedScheduleOption[] = [];
  const seen = new Set<string>();

  for (const { sections, score } of scoredSchedules) {
    // Create a key based on section IDs
    const key = sections
      .map((s) => s.id)
      .sort()
      .join(",");

    if (!seen.has(key)) {
      seen.add(key);

      const totalCredits = sections.reduce(
        (sum, s) => sum + parseCredits(s.credits),
        0
      );

      uniqueOptions.push({
        id: `option-${uniqueOptions.length + 1}`,
        sections,
        totalCredits,
        score,
        metadata: calculateMetadata(sections),
      });

      if (uniqueOptions.length >= maxOptions) break;
    }
  }

  return uniqueOptions;
}

/**
 * Check if a pool can generate any valid schedules
 * (useful for showing early warnings)
 */
export function canGenerateSchedules(
  pool: PoolCourse[],
  blockedTimes: BlockedTime[]
): { valid: boolean; error?: string } {
  const requiredCourses = pool.filter((p) => p.isRequired);

  // Check if each required course has at least one valid section
  for (const { course } of requiredCourses) {
    const validSections = course.sections.filter(
      (s) => !s.isFull && s.meetingDays && s.startTime
    );

    if (validSections.length === 0) {
      return {
        valid: false,
        error: `${course.subject} ${course.courseNumber} has no available sections`,
      };
    }

    // Check if all sections conflict with blocked times
    const allBlocked = validSections.every((s) =>
      checkBlockedTimeConflict(s, blockedTimes)
    );

    if (allBlocked) {
      return {
        valid: false,
        error: `All sections of ${course.subject} ${course.courseNumber} conflict with your blocked times`,
      };
    }
  }

  return { valid: true };
}
