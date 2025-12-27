/**
 * Application-wide constants
 */

// Authentication
export const JWT_SECRET = process.env.JWT_SECRET || "cysearch-dev-secret-change-in-production";
export const COOKIE_NAME = "cysearch_session";
export const SESSION_DURATION_DAYS = 7;
export const SESSION_MAX_AGE = 60 * 60 * 24 * SESSION_DURATION_DAYS; // 7 days in seconds
export const PASSWORD_SALT_ROUNDS = 12;

// Schedule Generator
export const MAX_SCHEDULE_COMBINATIONS = 1000;
export const DEFAULT_MAX_SCHEDULE_OPTIONS = 5;

// API
export const DEFAULT_SEARCH_LIMIT = 50;
export const MAX_SEARCH_LIMIT = 100;

// UI
export const COURSE_COLORS = [
  "bg-red-100 border-red-300 text-red-800",
  "bg-blue-100 border-blue-300 text-blue-800",
  "bg-green-100 border-green-300 text-green-800",
  "bg-yellow-100 border-yellow-300 text-yellow-800",
  "bg-purple-100 border-purple-300 text-purple-800",
  "bg-pink-100 border-pink-300 text-pink-800",
  "bg-indigo-100 border-indigo-300 text-indigo-800",
  "bg-orange-100 border-orange-300 text-orange-800",
  "bg-teal-100 border-teal-300 text-teal-800",
  "bg-cyan-100 border-cyan-300 text-cyan-800",
] as const;

export const SCHEDULE_COLORS = [
  "#ef4444", // red
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#14b8a6", // teal
  "#6366f1", // indigo
] as const;

// Time formatting
export const DAY_ABBREVIATIONS: Record<string, string> = {
  M: "Mon",
  T: "Tue",
  W: "Wed",
  R: "Thu",
  F: "Fri",
  S: "Sat",
  U: "Sun",
};

export const SEASON_CODES: Record<string, string> = {
  spring: "SP",
  summer: "SU",
  fall: "FA",
  winter: "WI",
};

// Class type abbreviations
export const CLASS_TYPE_ABBREVIATIONS: Record<string, string> = {
  Laboratory: "Lab",
  Discussion: "Dis",
  Research: "Res",
  "Independent Study": "Ind",
  Experiential: "Exp",
  Combination: "Comb",
};
