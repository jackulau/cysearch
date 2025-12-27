"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, User, Plus, Check, AlertTriangle } from "lucide-react";
import { formatTime, formatDays, stripHtml, checkBlockedTimeConflict } from "@/lib/utils";
import { CLASS_TYPE_ABBREVIATIONS } from "@/lib/constants";
import type { CourseWithSections, SectionDisplay, ScheduleSection, BlockedTime } from "@/types";

interface CourseCardProps {
  course: CourseWithSections;
  scheduleSectionIds: string[];
  scheduleSections: ScheduleSection[];
  blockedTimes?: BlockedTime[];
  onAddToSchedule: (section: ScheduleSection) => void;
  onRemoveFromSchedule: (sectionId: string) => void;
  checkConflict?: (section: ScheduleSection) => ScheduleSection | null;
}

export function CourseCard({
  course,
  scheduleSectionIds,
  scheduleSections,
  blockedTimes = [],
  onAddToSchedule,
  onRemoveFromSchedule,
  checkConflict,
}: CourseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showFullSections, setShowFullSections] = useState(false);

  const openSections = course.sections.filter((s) => !s.isFull);
  const fullSections = course.sections.filter((s) => s.isFull);
  const totalSections = course.sections.length;
  const openCount = openSections.length;
  const hasOpenSections = openCount > 0;

  const visibleSections = showFullSections ? course.sections : openSections;

  // Get unique attributes from sections
  const attributes = new Set<string>();
  course.sections.forEach((s) => {
    if (s.classType && s.classType !== "Lecture") {
      attributes.add(CLASS_TYPE_ABBREVIATIONS[s.classType] || s.classType.slice(0, 3));
    }
    if (s.deliveryMode && s.deliveryMode !== "In-Person") {
      attributes.add(s.deliveryMode);
    }
  });

  return (
    <div className="relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Left color bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          hasOpenSections ? "bg-green-500" : "bg-red-400"
        }`}
      />

      {/* Compact Header - Always Visible */}
      <div
        className="pl-5 pr-4 py-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Row 1: Course code + Credits */}
        <div className="flex items-baseline justify-between">
          <span className="font-bold text-gray-900 text-lg">
            {course.subject} {course.courseNumber}
          </span>
          <span className="text-gray-500 text-sm">
            {course.credits || "3"} credit{(course.credits || "3") !== "1" ? "s" : ""}
          </span>
        </div>

        {/* Row 2: Title */}
        <p className="text-gray-500 text-sm truncate mt-0.5">
          {course.title}
        </p>

        {/* Row 3: Availability + Badges */}
        <div className="flex items-center justify-between mt-1.5">
          <span
            className={`text-sm font-medium ${
              hasOpenSections ? "text-green-600" : "text-red-500"
            }`}
          >
            {openCount}/{totalSections} section{totalSections !== 1 ? "s" : ""} available
          </span>

          {attributes.size > 0 && (
            <div className="flex gap-1">
              {Array.from(attributes).slice(0, 3).map((attr) => (
                <span
                  key={attr}
                  className="px-1.5 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded border border-gray-200"
                >
                  {attr}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-100 pl-5 pr-4 py-3 bg-gray-50/50">
          {/* Description */}
          {course.description && (
            <p className="text-sm text-gray-600 mb-3">{stripHtml(course.description)}</p>
          )}

          {/* Prerequisites */}
          {course.prerequisites && (
            <div className="mb-3 px-2 py-1.5 bg-amber-50 border border-amber-100 rounded text-xs text-amber-800">
              <strong>Prerequisites:</strong> {stripHtml(course.prerequisites)}
            </div>
          )}

          {/* Sections */}
          <div className="space-y-2">
            {visibleSections.map((section) => {
              const scheduleSection: ScheduleSection = {
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
              const conflictWith = checkConflict?.(scheduleSection);
              const hasBlockedConflict = checkBlockedTimeConflict(section, blockedTimes);

              return (
                <SectionRow
                  key={section.id}
                  section={section}
                  isInSchedule={scheduleSectionIds.includes(section.id)}
                  conflictWith={conflictWith}
                  hasBlockedConflict={hasBlockedConflict}
                  onAdd={() => onAddToSchedule(scheduleSection)}
                  onRemove={() => onRemoveFromSchedule(section.id)}
                />
              );
            })}
          </div>

          {/* Show Full Sections Toggle */}
          {fullSections.length > 0 && (
            <button
              className="w-full mt-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowFullSections(!showFullSections);
              }}
            >
              {showFullSections
                ? `Hide ${fullSections.length} full section${fullSections.length > 1 ? "s" : ""}`
                : `Show ${fullSections.length} full section${fullSections.length > 1 ? "s" : ""}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface SectionRowProps {
  section: SectionDisplay;
  isInSchedule: boolean;
  conflictWith?: ScheduleSection | null;
  hasBlockedConflict?: boolean;
  onAdd: () => void;
  onRemove: () => void;
}

function SectionRow({ section, isInSchedule, conflictWith, hasBlockedConflict = false, onAdd, onRemove }: SectionRowProps) {
  const seatsAvailable = section.enrollmentMax - section.enrollmentCurrent;
  const hasCourseConflict = !!conflictWith && !isInSchedule;
  const hasConflict = hasCourseConflict || (hasBlockedConflict && !isInSchedule);

  return (
    <div
      className={`flex items-center gap-3 p-2.5 rounded-lg border ${
        section.isFull
          ? "bg-gray-100 border-gray-200 opacity-60"
          : hasConflict
          ? "bg-amber-50 border-amber-200"
          : "bg-white border-gray-200"
      }`}
    >
      {/* Section Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900 text-sm">
            Section {section.sectionNumber}
          </span>
          <span className="text-xs text-gray-500">CRN: {section.crn}</span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${
              section.isFull
                ? "bg-red-100 text-red-700"
                : seatsAvailable <= 5
                ? "bg-amber-100 text-amber-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {section.isFull ? "Full" : `${seatsAvailable} seats`}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-600">
          {section.meetingDays && section.startTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDays(section.meetingDays)} {formatTime(section.startTime)}
              {section.endTime && `-${formatTime(section.endTime)}`}
            </span>
          )}
          {section.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {section.location}
            </span>
          )}
          {section.instructor && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {section.instructor}
            </span>
          )}
        </div>

        {/* Conflict Warning */}
        {hasCourseConflict && conflictWith && (
          <div className="flex items-center gap-1 mt-1.5 text-xs text-amber-700">
            <AlertTriangle className="h-3 w-3" />
            <span>
              Conflicts with {conflictWith.subject} {conflictWith.courseNumber}
            </span>
          </div>
        )}
        {hasBlockedConflict && !isInSchedule && !hasCourseConflict && (
          <div className="flex items-center gap-1 mt-1.5 text-xs text-amber-700">
            <AlertTriangle className="h-3 w-3" />
            <span>Conflicts with blocked time</span>
          </div>
        )}
      </div>

      {/* Add/Remove Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          isInSchedule ? onRemove() : onAdd();
        }}
        disabled={(section.isFull && !isInSchedule) || hasConflict}
        className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
          isInSchedule
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : hasConflict
            ? "bg-amber-100 text-amber-500 cursor-not-allowed"
            : section.isFull
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gray-100 text-gray-600 hover:bg-cardinal hover:text-white"
        }`}
        title={
          isInSchedule
            ? "Remove from schedule"
            : hasCourseConflict
            ? `Conflicts with ${conflictWith?.subject} ${conflictWith?.courseNumber}`
            : hasBlockedConflict
            ? "Conflicts with blocked time"
            : "Add to schedule"
        }
      >
        {isInSchedule ? (
          <Check className="h-4 w-4" />
        ) : hasConflict ? (
          <AlertTriangle className="h-4 w-4" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
