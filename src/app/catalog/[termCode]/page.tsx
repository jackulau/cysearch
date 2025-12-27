"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Drawer } from "vaul";
import { CatalogSidebar } from "@/components/CatalogSidebar";
import { CourseCard } from "@/components/CourseCard";
import { SchedulePanel, type BlockedTime } from "@/components/SchedulePanel";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Menu,
  X,
  Calendar,
  Loader2,
  AlertCircle,
  BookOpen,
  Home,
  PanelRightClose,
  PanelRight,
} from "lucide-react";
import { hasTimeConflict } from "@/lib/utils";
import { api } from "@/lib/api";
import type { CourseWithSections, SearchFilters, ScheduleSection } from "@/types";

function CatalogContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const termCode = params.termCode as string;

  // State
  const [courses, setCourses] = useState<CourseWithSections[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [scheduleSectionIds, setScheduleSectionIds] = useState<string[]>([]);
  const [scheduleSections, setScheduleSections] = useState<ScheduleSection[]>([]);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Parse initial filters from URL
  const [filters, setFilters] = useState<SearchFilters>(() => {
    const subjectsParam = searchParams.get("subjects");
    return {
      query: searchParams.get("q") || undefined,
      subject: searchParams.get("subject") || undefined,
      subjects: subjectsParam ? subjectsParam.split(",") : undefined,
      classType: searchParams.get("classType") || undefined,
      deliveryMode: searchParams.get("deliveryMode") || undefined,
      openOnly: searchParams.get("openOnly") === "true",
      courseNumberMin: searchParams.get("courseNumberMin") ? parseInt(searchParams.get("courseNumberMin")!) : undefined,
      courseNumberMax: searchParams.get("courseNumberMax") ? parseInt(searchParams.get("courseNumberMax")!) : undefined,
    };
  });

  // Load schedule from localStorage
  useEffect(() => {
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
  }, []);

  // "/" keyboard shortcut to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set("q", filters.query);
    if (filters.subjects && filters.subjects.length > 0) {
      params.set("subjects", filters.subjects.join(","));
    } else if (filters.subject) {
      params.set("subject", filters.subject);
    }
    if (filters.classType) params.set("classType", filters.classType);
    if (filters.deliveryMode) params.set("deliveryMode", filters.deliveryMode);
    if (filters.openOnly) params.set("openOnly", "true");
    if (filters.courseNumberMin !== undefined) params.set("courseNumberMin", filters.courseNumberMin.toString());
    if (filters.courseNumberMax !== undefined) params.set("courseNumberMax", filters.courseNumberMax.toString());

    const queryString = params.toString();
    const newUrl = `/catalog/${termCode}${queryString ? `?${queryString}` : ""}`;
    router.replace(newUrl, { scroll: false });
  }, [filters, termCode, router]);

  // Fetch courses
  const fetchCourses = useCallback(
    async (newFilters: SearchFilters, newPage: number, append: boolean = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams();
        if (newFilters.query) params.set("q", newFilters.query);
        if (newFilters.subjects && newFilters.subjects.length > 0) {
          params.set("subjects", newFilters.subjects.join(","));
        } else if (newFilters.subject) {
          params.set("subject", newFilters.subject);
        }
        params.set("term", termCode);
        if (newFilters.classType) params.set("classType", newFilters.classType);
        if (newFilters.deliveryMode) params.set("deliveryMode", newFilters.deliveryMode);
        if (newFilters.openOnly) params.set("openOnly", "true");
        if (newFilters.courseNumberMin !== undefined) params.set("courseNumberMin", newFilters.courseNumberMin.toString());
        if (newFilters.courseNumberMax !== undefined) params.set("courseNumberMax", newFilters.courseNumberMax.toString());
        params.set("page", newPage.toString());
        params.set("pageSize", "20");

        const data = await api.courses.search(params);

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
    },
    [termCode]
  );

  useEffect(() => {
    fetchCourses(filters, 1);
  }, [filters, fetchCourses]);

  function handleSearch() {
    setFilters({ ...filters, query: searchInput || undefined });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  function handleTermChange(newTerm: string) {
    router.push(`/catalog/${newTerm}`);
  }

  function handleAddToSchedule(section: ScheduleSection) {
    const newSections = [...scheduleSections, section];
    setScheduleSections(newSections);
    setScheduleSectionIds(newSections.map((s) => s.id));
    try {
      localStorage.setItem(
        "cysearch_schedule_details",
        JSON.stringify({ sections: newSections, name: "My Schedule" })
      );
      localStorage.setItem(
        "cysearch_schedule",
        JSON.stringify(newSections.map((s) => s.id))
      );
    } catch (error) {
      console.error("Failed to save schedule:", error);
    }
  }

  function handleRemoveFromSchedule(sectionId: string) {
    const newSections = scheduleSections.filter((s) => s.id !== sectionId);
    setScheduleSections(newSections);
    setScheduleSectionIds(newSections.map((s) => s.id));
    try {
      localStorage.setItem(
        "cysearch_schedule_details",
        JSON.stringify({ sections: newSections, name: "My Schedule" })
      );
      localStorage.setItem(
        "cysearch_schedule",
        JSON.stringify(newSections.map((s) => s.id))
      );
    } catch (error) {
      console.error("Failed to save schedule:", error);
    }
  }

  function checkConflict(section: ScheduleSection): ScheduleSection | null {
    for (const existing of scheduleSections) {
      if (hasTimeConflict(section, existing)) {
        return existing;
      }
    }
    return null;
  }

  // Count active filters for badge
  const activeFilterCount = [
    filters.subject,
    filters.classType,
    filters.deliveryMode,
    filters.openOnly,
  ].filter(Boolean).length;

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 z-40 w-full border-b border-gray-200/80 bg-white">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center transition-all duration-200 hover:opacity-80">
            <Logo size="sm" />
          </Link>

          {/* Search Input - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                ref={searchInputRef}
                placeholder="Search for courses... (type / to focus)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-20 w-full"
              />
              <Button
                size="sm"
                onClick={handleSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
              >
                Search
              </Button>
            </div>
          </div>

          {/* Right Nav */}
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setScheduleOpen(!scheduleOpen)}
              className={`hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                scheduleOpen
                  ? "text-cardinal bg-cardinal/10"
                  : "text-gray-600 hover:text-cardinal hover:bg-cardinal/5"
              }`}
            >
              {scheduleOpen ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <Calendar className="h-4 w-4" />
              )}
              <span>Schedule</span>
              {scheduleSectionIds.length > 0 && (
                <span className="bg-cardinal text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {scheduleSectionIds.length}
                </span>
              )}
            </button>

            {/* Mobile Filter Toggle */}
            <Drawer.Root open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <Drawer.Trigger asChild>
                <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                  <Menu className="h-6 w-6" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-cardinal text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </Drawer.Trigger>

              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
                <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex h-[90vh] flex-col rounded-t-2xl bg-white">
                  <div className="mx-auto mt-4 h-1.5 w-12 rounded-full bg-gray-300" />
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <span className="font-semibold">Filters</span>
                    <Drawer.Close asChild>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="h-5 w-5" />
                      </button>
                    </Drawer.Close>
                  </div>

                  {/* Mobile Search */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search courses..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSearch();
                            setMobileFiltersOpen(false);
                          }
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Mobile Nav Links */}
                  <div className="p-4 border-b border-gray-200 space-y-2">
                    <Drawer.Close asChild>
                      <Link
                        href="/"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
                      >
                        <Home className="h-5 w-5 text-cardinal" />
                        <span className="font-medium">Home</span>
                      </Link>
                    </Drawer.Close>
                    <Drawer.Close asChild>
                      <Link
                        href="/schedule"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
                      >
                        <Calendar className="h-5 w-5 text-cardinal" />
                        <span className="font-medium">Schedule Builder</span>
                        {scheduleSectionIds.length > 0 && (
                          <span className="bg-cardinal text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-auto">
                            {scheduleSectionIds.length}
                          </span>
                        )}
                      </Link>
                    </Drawer.Close>
                  </div>

                  {/* Sidebar Filters */}
                  <div className="flex-1 overflow-y-auto">
                    <CatalogSidebar
                      filters={filters}
                      onFiltersChange={(newFilters) => {
                        setFilters(newFilters);
                      }}
                      selectedTerm={termCode}
                      onTermChange={(term) => {
                        handleTermChange(term);
                        setMobileFiltersOpen(false);
                      }}
                    />
                  </div>

                  {/* Apply Button */}
                  <div className="p-4 border-t border-gray-200">
                    <Drawer.Close asChild>
                      <Button className="w-full" size="lg">
                        Apply Filters
                      </Button>
                    </Drawer.Close>
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          </nav>
        </div>
      </header>

      {/* Main Content - Multi Panel Layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar - Desktop Only */}
        <aside className="hidden md:block w-80 xl:w-96 border-r border-gray-200 bg-gray-50/50 overflow-y-auto flex-shrink-0">
          <CatalogSidebar
            filters={filters}
            onFiltersChange={setFilters}
            selectedTerm={termCode}
            onTermChange={handleTermChange}
          />
        </aside>

        {/* Center Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Results Header - Fixed */}
          <div className="flex-shrink-0 px-4 md:px-6 pt-4 md:pt-6 pb-3 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between">
              <div>
                {loading ? (
                  <p className="text-sm text-gray-500">Loading courses...</p>
                ) : (
                  <p className="text-sm text-gray-600">
                    {total > 0 ? (
                      <>
                        Showing <span className="font-medium">{courses.length}</span> of{" "}
                        <span className="font-medium">{total.toLocaleString()}</span> courses
                      </>
                    ) : (
                      "No courses found"
                    )}
                  </p>
                )}
              </div>

              {/* Active Filter Tags - Desktop */}
              <div className="hidden md:flex flex-wrap gap-2">
                {filters.query && (
                  <FilterTag
                    label={`"${filters.query}"`}
                    onRemove={() => {
                      setSearchInput("");
                      setFilters({ ...filters, query: undefined });
                    }}
                  />
                )}
                {filters.subject && (
                  <FilterTag
                    label={filters.subject}
                    onRemove={() => setFilters({ ...filters, subject: undefined })}
                  />
                )}
                {filters.classType && (
                  <FilterTag
                    label={filters.classType}
                    onRemove={() => setFilters({ ...filters, classType: undefined })}
                  />
                )}
                {filters.deliveryMode && (
                  <FilterTag
                    label={filters.deliveryMode}
                    onRemove={() => setFilters({ ...filters, deliveryMode: undefined })}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Scrollable Course List */}
          <div
            className="flex-1 overflow-y-auto px-4 md:px-6 py-3"
            onScroll={(e) => {
              const target = e.target as HTMLDivElement;
              const nearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 200;
              if (nearBottom && hasMore && !loadingMore && !loading) {
                fetchCourses(filters, page + 1, true);
              }
            }}
          >
            {/* Loading State */}
            {loading && courses.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-cardinal mb-4" />
                <p className="text-gray-600">Loading courses...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex flex-col items-center justify-center py-16">
                <AlertCircle className="h-8 w-8 text-red-600 mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => fetchCourses(filters, 1)}>Retry</Button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && courses.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No courses found
                </h3>
                <p className="text-gray-600 text-center max-w-md">
                  Try adjusting your filters or search for something different.
                </p>
              </div>
            )}

            {/* Course List */}
            {!loading && !error && courses.length > 0 && (
              <div className="space-y-2">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    scheduleSectionIds={scheduleSectionIds}
                    scheduleSections={scheduleSections}
                    blockedTimes={blockedTimes}
                    onAddToSchedule={handleAddToSchedule}
                    onRemoveFromSchedule={handleRemoveFromSchedule}
                    checkConflict={checkConflict}
                  />
                ))}

                {/* Loading More Indicator */}
                {loadingMore && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-cardinal" />
                  </div>
                )}

                {/* End of Results */}
                {!hasMore && courses.length > 0 && (
                  <p className="text-center text-sm text-gray-400 py-4">
                    End of results
                  </p>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Schedule Panel - Desktop Only - Right Side */}
        {scheduleOpen && (
          <aside className="hidden md:block w-[400px] xl:w-[440px] flex-shrink-0 overflow-hidden">
            <SchedulePanel
              isOpen={scheduleOpen}
              onClose={() => setScheduleOpen(false)}
              scheduleSectionIds={scheduleSectionIds}
              onRemoveFromSchedule={handleRemoveFromSchedule}
              onBlockedTimesChange={setBlockedTimes}
            />
          </aside>
        )}
      </div>
    </div>
  );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-cardinal/10 text-cardinal rounded-md">
      {label}
      <button onClick={onRemove} className="hover:bg-cardinal/20 rounded p-0.5">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

export default function CatalogTermPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-cardinal" />
            <p className="text-gray-600">Loading catalog...</p>
          </div>
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
