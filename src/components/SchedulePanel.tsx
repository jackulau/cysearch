"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Clock,
  MapPin,
  X,
  ChevronLeft,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { formatTime, hasTimeConflict, getScheduleColor } from "@/lib/utils";
import type { ScheduleSection } from "@/types";

interface BlockedTime {
  day: string;
  hour: number;
  minute: number; // 0, 15, 30, or 45
}

interface SchedulePanelProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleSectionIds: string[];
  onRemoveFromSchedule: (sectionId: string) => void;
  onBlockedTimesChange?: (blockedTimes: BlockedTime[]) => void;
}

const DAYS = ["M", "T", "W", "R", "F"];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const START_HOUR = 7;
const END_HOUR = 21; // 9 PM
const MINUTES = [0, 15, 30, 45];
const SLOT_HEIGHT = 12; // pixels per 15-min slot

// Generate time slots from 7am to 9pm in 15-min increments
const TIME_SLOTS: { hour: number; minute: number }[] = [];
for (let hour = START_HOUR; hour < END_HOUR; hour++) {
  for (const minute of MINUTES) {
    TIME_SLOTS.push({ hour, minute });
  }
}

export function SchedulePanel({
  isOpen,
  onClose,
  scheduleSectionIds,
  onRemoveFromSchedule,
  onBlockedTimesChange,
}: SchedulePanelProps) {
  const [sections, setSections] = useState<ScheduleSection[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"block" | "unblock">("block");

  // Load section details and blocked times from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cysearch_schedule_details");
      if (saved) {
        const data = JSON.parse(saved);
        setSections(data.sections || []);
      }

      const savedBlocked = localStorage.getItem("cysearch_blocked_times");
      if (savedBlocked) {
        setBlockedTimes(JSON.parse(savedBlocked));
      }
    } catch (error) {
      console.error("Failed to load schedule from storage:", error);
    }
  }, [scheduleSectionIds]);

  // Save blocked times to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("cysearch_blocked_times", JSON.stringify(blockedTimes));
      onBlockedTimesChange?.(blockedTimes);
    } catch (error) {
      console.error("Failed to save blocked times:", error);
    }
  }, [blockedTimes, onBlockedTimesChange]);

  const isTimeBlocked = useCallback((day: string, hour: number, minute: number) => {
    return blockedTimes.some((bt) => bt.day === day && bt.hour === hour && bt.minute === minute);
  }, [blockedTimes]);

  // Check if a time slot has a course scheduled
  const hasEventAtTime = useCallback((day: string, hour: number, minute: number) => {
    const slotTime = hour * 60 + minute;
    return sections.some((section) => {
      if (!section.meetingDays?.includes(day) || !section.startTime || !section.endTime) {
        return false;
      }
      const [startH, startM] = section.startTime.split(":").map(Number);
      const [endH, endM] = section.endTime.split(":").map(Number);
      const startTime = startH * 60 + startM;
      const endTime = endH * 60 + endM;
      return slotTime >= startTime && slotTime < endTime;
    });
  }, [sections]);

  const toggleBlockedTime = useCallback((day: string, hour: number, minute: number) => {
    // Don't allow blocking if there's a course at this time
    if (hasEventAtTime(day, hour, minute)) {
      return;
    }
    setBlockedTimes((prev) => {
      const exists = prev.some((bt) => bt.day === day && bt.hour === hour && bt.minute === minute);
      if (exists) {
        return prev.filter((bt) => !(bt.day === day && bt.hour === hour && bt.minute === minute));
      } else {
        return [...prev, { day, hour, minute }];
      }
    });
  }, [hasEventAtTime]);

  const handleMouseDown = useCallback((day: string, hour: number, minute: number) => {
    // Don't start blocking if there's a course at this time
    if (hasEventAtTime(day, hour, minute)) {
      return;
    }
    setIsDragging(true);
    const isBlocked = isTimeBlocked(day, hour, minute);
    setDragMode(isBlocked ? "unblock" : "block");
    toggleBlockedTime(day, hour, minute);
  }, [isTimeBlocked, toggleBlockedTime, hasEventAtTime]);

  const handleMouseEnter = useCallback((day: string, hour: number, minute: number) => {
    if (!isDragging) return;
    // Don't block if there's a course at this time
    if (hasEventAtTime(day, hour, minute)) {
      return;
    }
    const isBlocked = isTimeBlocked(day, hour, minute);
    if ((dragMode === "block" && !isBlocked) || (dragMode === "unblock" && isBlocked)) {
      toggleBlockedTime(day, hour, minute);
    }
  }, [isDragging, dragMode, isTimeBlocked, toggleBlockedTime, hasEventAtTime]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseUp]);

  const clearBlockedTimes = useCallback(() => {
    setBlockedTimes([]);
  }, []);

  // Check for time conflicts
  const conflicts = useMemo(() => {
    const conflictPairs: [string, string][] = [];
    for (let i = 0; i < sections.length; i++) {
      for (let j = i + 1; j < sections.length; j++) {
        if (hasTimeConflict(sections[i], sections[j])) {
          conflictPairs.push([sections[i].id, sections[j].id]);
        }
      }
    }
    return conflictPairs;
  }, [sections]);

  const hasConflicts = conflicts.length > 0;

  // Calculate total credits
  const totalCredits = sections.reduce((sum, s) => {
    const credits = parseInt(s.credits || "3");
    return sum + (isNaN(credits) ? 3 : credits);
  }, 0);

  // Build schedule grid data
  const scheduleEvents = useMemo(() => {
    return sections
      .filter((s) => s.meetingDays && s.startTime)
      .map((s, index) => ({
        ...s,
        color: getScheduleColor(index),
      }));
  }, [sections]);

  if (!isOpen) return null;

  return (
    <div
      className="h-full flex flex-col bg-white border-l border-gray-200"
      onMouseLeave={() => setIsDragging(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
        <button
          onClick={onClose}
          className="p-1 sm:p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
        </button>
        <div className="text-center">
          <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Schedule Builder</h2>
          <p className="text-[10px] sm:text-xs text-gray-600">
            {sections.length} courses &bull; {totalCredits} credits
          </p>
        </div>
        <div className="w-6 sm:w-8" /> {/* Spacer for centering */}
      </div>

      {/* Instructions */}
      <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-50 border-b border-red-100">
        <p className="text-[10px] sm:text-xs text-red-800 flex items-center gap-1">
          <Sparkles className="h-3 w-3 flex-shrink-0" />
          <span className="hidden sm:inline">Click & drag to block times you&apos;re unavailable</span>
          <span className="sm:hidden">Tap to block unavailable times</span>
        </p>
      </div>

      {/* Conflicts Warning */}
      {hasConflicts && (
        <div className="mx-3 sm:mx-4 mt-2 sm:mt-3 p-1.5 sm:p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-1.5 sm:gap-2">
          <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] sm:text-xs text-amber-800">
            {conflicts.length} time conflict(s)
          </p>
        </div>
      )}

      {/* Schedule Grid */}
      <div className="flex-1 overflow-auto p-2 sm:p-4">
        <div className="min-w-[280px] sm:min-w-[320px]">
          {/* Days Header */}
          <div className="grid grid-cols-[40px_repeat(5,1fr)] sm:grid-cols-[52px_repeat(5,1fr)] gap-0 mb-1 sticky top-0 bg-white z-20">
            <div></div>
            {DAY_LABELS.map((day, i) => (
              <div
                key={DAYS[i]}
                className="text-[9px] sm:text-[10px] font-semibold text-gray-700 text-center py-1 border-b border-gray-200"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{DAYS[i]}</span>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="relative select-none">
            {TIME_SLOTS.map(({ hour, minute }, slotIndex) => {
              const isHourStart = minute === 0;
              const isHalfHour = minute === 30;

              return (
                <div key={`${hour}-${minute}`} className="grid grid-cols-[40px_repeat(5,1fr)] sm:grid-cols-[52px_repeat(5,1fr)] gap-0">
                  {/* Time label - show for every slot */}
                  <div className={`text-[7px] sm:text-[8px] text-gray-400 text-right pr-0.5 sm:pr-1 flex items-center justify-end`}
                    style={{ height: `${SLOT_HEIGHT}px` }}
                  >
                    <span className={isHourStart ? 'text-gray-500 font-medium' : ''}>
                      <span className="hidden sm:inline">{hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}:{minute.toString().padStart(2, '0')} {hour >= 12 ? 'pm' : 'am'}</span>
                      <span className="sm:hidden">{isHourStart ? `${hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}${hour >= 12 ? 'p' : 'a'}` : ''}</span>
                    </span>
                  </div>

                  {DAYS.map((day) => {
                    const isBlocked = isTimeBlocked(day, hour, minute);

                    // Check if any event starts at this exact time slot
                    const eventsStartingHere = scheduleEvents.filter((event) => {
                      if (!event.meetingDays?.includes(day)) return false;
                      const startHour = parseInt(event.startTime?.split(":")[0] || "0");
                      const startMin = parseInt(event.startTime?.split(":")[1] || "0");
                      // Round to nearest 15-min slot
                      const roundedMin = Math.floor(startMin / 15) * 15;
                      return startHour === hour && roundedMin === minute;
                    });

                    return (
                      <div
                        key={`${day}-${hour}-${minute}`}
                        className={`relative cursor-pointer transition-colors ${
                          isBlocked
                            ? "bg-red-200"
                            : "bg-white hover:bg-gray-50"
                        } ${isHourStart ? 'border-t border-gray-200' : isHalfHour ? 'border-t border-gray-100' : ''} border-l border-gray-100`}
                        style={{ height: `${SLOT_HEIGHT}px` }}
                        onMouseDown={() => handleMouseDown(day, hour, minute)}
                        onMouseEnter={() => handleMouseEnter(day, hour, minute)}
                      >
                        {/* Course events */}
                        {eventsStartingHere.map((event) => {
                          const startHour = parseInt(event.startTime?.split(":")[0] || "0");
                          const startMin = parseInt(event.startTime?.split(":")[1] || "0");
                          const endHour = parseInt(event.endTime?.split(":")[0] || "0");
                          const endMin = parseInt(event.endTime?.split(":")[1] || "0");
                          const duration = (endHour - startHour) * 60 + (endMin - startMin);
                          const slots = Math.ceil(duration / 15);
                          const height = slots * SLOT_HEIGHT;
                          // Offset for exact minute within slot
                          const minuteOffset = startMin % 15;
                          const topOffset = (minuteOffset / 15) * SLOT_HEIGHT;

                          return (
                            <div
                              key={`${event.id}-${day}`}
                              className="absolute inset-x-0 rounded-sm z-10 overflow-hidden border-l-2"
                              style={{
                                backgroundColor: event.color + 'dd',
                                borderLeftColor: event.color,
                                height: `${height}px`,
                                top: `${topOffset}px`,
                              }}
                              title={`${event.subject} ${event.courseNumber}\n${formatTime(event.startTime)} - ${formatTime(event.endTime)}\n${event.location || "TBA"}`}
                            >
                              <div className="p-0.5">
                                <div className="text-[8px] font-bold text-white truncate leading-tight">
                                  {event.subject} {event.courseNumber}
                                </div>
                                {height > 24 && (
                                  <div className="text-[7px] text-white/90 truncate">
                                    {formatTime(event.startTime)}
                                  </div>
                                )}
                                {height > 36 && (
                                  <div className="text-[7px] text-white/80 truncate">
                                    {event.location || "TBA"}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-3 sm:px-4 py-1.5 sm:py-2 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-center gap-3 sm:gap-4 text-[9px] sm:text-[10px] text-gray-600">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-red-200 border border-red-300"></span>
            Blocked
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-blue-500"></span>
            Class
          </span>
        </div>
      </div>

      {/* Course List */}
      <div className="border-t border-gray-200 max-h-36 sm:max-h-48 overflow-y-auto">
        <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
          {sections.length === 0 ? (
            <p className="text-[10px] sm:text-xs text-gray-500 text-center py-3 sm:py-4">
              No courses added yet
            </p>
          ) : (
            sections.map((section, index) => (
              <div
                key={section.id}
                className="flex items-start gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-gray-50 rounded-lg"
                style={{
                  borderLeft: `3px solid ${getScheduleColor(index)}`,
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-900">
                      {section.subject} {section.courseNumber}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-gray-500">
                      ({section.credits || "3"} cr)
                    </span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-gray-600 truncate">
                    {section.meetingDays} {formatTime(section.startTime)}
                    {section.endTime && `-${formatTime(section.endTime)}`}
                    <span className="hidden sm:inline">{section.location && ` • ${section.location}`}</span>
                  </p>
                </div>
                <button
                  onClick={() => onRemoveFromSchedule(section.id)}
                  className="p-0.5 sm:p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  <X className="h-3 w-3 text-gray-400" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 sm:p-3 border-t border-gray-200 bg-gray-50 space-y-1.5 sm:space-y-2">
        <div className="flex justify-between text-[10px] sm:text-xs text-gray-600">
          <span>Blocked: {Math.floor(blockedTimes.length * 15 / 60)}h {(blockedTimes.length * 15) % 60}m</span>
          <span className="font-semibold text-gray-900">{totalCredits} cr</span>
        </div>
        <div className="flex gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-[10px] sm:text-xs h-7 sm:h-8"
            onClick={clearBlockedTimes}
            disabled={blockedTimes.length === 0}
          >
            <span className="hidden sm:inline">Clear Blocked</span>
            <span className="sm:hidden">Clear</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-[10px] sm:text-xs h-7 sm:h-8"
            onClick={() => {
              localStorage.removeItem("cysearch_schedule");
              localStorage.removeItem("cysearch_schedule_details");
              setSections([]);
            }}
            disabled={sections.length === 0}
          >
            <Trash2 className="h-3 w-3 mr-0.5 sm:mr-1" />
            <span className="hidden sm:inline">Clear All</span>
            <span className="sm:hidden">All</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Export blocked time type for use elsewhere
export type { BlockedTime };
