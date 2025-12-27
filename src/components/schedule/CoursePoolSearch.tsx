"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CourseWithSections, PoolCourse } from "@/types";

interface CoursePoolSearchProps {
  pool: PoolCourse[];
  onAddCourse: (course: CourseWithSections) => void;
  termCode: string;
}

export function CoursePoolSearch({ pool, onAddCourse, termCode }: CoursePoolSearchProps) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CourseWithSections[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Get IDs of courses already in pool
  const poolCourseIds = new Set(pool.map((p) => p.course.id));

  // Debounced search
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("q", search);
        params.set("term", termCode);
        params.set("pageSize", "10");

        const res = await fetch(`/api/courses?${params.toString()}`);
        const data = await res.json();
        setResults(data.courses || []);
        setShowResults(true);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, termCode]);

  const handleAddCourse = useCallback(
    (course: CourseWithSections) => {
      onAddCourse(course);
      setSearch("");
      setResults([]);
      setShowResults(false);
    },
    [onAddCourse]
  );

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest(".course-search-container")) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="course-search-container relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search courses to add..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          className="pl-10 pr-10"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
        )}
        {search && !loading && (
          <button
            onClick={() => {
              setSearch("");
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {results.map((course) => {
            const isInPool = poolCourseIds.has(course.id);
            const openSections = course.sections.filter((s) => !s.isFull);

            return (
              <div
                key={course.id}
                className={`flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 ${
                  isInPool ? "bg-gray-50" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {course.subject} {course.courseNumber}
                    </span>
                    <span className="text-xs text-gray-500">
                      {course.credits || "3"} cr
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{course.title}</p>
                  <p className="text-xs text-gray-500">
                    {openSections.length}/{course.sections.length} sections available
                  </p>
                </div>

                <Button
                  size="sm"
                  variant={isInPool ? "ghost" : "outline"}
                  disabled={isInPool}
                  onClick={() => handleAddCourse(course)}
                  className="ml-2"
                >
                  {isInPool ? (
                    "Added"
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {showResults && search && results.length === 0 && !loading && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg p-4 text-center text-sm text-gray-500">
          No courses found for &quot;{search}&quot;
        </div>
      )}
    </div>
  );
}
