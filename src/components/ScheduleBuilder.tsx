"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Trash2,
  Save,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  Calendar,
  Sparkles,
} from "lucide-react";
import { formatTime, hasTimeConflict, getScheduleColor } from "@/lib/utils";
import { AutoScheduleGenerator } from "@/components/schedule/AutoScheduleGenerator";
import { api } from "@/lib/api";
import type { ScheduleSection, BlockedTime } from "@/types";

export function ScheduleBuilder() {
  const [sections, setSections] = useState<ScheduleSection[]>([]);
  const [previewSections, setPreviewSections] = useState<ScheduleSection[] | null>(null);
  const [terms, setTerms] = useState<{ label: string; value: string }[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [scheduleName, setScheduleName] = useState("My Schedule");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [activeTab, setActiveTab] = useState("schedule");

  useEffect(() => {
    let mounted = true;

    async function fetchTerms() {
      try {
        const data = await api.courses.getTerms();
        if (mounted) {
          setTerms(data.terms || []);
          if (data.terms?.length > 0) {
            setSelectedTerm(data.terms[0].value);
          }
        }
      } catch (error) {
        console.error("Failed to fetch terms:", error);
      }
    }

    function loadFromStorage() {
      try {
        const saved = localStorage.getItem("cysearch_schedule_details");
        if (saved) {
          const data = JSON.parse(saved);
          if (mounted) {
            setSections(data.sections || []);
            setScheduleName(data.name || "My Schedule");
          }
        }

        // Load blocked times
        const savedBlocked = localStorage.getItem("cysearch_blocked_times");
        if (savedBlocked && mounted) {
          setBlockedTimes(JSON.parse(savedBlocked));
        }
      } catch (error) {
        console.error("Failed to load schedule from storage:", error);
      }
    }

    loadFromStorage();
    fetchTerms();

    return () => {
      mounted = false;
    };
  }, []);

  function saveToStorage() {
    try {
      localStorage.setItem(
        "cysearch_schedule_details",
        JSON.stringify({ sections, name: scheduleName })
      );
      localStorage.setItem(
        "cysearch_schedule",
        JSON.stringify(sections.map((s) => s.id))
      );
    } catch (error) {
      console.error("Failed to save schedule to storage:", error);
    }
  }

  function removeSection(sectionId: string) {
    const newSections = sections.filter((s) => s.id !== sectionId);
    setSections(newSections);
    localStorage.setItem(
      "cysearch_schedule_details",
      JSON.stringify({ sections: newSections, name: scheduleName })
    );
    localStorage.setItem(
      "cysearch_schedule",
      JSON.stringify(newSections.map((s) => s.id))
    );
  }

  function clearSchedule() {
    setSections([]);
    localStorage.removeItem("cysearch_schedule");
    localStorage.removeItem("cysearch_schedule_details");
  }

  function saveSchedule() {
    saveToStorage();
    setShowSaveDialog(false);
  }

  // Handle preview from auto generator
  const handlePreviewSchedule = useCallback((previewSecs: ScheduleSection[]) => {
    setPreviewSections(previewSecs);
  }, []);

  // Handle apply from auto generator
  const handleApplySchedule = useCallback((newSections: ScheduleSection[]) => {
    setSections(newSections);
    setPreviewSections(null);
    setScheduleName(`Auto-generated ${new Date().toLocaleDateString()}`);

    // Save to storage
    localStorage.setItem(
      "cysearch_schedule_details",
      JSON.stringify({ sections: newSections, name: `Auto-generated ${new Date().toLocaleDateString()}` })
    );
    localStorage.setItem(
      "cysearch_schedule",
      JSON.stringify(newSections.map((s) => s.id))
    );

    // Switch to schedule tab
    setActiveTab("schedule");
  }, []);

  // Clear preview when switching tabs
  useEffect(() => {
    if (activeTab === "schedule") {
      queueMicrotask(() => setPreviewSections(null));
    }
  }, [activeTab]);

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

  // Determine which sections to display (preview or actual)
  const displaySections = previewSections || sections;

  // Build schedule grid data
  const scheduleEvents = useMemo(() => {
    return displaySections
      .filter((s) => s.meetingDays && s.startTime)
      .map((s, index) => ({
        ...s,
        color: getScheduleColor(index),
      }));
  }, [displaySections]);

  const days = ["M", "T", "W", "R", "F"];
  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{scheduleName}</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {sections.length} courses • {totalCredits} credits
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select term" />
            </SelectTrigger>
            <SelectContent>
              {terms.map((term) => (
                <SelectItem key={term.value} value={term.value}>
                  {term.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => setShowSaveDialog(true)} className="flex-1 sm:flex-none">
              <Save className="h-4 w-4 mr-1" />
              <span className="hidden xs:inline">Save</span>
            </Button>
            <Button variant="outline" onClick={clearSchedule} className="flex-1 sm:flex-none">
              <Trash2 className="h-4 w-4 mr-1" />
              <span className="hidden xs:inline">Clear</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Conflicts Warning */}
      {hasConflicts && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Schedule Conflicts</p>
            <p className="text-sm text-amber-700">
              You have {conflicts.length} time conflict(s) in your schedule.
              Please review and adjust.
            </p>
          </div>
        </div>
      )}

      {/* Preview indicator */}
      {previewSections && (
        <div className="p-3 bg-cardinal/10 border border-cardinal/30 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cardinal" />
            <span className="text-sm font-medium text-cardinal">
              Previewing generated schedule
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPreviewSections(null)}
          >
            Clear Preview
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Schedule Grid */}
        <div className="lg:col-span-2 xl:col-span-3 order-2 lg:order-1">
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <div className="min-w-[500px] sm:min-w-[600px] md:min-w-[700px]">
                  {/* Days Header */}
                  <div className="grid grid-cols-6 border-b bg-gray-50">
                    <div className="p-2 sm:p-4 text-center font-semibold text-gray-500 text-xs sm:text-sm">
                      Time
                    </div>
                    {days.map((day) => (
                      <div
                        key={day}
                        className="p-2 sm:p-4 text-center font-semibold text-gray-900 text-xs sm:text-sm"
                      >
                        <span className="hidden sm:inline">
                          {day === "M"
                            ? "Mon"
                            : day === "T"
                            ? "Tue"
                            : day === "W"
                            ? "Wed"
                            : day === "R"
                            ? "Thu"
                            : "Fri"}
                        </span>
                        <span className="sm:hidden">{day}</span>
                      </div>
                    ))}
                  </div>

                  {/* Time Grid */}
                  <div className="relative">
                    {hours.map((hour) => (
                      <div key={hour} className="grid grid-cols-6 border-b">
                        <div className="px-1 sm:px-3 text-[10px] sm:text-sm text-gray-500 flex items-center justify-end">
                          {hour > 12 ? hour - 12 : hour}<span className="hidden sm:inline">:00</span> {hour >= 12 ? "PM" : "AM"}
                        </div>
                        {days.map((day) => (
                          <div
                            key={`${day}-${hour}`}
                            className="h-12 border-l relative"
                          >
                            {scheduleEvents
                              .filter((event) => {
                                if (!event.meetingDays?.includes(day)) return false;
                                const startHour = parseInt(
                                  event.startTime?.split(":")[0] || "0"
                                );
                                return startHour === hour;
                              })
                              .map((event) => {
                                const startHour = parseInt(
                                  event.startTime?.split(":")[0] || "0"
                                );
                                const startMin = parseInt(
                                  event.startTime?.split(":")[1] || "0"
                                );
                                const endHour = parseInt(
                                  event.endTime?.split(":")[0] || "0"
                                );
                                const endMin = parseInt(
                                  event.endTime?.split(":")[1] || "0"
                                );
                                const duration =
                                  (endHour - startHour) * 60 +
                                  (endMin - startMin);
                                // Calculate height based on duration
                                // Grid row is h-12 (48px) consistently
                                const height = (duration / 60) * 48;
                                const topOffset = (startMin / 60) * 48;

                                return (
                                  <div
                                    key={`${event.id}-${day}`}
                                    className="absolute inset-x-0.5 sm:inset-x-1 rounded text-[10px] sm:text-sm p-1 sm:p-2 overflow-hidden z-10"
                                    style={{
                                      backgroundColor: event.color + "20",
                                      borderLeft: `2px solid ${event.color}`,
                                      height: `${height}px`,
                                      top: `${topOffset}px`,
                                    }}
                                  >
                                    <div
                                      className="font-medium truncate leading-tight"
                                      style={{ color: event.color }}
                                    >
                                      {event.subject} {event.courseNumber}
                                    </div>
                                    <div className="text-gray-600 truncate text-[9px] sm:text-xs hidden sm:block">
                                      {event.location || "TBA"}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {displaySections.length === 0 && (
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <p className="text-sm sm:text-base">Your schedule is empty.</p>
                  <p className="text-xs sm:text-sm">
                    Add courses from the catalog or use the Auto Generator.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar with Tabs */}
        <div className="space-y-3 sm:space-y-4 order-1 lg:order-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="schedule" className="flex items-center gap-1 text-xs sm:text-sm">
                <Calendar className="h-3 w-3" />
                <span className="hidden xs:inline">My</span> Schedule
              </TabsTrigger>
              <TabsTrigger value="auto" className="flex items-center gap-1 text-xs sm:text-sm">
                <Sparkles className="h-3 w-3" />
                Auto
              </TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
              <Card>
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-sm sm:text-base">Selected Courses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-6 pt-0 sm:pt-0">
                  {sections.length === 0 ? (
                    <p className="text-gray-500 text-xs sm:text-sm">No courses added yet.</p>
                  ) : (
                    <div className="max-h-[300px] lg:max-h-none overflow-y-auto space-y-2 sm:space-y-3">
                      {sections.map((section, index) => (
                        <div
                          key={section.id}
                          className="p-2 sm:p-3 border rounded-lg space-y-1.5 sm:space-y-2"
                          style={{
                            borderLeftColor: getScheduleColor(index),
                            borderLeftWidth: "4px",
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <Badge variant="cardinal" className="text-[10px] sm:text-xs">
                                {section.subject} {section.courseNumber}
                              </Badge>
                              <p className="font-medium text-xs sm:text-sm mt-1 truncate">
                                {section.title}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                              onClick={() => removeSection(section.id)}
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                            </Button>
                          </div>

                          <div className="text-[10px] sm:text-xs text-gray-600 space-y-0.5 sm:space-y-1">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">
                                {section.meetingDays} {formatTime(section.startTime)}
                                {section.endTime && ` - ${formatTime(section.endTime)}`}
                              </span>
                            </div>
                            {section.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{section.location}</span>
                              </div>
                            )}
                            {section.instructor && (
                              <div className="flex items-center gap-1 hidden sm:flex">
                                <User className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{section.instructor}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[10px] sm:text-xs">
                            <span className="text-gray-500">
                              CRN: {section.crn}
                            </span>
                            <span className="text-gray-500">
                              {section.credits || "3"} cr
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardContent className="p-3 sm:p-6 sm:pt-6">
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Credits:</span>
                      <span className="font-medium">{totalCredits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Courses:</span>
                      <span className="font-medium">{sections.length}</span>
                    </div>
                    {hasConflicts && (
                      <div className="flex justify-between text-amber-600">
                        <span>Conflicts:</span>
                        <span className="font-medium">{conflicts.length}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="auto" className="mt-3 sm:mt-4">
              <Card>
                <CardContent className="p-3 sm:p-6 sm:pt-6">
                  <AutoScheduleGenerator
                    blockedTimes={blockedTimes}
                    termCode={selectedTerm}
                    onPreviewSchedule={handlePreviewSchedule}
                    onApplySchedule={handleApplySchedule}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900">
                Schedule Name
              </label>
              <Input
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
                placeholder="My Schedule"
                className="mt-1"
              />
            </div>
            <p className="text-sm text-gray-600">
              Your schedule will be saved locally in your browser.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveSchedule}>Save Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
