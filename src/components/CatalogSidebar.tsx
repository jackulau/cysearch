"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "@/lib/api";
import type { SearchFilters as Filters } from "@/types";

// Subject name mappings for common ISU departments
const subjectNames: Record<string, string> = {
  COMS: "Computer Science",
  CPRE: "Computer Engineering",
  SE: "Software Engineering",
  MATH: "Mathematics",
  STAT: "Statistics",
  PHYS: "Physics",
  CHEM: "Chemistry",
  BIOL: "Biology",
  ENGL: "English",
  PSYCH: "Psychology",
  ECON: "Economics",
  ACCT: "Accounting",
  FIN: "Finance",
  MGMT: "Management",
  MKT: "Marketing",
  ME: "Mechanical Engineering",
  EE: "Electrical Engineering",
  CE: "Civil Engineering",
  AERO: "Aerospace Engineering",
  IE: "Industrial Engineering",
  CHEM_E: "Chemical Engineering",
  MAT_E: "Materials Engineering",
  ABE: "Agricultural & Biosystems Engineering",
  ARCH: "Architecture",
  ARTGR: "Graphic Design",
  MUSIC: "Music",
  THTRE: "Theatre",
  DANCE: "Dance",
  POL_S: "Political Science",
  SOC: "Sociology",
  ANTHR: "Anthropology",
  HIST: "History",
  PHIL: "Philosophy",
  WLC: "World Languages & Cultures",
  KIN: "Kinesiology",
  FS_HN: "Food Science & Human Nutrition",
  HDFS: "Human Development & Family Studies",
  AESHM: "Apparel, Events, & Hospitality Management",
};

interface CatalogSidebarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  selectedTerm: string;
  onTermChange: (term: string) => void;
}

export function CatalogSidebar({
  filters,
  onFiltersChange,
  selectedTerm,
  onTermChange,
}: CatalogSidebarProps) {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [terms, setTerms] = useState<{ label: string; value: string }[]>([]);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    subjects: true,
    courseLevel: true,
    classType: false,
    deliveryMode: false,
  });

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

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      (subjectNames[subject]?.toLowerCase().includes(subjectSearch.toLowerCase()) ?? false)
  );

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const classTypes = [
    "Lecture",
    "Laboratory",
    "Discussion",
    "Research",
    "Independent Study",
    "Experiential",
    "Combination",
  ];

  const deliveryModes = ["In-Person", "Online", "Hybrid"];

  return (
    <div className="h-full overflow-y-auto">
      {/* Term Selector */}
      <div className="p-5 border-b border-gray-200">
        <label className="text-base font-semibold text-gray-700 mb-3 block">
          Semester
        </label>
        <Select value={selectedTerm} onValueChange={onTermChange}>
          <SelectTrigger className="w-full h-11 text-base">
            <SelectValue placeholder="Select term" />
          </SelectTrigger>
          <SelectContent>
            {terms.map((term) => (
              <SelectItem key={term.value} value={term.value} className="text-base py-2">
                {term.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Open Only Checkbox */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="openOnly"
            checked={filters.openOnly || false}
            onCheckedChange={(checked) =>
              onFiltersChange({ ...filters, openOnly: !!checked })
            }
            className="h-5 w-5"
          />
          <label
            htmlFor="openOnly"
            className="text-base font-medium leading-none cursor-pointer"
          >
            Show only open sections
          </label>
        </div>
      </div>

      {/* Subjects Section */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection("subjects")}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
        >
          <span className="text-base font-semibold text-gray-900">
            Subjects
          </span>
          {expandedSections.subjects ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {expandedSections.subjects && (
          <div className="px-5 pb-5 space-y-3">
            {/* Subject search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Filter subjects..."
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
                className="pl-10 h-10 text-base"
              />
              {subjectSearch && (
                <button
                  onClick={() => setSubjectSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            {/* Subject list */}
            <div className="max-h-80 overflow-y-auto space-y-1">
              {/* Selected subjects count */}
              {(filters.subjects?.length ?? 0) > 0 && (
                <div className="flex items-center justify-between px-3 py-2 mb-1">
                  <span className="text-sm text-gray-600">
                    {filters.subjects?.length} selected
                  </span>
                  <button
                    onClick={() => onFiltersChange({ ...filters, subjects: undefined, subject: undefined })}
                    className="text-xs text-cardinal hover:text-cardinal/80 font-medium"
                  >
                    Clear
                  </button>
                </div>
              )}
              {filteredSubjects.map((subject) => {
                const isSelected = filters.subjects?.includes(subject) ?? false;
                return (
                  <button
                    key={subject}
                    onClick={() => {
                      const currentSubjects = filters.subjects ?? [];
                      const newSubjects = isSelected
                        ? currentSubjects.filter((s) => s !== subject)
                        : [...currentSubjects, subject];
                      onFiltersChange({
                        ...filters,
                        subjects: newSubjects.length > 0 ? newSubjects : undefined,
                        subject: undefined,
                      });
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-base transition-colors flex items-center gap-2 ${
                      isSelected
                        ? "bg-cardinal/10 text-cardinal"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? "bg-cardinal border-cardinal" : "border-gray-300"
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium">{subject}</span>
                      {subjectNames[subject] && (
                        <span className="text-sm ml-1.5 opacity-70">
                          - {subjectNames[subject]}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
              {filteredSubjects.length === 0 && (
                <p className="text-base text-gray-500 text-center py-3">
                  No subjects found
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Course Level Section */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection("courseLevel")}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
        >
          <span className="text-base font-semibold text-gray-900">
            Course Level
          </span>
          {expandedSections.courseLevel ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {expandedSections.courseLevel && (
          <div className="px-5 pb-5 space-y-4">
            {/* Range display */}
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900">
                {filters.courseNumberMin ?? 0}
              </span>
              <span className="text-gray-400">to</span>
              <span className="font-medium text-gray-900">
                {filters.courseNumberMax ?? 9999}
              </span>
            </div>

            {/* Dual range slider */}
            <div className="relative h-6 flex items-center">
              {/* Track background */}
              <div className="absolute inset-x-0 h-2 bg-gray-200 rounded-full" />

              {/* Active track */}
              <div
                className="absolute h-2 bg-cardinal rounded-full"
                style={{
                  left: `${((filters.courseNumberMin ?? 0) / 9999) * 100}%`,
                  right: `${100 - ((filters.courseNumberMax ?? 9999) / 9999) * 100}%`,
                }}
              />

              {/* Min slider */}
              <input
                type="range"
                min={0}
                max={9999}
                step={100}
                value={filters.courseNumberMin ?? 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  const max = filters.courseNumberMax ?? 9999;
                  onFiltersChange({
                    ...filters,
                    courseNumberMin: val >= max ? max - 100 : val,
                  });
                }}
                className="absolute inset-x-0 w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-cardinal [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-cardinal [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
              />

              {/* Max slider */}
              <input
                type="range"
                min={0}
                max={9999}
                step={100}
                value={filters.courseNumberMax ?? 9999}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  const min = filters.courseNumberMin ?? 0;
                  onFiltersChange({
                    ...filters,
                    courseNumberMax: val <= min ? min + 100 : val,
                  });
                }}
                className="absolute inset-x-0 w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-cardinal [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-cardinal [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
              />
            </div>

            {/* Reset button */}
            {(filters.courseNumberMin !== undefined || filters.courseNumberMax !== undefined) && (
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    courseNumberMin: undefined,
                    courseNumberMax: undefined,
                  })
                }
                className="text-xs text-cardinal hover:text-cardinal/80 font-medium"
              >
                Reset range
              </button>
            )}
          </div>
        )}
      </div>

      {/* Class Type Section */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection("classType")}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
        >
          <span className="text-base font-semibold text-gray-900">
            Class Type
          </span>
          {expandedSections.classType ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {expandedSections.classType && (
          <div className="px-5 pb-5 space-y-1">
            <button
              onClick={() => onFiltersChange({ ...filters, classType: undefined })}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-base transition-colors ${
                !filters.classType
                  ? "bg-cardinal text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              All Types
            </button>
            {classTypes.map((type) => (
              <button
                key={type}
                onClick={() => onFiltersChange({ ...filters, classType: type })}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-base transition-colors ${
                  filters.classType === type
                    ? "bg-cardinal text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Delivery Mode Section */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection("deliveryMode")}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
        >
          <span className="text-base font-semibold text-gray-900">
            Delivery Mode
          </span>
          {expandedSections.deliveryMode ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {expandedSections.deliveryMode && (
          <div className="px-5 pb-5 space-y-1">
            <button
              onClick={() => onFiltersChange({ ...filters, deliveryMode: undefined })}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-base transition-colors ${
                !filters.deliveryMode
                  ? "bg-cardinal text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              All Modes
            </button>
            {deliveryModes.map((mode) => (
              <button
                key={mode}
                onClick={() => onFiltersChange({ ...filters, deliveryMode: mode })}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-base transition-colors ${
                  filters.deliveryMode === mode
                    ? "bg-cardinal text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Clear Filters */}
      {(filters.subject || filters.subjects?.length || filters.classType || filters.deliveryMode || filters.openOnly || filters.courseNumberMin || filters.courseNumberMax) && (
        <div className="p-5">
          <button
            onClick={() =>
              onFiltersChange({
                query: filters.query,
              })
            }
            className="w-full text-base text-cardinal hover:text-cardinal/80 font-medium transition-colors py-2"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
