/**
 * API Client for CySearch Backend
 */

// Backend API URL - set via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Fetch wrapper that handles the API base URL
 * For server-side calls, uses the full URL
 * For client-side calls, can use relative URLs if same-origin or full URL if cross-origin
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // Include cookies for auth
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.message || error.error || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * API endpoints
 */
export const api = {
  // Courses
  courses: {
    search: (params: URLSearchParams) =>
      apiFetch<{
        courses: CourseWithSections[];
        total: number;
        page: number;
        pageSize: number;
        hasMore: boolean;
      }>(`/api/courses?${params.toString()}`),

    getSubjects: () =>
      apiFetch<{ subjects: string[] }>("/api/courses/subjects"),

    getTerms: () =>
      apiFetch<{ terms: { label: string; value: string }[] }>("/api/courses/terms"),
  },

  // Auth
  auth: {
    login: (email: string, password: string) =>
      apiFetch<{ success: boolean; user: UserSession }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),

    register: (email: string, password: string, name?: string) =>
      apiFetch<{ success: boolean; user: UserSession }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
      }),

    logout: () =>
      apiFetch<{ success: boolean }>("/api/auth/logout", { method: "POST" }),

    me: () =>
      apiFetch<{ user: UserSession | null }>("/api/auth/me"),
  },

  // Schedule
  schedule: {
    get: () =>
      apiFetch<{ schedules: SavedSchedule[] }>("/api/schedule"),

    save: (schedule: { name: string; sections: ScheduleSection[] }) =>
      apiFetch<{ success: boolean; id: string }>("/api/schedule", {
        method: "POST",
        body: JSON.stringify(schedule),
      }),

    delete: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/schedule?id=${id}`, {
        method: "DELETE",
      }),
  },

  // Scraper
  scrape: {
    status: () =>
      apiFetch<{ api: string; scraper: Record<string, unknown> }>("/api/scrape"),

    trigger: (action: "load-sample" | "trigger-scraper" | "import" | "scrape-and-import") =>
      apiFetch<{ success: boolean; message: string }>("/api/scrape", {
        method: "POST",
        body: JSON.stringify({ action }),
      }),
  },
};

// Re-export types for convenience
import type {
  CourseWithSections,
  UserSession,
  ScheduleSection,
} from "@/types";

interface SavedSchedule {
  id: string;
  name: string;
  sections: ScheduleSection[];
  createdAt: string;
}
