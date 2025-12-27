"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  ArrowRight,
  Command as CommandIcon,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Course {
  id: string;
  subject: string;
  courseNumber: string;
  title: string;
}

export function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Course[]>([]);
  const [currentTerm, setCurrentTerm] = useState<string>("");
  const router = useRouter();
  const pathname = usePathname();

  // Get current term from URL or localStorage
  useEffect(() => {
    // Check if we're on a catalog page with a term
    const match = pathname.match(/\/catalog\/([^/?]+)/);
    if (match) {
      setCurrentTerm(match[1]);
      localStorage.setItem("cysearch_current_term", match[1]);
    } else {
      // Try to get from localStorage
      const savedTerm = localStorage.getItem("cysearch_current_term");
      if (savedTerm) {
        setCurrentTerm(savedTerm);
      }
    }
  }, [pathname]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setIsOpen(newOpen);
    if (!newOpen) {
      setSearch("");
      setResults([]);
    }
  }, []);

  // Toggle on Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleOpenChange(!isOpen);
      }
      if (e.key === "Escape") {
        handleOpenChange(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, handleOpenChange]);

  // Debounced search
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const termParam = currentTerm ? `&term=${currentTerm}` : "";
        const res = await fetch(
          `/api/courses?q=${encodeURIComponent(search)}&pageSize=5${termParam}`
        );
        const data = await res.json();
        setResults(data.courses?.slice(0, 5) || []);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [search, currentTerm]);

  const navigate = (path: string) => {
    router.push(path);
    handleOpenChange(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 animate-fade-in"
        onClick={() => handleOpenChange(false)}
      />

      {/* Command Menu */}
      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 px-4 animate-scale-in">
        <Command
          className="rounded-2xl border-2 border-gray-200 bg-white shadow-2xl overflow-hidden"
          shouldFilter={false}
        >
          <div className="flex items-center border-b border-gray-100 px-4 bg-gray-50/50">
            <Search className="h-5 w-5 text-gray-400" />
            <Command.Input
              autoFocus
              value={search}
              onValueChange={setSearch}
              placeholder="Search courses, subjects, instructors..."
              className="flex-1 h-14 px-4 text-base text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
            />
            {loading && (
              <Loader2 className="h-5 w-5 animate-spin text-cardinal" />
            )}
            <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded-md border border-gray-200 bg-gray-100 px-2 text-xs font-medium text-gray-500 shadow-sm">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[300px] overflow-y-auto p-2 bg-white">
            <Command.Empty className="py-6 text-center text-sm text-gray-500">
              {search ? "No results found." : "Type to search courses..."}
            </Command.Empty>

            {/* Quick Actions */}
            {!search && (
              <Command.Group heading="Quick Actions">
                <Command.Item
                  onSelect={() => navigate(currentTerm ? `/catalog/${currentTerm}` : "/catalog")}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-gray-700 data-[selected=true]:bg-cardinal data-[selected=true]:text-white transition-all duration-150"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cardinal/10 ring-1 ring-cardinal/20 group-data-[selected=true]:bg-white/20 group-data-[selected=true]:ring-white/30">
                    <Search className="h-4 w-4 text-cardinal group-data-[selected=true]:text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium">Search All Courses</span>
                    <p className="text-xs text-gray-500 group-data-[selected=true]:text-white/80">Find classes, professors & subjects</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-data-[selected=true]:opacity-100 group-data-[selected=true]:text-white transition-all" />
                </Command.Item>
              </Command.Group>
            )}

            {/* Search Results */}
            {results.length > 0 && (
              <Command.Group heading="Courses">
                {results.map((course) => (
                  <Command.Item
                    key={course.id}
                    onSelect={() => {
                      const basePath = currentTerm ? `/catalog/${currentTerm}` : "/catalog";
                      navigate(`${basePath}?q=${course.subject} ${course.courseNumber}`);
                    }}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-gray-700 data-[selected=true]:bg-cardinal data-[selected=true]:text-white transition-all duration-150"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cardinal/10 text-cardinal text-xs font-bold ring-1 ring-cardinal/20 group-data-[selected=true]:bg-white/20 group-data-[selected=true]:text-white group-data-[selected=true]:ring-white/30">
                      {course.subject}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {course.subject} {course.courseNumber}
                      </p>
                      <p className="text-sm text-gray-500 truncate group-data-[selected=true]:text-white/80">
                        {course.title}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 group-data-[selected=true]:text-white" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/80 px-4 py-2.5 text-xs text-gray-500">
            <div className="hidden sm:flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-md border border-gray-200 bg-white px-1.5 py-0.5 font-medium text-gray-600 shadow-sm">↑</kbd>
                <kbd className="rounded-md border border-gray-200 bg-white px-1.5 py-0.5 font-medium text-gray-600 shadow-sm">↓</kbd>
                <span className="ml-1">navigate</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-md border border-gray-200 bg-white px-1.5 py-0.5 font-medium text-gray-600 shadow-sm">↵</kbd>
                <span className="ml-1">select</span>
              </span>
            </div>
            <span className="flex items-center gap-1.5 sm:ml-auto">
              <kbd className="rounded-md border border-gray-200 bg-white px-1.5 py-0.5 font-medium text-gray-600 shadow-sm">
                <CommandIcon className="inline h-3 w-3" /> K
              </kbd>
              <span>to toggle</span>
            </span>
          </div>
        </Command>
      </div>
    </>
  );
}

// Keyboard shortcut hint component for header
export function CommandMenuTrigger({ className }: { className?: string }) {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  const handleClick = () => {
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  return (
    <button
      className={cn(
        "group flex items-center gap-2.5 h-9 px-3 text-sm text-muted-foreground rounded-lg border border-border bg-background hover:bg-muted hover:border-muted-foreground/20 hover:shadow-sm transition-all duration-200",
        className
      )}
      onClick={handleClick}
    >
      <Search className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      <span className="hidden sm:inline text-muted-foreground">Search...</span>
      <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground shadow-sm">
        {isMac ? "⌘" : "Ctrl"} K
      </kbd>
    </button>
  );
}
