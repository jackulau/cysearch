"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "@/lib/api";
import type { SearchFilters as Filters } from "@/types";

interface SearchFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [terms, setTerms] = useState<{ label: string; value: string }[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.query || "");
  const [instructorInput, setInstructorInput] = useState(filters.instructor || "");

  useEffect(() => {
    let mounted = true;

    async function fetchSubjects() {
      try {
        const data = await api.courses.getSubjects();
        if (mounted) {
          setSubjects(data.subjects || []);
        }
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      }
    }

    async function fetchTerms() {
      try {
        const data = await api.courses.getTerms();
        if (mounted) {
          setTerms(data.terms || []);
        }
      } catch (error) {
        console.error("Failed to fetch terms:", error);
      }
    }

    fetchSubjects();
    fetchTerms();

    return () => {
      mounted = false;
    };
  }, []);

  function handleSearch() {
    onFiltersChange({ ...filters, query: searchInput, instructor: instructorInput || undefined });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  function clearFilters() {
    setSearchInput("");
    setInstructorInput("");
    onFiltersChange({});
  }

  const hasActiveFilters =
    filters.query ||
    filters.subject ||
    filters.term ||
    filters.instructor ||
    filters.classType ||
    filters.deliveryMode ||
    filters.openOnly;

  return (
    <div className="space-y-4">
      {/* Main Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search courses (e.g., COMS 227, programming, data structures)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Filter className="h-4 w-4 mr-1" />
          Filters
          {showAdvanced ? (
            <ChevronUp className="h-4 w-4 ml-1" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-1" />
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Subject Filter */}
            <div>
              <label className="text-sm font-medium text-gray-900 mb-1 block">
                Subject
              </label>
              <Select
                value={filters.subject || "all"}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    subject: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Term Filter */}
            <div>
              <label className="text-sm font-medium text-gray-900 mb-1 block">
                Term
              </label>
              <Select
                value={filters.term || "all"}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    term: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All terms</SelectItem>
                  {terms.map((term) => (
                    <SelectItem key={term.value} value={term.value}>
                      {term.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class Type Filter */}
            <div>
              <label className="text-sm font-medium text-gray-900 mb-1 block">
                Class Type
              </label>
              <Select
                value={filters.classType || "all"}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    classType: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="Lecture">Lecture</SelectItem>
                  <SelectItem value="Laboratory">Laboratory</SelectItem>
                  <SelectItem value="Discussion">Discussion</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                  <SelectItem value="Independent Study">Independent Study</SelectItem>
                  <SelectItem value="Experiential">Experiential</SelectItem>
                  <SelectItem value="Combination">Combination</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Delivery Mode Filter */}
            <div>
              <label className="text-sm font-medium text-gray-900 mb-1 block">
                Delivery Mode
              </label>
              <Select
                value={filters.deliveryMode || "all"}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    deliveryMode: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All modes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All modes</SelectItem>
                  <SelectItem value="In-Person">In-Person</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Instructor Search */}
          <div>
            <label className="text-sm font-medium text-gray-900 mb-1 block">
              Instructor
            </label>
            <Input
              placeholder="Search by instructor name"
              value={instructorInput}
              onChange={(e) => setInstructorInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="openOnly"
                checked={filters.openOnly || false}
                onCheckedChange={(checked) =>
                  onFiltersChange({ ...filters, openOnly: !!checked })
                }
              />
              <label
                htmlFor="openOnly"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Show only open sections
              </label>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.query && (
            <FilterTag
              label={`Search: "${filters.query}"`}
              onRemove={() => {
                setSearchInput("");
                onFiltersChange({ ...filters, query: undefined });
              }}
            />
          )}
          {filters.subject && (
            <FilterTag
              label={`Subject: ${filters.subject}`}
              onRemove={() =>
                onFiltersChange({ ...filters, subject: undefined })
              }
            />
          )}
          {filters.term && (
            <FilterTag
              label={`Term: ${terms.find((t) => t.value === filters.term)?.label || filters.term}`}
              onRemove={() => onFiltersChange({ ...filters, term: undefined })}
            />
          )}
          {filters.classType && (
            <FilterTag
              label={`Type: ${filters.classType}`}
              onRemove={() =>
                onFiltersChange({ ...filters, classType: undefined })
              }
            />
          )}
          {filters.deliveryMode && (
            <FilterTag
              label={`Mode: ${filters.deliveryMode}`}
              onRemove={() =>
                onFiltersChange({ ...filters, deliveryMode: undefined })
              }
            />
          )}
          {filters.instructor && (
            <FilterTag
              label={`Instructor: ${filters.instructor}`}
              onRemove={() => {
                setInstructorInput("");
                onFiltersChange({ ...filters, instructor: undefined });
              }}
            />
          )}
          {filters.openOnly && (
            <FilterTag
              label="Open sections only"
              onRemove={() =>
                onFiltersChange({ ...filters, openOnly: false })
              }
            />
          )}
        </div>
      )}
    </div>
  );
}

function FilterTag({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-cardinal/10 text-cardinal rounded-md">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-cardinal/20 rounded p-0.5"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
