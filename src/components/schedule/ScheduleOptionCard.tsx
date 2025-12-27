"use client";

import { Check, Eye, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/utils";
import type { GeneratedScheduleOption } from "@/types";

interface ScheduleOptionCardProps {
  option: GeneratedScheduleOption;
  index: number;
  isPreview: boolean;
  onPreview: () => void;
  onApply: () => void;
}

export function ScheduleOptionCard({
  option,
  index,
  isPreview,
  onPreview,
  onApply,
}: ScheduleOptionCardProps) {
  const { sections, totalCredits, metadata } = option;

  // Group sections by course
  const courses = new Map<string, typeof sections>();
  for (const section of sections) {
    const key = `${section.subject} ${section.courseNumber}`;
    if (!courses.has(key)) {
      courses.set(key, []);
    }
    courses.get(key)!.push(section);
  }

  return (
    <div
      className={`rounded-lg border p-3 transition-all ${
        isPreview
          ? "border-cardinal bg-cardinal/5 ring-2 ring-cardinal/20"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">Option {index + 1}</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {totalCredits} credits
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={isPreview ? "default" : "outline"}
            onClick={onPreview}
            className="h-7 text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            {isPreview ? "Previewing" : "Preview"}
          </Button>
          <Button size="sm" onClick={onApply} className="h-7 text-xs">
            <Check className="h-3 w-3 mr-1" />
            Apply
          </Button>
        </div>
      </div>

      {/* Course list */}
      <div className="space-y-1">
        {Array.from(courses.entries()).map(([courseName, courseSections]) => (
          <div key={courseName} className="flex items-center gap-2 text-sm">
            <BookOpen className="h-3 w-3 text-gray-400 flex-shrink-0" />
            <span className="font-medium text-gray-700">{courseName}</span>
            <span className="text-gray-500">
              Sec {courseSections.map((s) => s.sectionNumber).join(", ")}
            </span>
          </div>
        ))}
      </div>

      {/* Metadata */}
      <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        {metadata.earliestStart && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Starts {formatTime(metadata.earliestStart)}
          </span>
        )}
        {metadata.latestEnd && (
          <span>Ends {formatTime(metadata.latestEnd)}</span>
        )}
        {metadata.totalGapMinutes > 0 && (
          <span>{Math.round(metadata.totalGapMinutes / 60)}h gaps</span>
        )}
      </div>
    </div>
  );
}
