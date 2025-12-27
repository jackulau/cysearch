"use client";

import { Star, X, Clock, Users } from "lucide-react";
import { formatTime, formatDays } from "@/lib/utils";
import type { PoolCourse } from "@/types";

interface CoursePoolCardProps {
  poolCourse: PoolCourse;
  onToggleRequired: () => void;
  onRemove: () => void;
}

export function CoursePoolCard({
  poolCourse,
  onToggleRequired,
  onRemove,
}: CoursePoolCardProps) {
  const { course, isRequired } = poolCourse;
  const openSections = course.sections.filter((s) => !s.isFull);
  const hasOpenSections = openSections.length > 0;

  // Get unique time slots
  const timeSlots = new Set<string>();
  course.sections.forEach((s) => {
    if (s.meetingDays && s.startTime) {
      timeSlots.add(`${formatDays(s.meetingDays)} ${formatTime(s.startTime)}`);
    }
  });

  return (
    <div
      className={`relative rounded-lg border p-3 transition-all ${
        isRequired
          ? "border-amber-300 bg-amber-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      {/* Left color bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
          hasOpenSections ? "bg-green-500" : "bg-red-400"
        }`}
      />

      <div className="pl-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                {course.subject} {course.courseNumber}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                {course.credits || "3"} cr
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate mt-0.5">{course.title}</p>
          </div>

          <div className="flex items-center gap-1">
            {/* Star button */}
            <button
              onClick={onToggleRequired}
              className={`p-1.5 rounded-md transition-colors ${
                isRequired
                  ? "text-amber-500 hover:bg-amber-100"
                  : "text-gray-400 hover:text-amber-500 hover:bg-gray-100"
              }`}
              title={isRequired ? "Required (click to make optional)" : "Optional (click to make required)"}
            >
              <Star className={`h-4 w-4 ${isRequired ? "fill-current" : ""}`} />
            </button>

            {/* Remove button */}
            <button
              onClick={onRemove}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-md transition-colors"
              title="Remove from pool"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Section info */}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span className={hasOpenSections ? "text-green-600" : "text-red-500"}>
              {openSections.length}/{course.sections.length} sections open
            </span>
          </span>

          {timeSlots.size > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeSlots.size} time option{timeSlots.size > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Required badge */}
        {isRequired && (
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              <Star className="h-3 w-3 fill-current" />
              Required
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
