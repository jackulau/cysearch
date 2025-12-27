// Course with sections for display
export interface CourseWithSections {
  id: string;
  subject: string;
  courseNumber: string;
  title: string;
  description: string | null;
  credits: string | null;
  prerequisites: string | null;
  sections: SectionDisplay[];
}

export interface SectionDisplay {
  id: string;
  crn: string;
  sectionNumber: string;
  term: string;
  termCode: string;
  instructor: string | null;
  meetingDays: string | null;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  enrollmentMax: number;
  enrollmentCurrent: number;
  waitlistMax: number;
  waitlistCurrent: number;
  classType: string | null;
  deliveryMode: string | null;
  seatsAvailable: number;
  isFull: boolean;
  hasWaitlist: boolean;
}

// Search filters
export interface SearchFilters {
  query?: string;
  subject?: string;
  subjects?: string[];
  term?: string;
  instructor?: string;
  classType?: string;
  deliveryMode?: string;
  openOnly?: boolean;
  days?: string[];
  startTimeAfter?: string;
  startTimeBefore?: string;
  courseNumberMin?: number;
  courseNumberMax?: number;
}

// Schedule types
export interface ScheduleSection {
  id: string;
  courseId: string;
  subject: string;
  courseNumber: string;
  title: string;
  sectionNumber: string;
  crn: string;
  instructor: string | null;
  meetingDays: string | null;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  credits: string | null;
}

export interface ScheduleEvent {
  sectionId: string;
  courseId: string;
  subject: string;
  courseNumber: string;
  title: string;
  sectionNumber: string;
  instructor: string | null;
  meetingDays: string;
  startTime: string;
  endTime: string;
  location: string | null;
  color: string;
}

export interface Schedule {
  id: string;
  name: string;
  term: string;
  events: ScheduleEvent[];
  totalCredits: number;
}

// Auto-schedule generator types
export interface PoolCourse {
  course: CourseWithSections;
  isRequired: boolean; // starred = must be in all generated schedules
}

export interface GeneratedScheduleOption {
  id: string;
  sections: ScheduleSection[];
  totalCredits: number;
  score: number;
  metadata: {
    earliestStart: string | null;
    latestEnd: string | null;
    totalGapMinutes: number;
    averageSeatsAvailable: number;
  };
}

export interface BlockedTime {
  day: string;
  hour: number;
  minute: number; // 0, 15, 30, or 45
}

// API response types
export interface SearchResponse {
  courses: CourseWithSections[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  error: string;
  message: string;
}

// Scraper types
export interface ScrapedCourse {
  subject: string;
  courseNumber: string;
  title: string;
  description?: string;
  credits?: string;
  prerequisites?: string;
}

export interface ScrapedSection {
  crn: string;
  sectionNumber: string;
  subject: string;
  courseNumber: string;
  courseTitle: string;
  term: string;
  termCode: string;
  instructor?: string;
  meetingDays?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  building?: string;
  room?: string;
  enrollmentMax: number;
  enrollmentCurrent: number;
  waitlistMax: number;
  waitlistCurrent: number;
  classType?: string;
  deliveryMode?: string;
  startDate?: string;
  endDate?: string;
}

// User and auth types
export interface UserSession {
  userId: string;
  email: string;
  name: string | null;
}

export interface TrackedSection {
  trackerId: string;
  section: SectionDisplay;
  course: {
    subject: string;
    courseNumber: string;
    title: string;
  };
  createdAt: Date;
}

// Discord notification
export interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  fields: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  timestamp?: string;
  footer?: {
    text: string;
  };
}
