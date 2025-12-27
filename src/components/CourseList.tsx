"use client";

import { useState, useEffect, useCallback } from "react";
import { CourseCard } from "@/components/CourseCard";
import { SearchFilters } from "@/components/SearchFilters";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, BookOpen } from "lucide-react";
import { hasTimeConflict } from "@/lib/utils";
import type { CourseWithSections, SearchFilters as Filters, SearchResponse, ScheduleSection } from "@/types";

interface CourseListProps {
  initialFilters?: Filters;
}

export function CourseList({ initialFilters = {} }: CourseListProps) {
  const [courses, setCourses] = useState<CourseWithSections[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  // Schedule state (stored in localStorage)
  const [scheduleSectionIds, setScheduleSectionIds] = useState<string[]>([]);
  const [scheduleSections, setScheduleSections] = useState<ScheduleSection[]>([]);

  useEffect(() => {
    loadScheduleFromStorage();
  }, []);

  function loadScheduleFromStorage() {
    try {
      const savedDetails = localStorage.getItem("cysearch_schedule_details");
      if (savedDetails) {
        const data = JSON.parse(savedDetails);
        const sections: ScheduleSection[] = data.sections || [];
        setScheduleSections(sections);
        setScheduleSectionIds(sections.map((s) => s.id));
      } else {
        const saved = localStorage.getItem("cysearch_schedule");
        if (saved) {
          setScheduleSectionIds(JSON.parse(saved));
        }
      }
    } catch (error) {
      console.error("Failed to load schedule from storage:", error);
    }
  }

  function saveScheduleToStorage(sections: ScheduleSection[]) {
    try {
      localStorage.setItem(
        "cysearch_schedule_details",
        JSON.stringify({ sections, name: "My Schedule" })
      );
      localStorage.setItem(
        "cysearch_schedule",
        JSON.stringify(sections.map((s) => s.id))
      );
    } catch (error) {
      console.error("Failed to save schedule to storage:", error);
    }
  }

  const fetchCourses = useCallback(async (newFilters: Filters, newPage: number, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams();
      if (newFilters.query) params.set("q", newFilters.query);
      if (newFilters.subject) params.set("subject", newFilters.subject);
      if (newFilters.term) params.set("term", newFilters.term);
      if (newFilters.instructor) params.set("instructor", newFilters.instructor);
      if (newFilters.classType) params.set("classType", newFilters.classType);
      if (newFilters.deliveryMode) params.set("deliveryMode", newFilters.deliveryMode);
      if (newFilters.openOnly) params.set("openOnly", "true");
      params.set("page", newPage.toString());
      params.set("pageSize", "20");

      const res = await fetch(`/api/courses?${params.toString()}`);
      const data: SearchResponse = await res.json();

      if (!res.ok) {
        throw new Error("Failed to fetch courses");
      }

      if (append) {
        setCourses((prev) => [...prev, ...data.courses]);
      } else {
        setCourses(data.courses);
      }

      setTotal(data.total);
      setHasMore(data.hasMore);
      setPage(newPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load courses");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses(filters, 1);
  }, [filters, fetchCourses]);

  function handleAddToSchedule(section: ScheduleSection) {
    const newSections = [...scheduleSections, section];
    setScheduleSections(newSections);
    setScheduleSectionIds(newSections.map((s) => s.id));
    saveScheduleToStorage(newSections);
  }

  function handleRemoveFromSchedule(sectionId: string) {
    const newSections = scheduleSections.filter((s) => s.id !== sectionId);
    setScheduleSections(newSections);
    setScheduleSectionIds(newSections.map((s) => s.id));
    saveScheduleToStorage(newSections);
  }

  function checkConflict(section: ScheduleSection): ScheduleSection | null {
    for (const existing of scheduleSections) {
      if (hasTimeConflict(section, existing)) {
        return existing;
      }
    }
    return null;
  }

  if (loading && courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-cardinal mb-4" />
        <p className="text-gray-600">Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-8 w-8 text-red-600 mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => fetchCourses(filters, 1)}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SearchFilters filters={filters} onFiltersChange={setFilters} />

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No courses found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search filters or search for a different term.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {courses.length} of {total.toLocaleString()} courses
            </p>
          </div>

          <div className="space-y-4">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                scheduleSectionIds={scheduleSectionIds}
                scheduleSections={scheduleSections}
                onAddToSchedule={handleAddToSchedule}
                onRemoveFromSchedule={handleRemoveFromSchedule}
                checkConflict={checkConflict}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => fetchCourses(filters, page + 1, true)}
                disabled={loadingMore}
              >
                {loadingMore && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
