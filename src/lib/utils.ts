import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  COURSE_COLORS,
  SCHEDULE_COLORS,
  DAY_ABBREVIATIONS,
  SEASON_CODES,
} from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format time from "1300" to "1:00 PM"
export function formatTime(time: string | null): string {
  if (!time) return "TBA";

  // Handle various time formats
  let hours: number;
  let minutes: number;

  if (time.includes(":")) {
    const [h, m] = time.split(":");
    hours = parseInt(h);
    minutes = parseInt(m);
  } else if (time.length === 4) {
    hours = parseInt(time.slice(0, 2));
    minutes = parseInt(time.slice(2));
  } else {
    return time;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

// Format days from "MWF" to "Mon, Wed, Fri"
export function formatDays(days: string | null): string {
  if (!days) return "TBA";

  return days
    .split("")
    .map((d) => DAY_ABBREVIATIONS[d] || d)
    .join(", ");
}

// Get color for course card based on subject
export function getCourseColor(subject: string): string {
  // Generate consistent color based on subject hash
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  }

  return COURSE_COLORS[Math.abs(hash) % COURSE_COLORS.length];
}

// Get schedule color for calendar
export function getScheduleColor(index: number): string {
  return SCHEDULE_COLORS[index % SCHEDULE_COLORS.length];
}

// Parse credits string to number
export function parseCredits(credits: string | null): number {
  if (!credits) return 0;

  // Handle ranges like "3-4" by taking the first number
  const match = credits.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

// Check if sections have time conflict
export function hasTimeConflict(
  section1: { meetingDays: string | null; startTime: string | null; endTime: string | null },
  section2: { meetingDays: string | null; startTime: string | null; endTime: string | null }
): boolean {
  if (!section1.meetingDays || !section2.meetingDays) return false;
  if (!section1.startTime || !section1.endTime) return false;
  if (!section2.startTime || !section2.endTime) return false;

  // Check if days overlap
  const days1 = new Set(section1.meetingDays.split(""));
  const days2 = new Set(section2.meetingDays.split(""));
  const commonDays = [...days1].filter((d) => days2.has(d));

  if (commonDays.length === 0) return false;

  // Check if times overlap
  const start1 = parseInt(section1.startTime.replace(":", ""));
  const end1 = parseInt(section1.endTime.replace(":", ""));
  const start2 = parseInt(section2.startTime.replace(":", ""));
  const end2 = parseInt(section2.endTime.replace(":", ""));

  return start1 < end2 && start2 < end1;
}

// Check if section conflicts with any in the list
export function hasAnyConflict(
  section: { meetingDays: string | null; startTime: string | null; endTime: string | null },
  existingSections: Array<{ meetingDays: string | null; startTime: string | null; endTime: string | null }>
): boolean {
  return existingSections.some((s) => hasTimeConflict(section, s));
}

// Check if a section conflicts with blocked times
export function checkBlockedTimeConflict(
  section: { meetingDays: string | null; startTime: string | null; endTime: string | null },
  blockedTimes: Array<{ day: string; hour: number; minute: number }>
): boolean {
  if (!section.meetingDays || !section.startTime || !section.endTime || blockedTimes.length === 0) {
    return false;
  }

  const [startH, startM] = section.startTime.split(":").map(Number);
  const [endH, endM] = section.endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  // Check each blocked time slot
  for (const blocked of blockedTimes) {
    // Check if the day matches
    if (!section.meetingDays.includes(blocked.day)) continue;

    const blockedMinutes = blocked.hour * 60 + blocked.minute;
    // Check if blocked time falls within the section's time range
    if (blockedMinutes >= startMinutes && blockedMinutes < endMinutes) {
      return true;
    }
  }
  return false;
}

// Generate term code from term string
export function generateTermCode(term: string): string {
  const match = term.match(/(Spring|Summer|Fall|Winter)\s*(\d{4})/i);
  if (!match) return term;

  const [, season, year] = match;
  return `${year}${SEASON_CODES[season.toLowerCase()] || ""}`;
}

// Get current term
export function getCurrentTerm(): { term: string; termCode: string } {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  if (month >= 0 && month <= 4) {
    return { term: `Spring ${year}`, termCode: `${year}SP` };
  } else if (month >= 5 && month <= 7) {
    return { term: `Summer ${year}`, termCode: `${year}SU` };
  } else {
    return { term: `Fall ${year}`, termCode: `${year}FA` };
  }
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Strip HTML tags from text
export function stripHtml(html: string | null): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
    .replace(/&amp;/g, "&") // Replace &amp; with &
    .replace(/&lt;/g, "<") // Replace &lt; with <
    .replace(/&gt;/g, ">") // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim();
}
