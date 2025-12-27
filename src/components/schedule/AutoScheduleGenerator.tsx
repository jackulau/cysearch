"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, Loader2, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoursePoolSearch } from "./CoursePoolSearch";
import { CoursePoolCard } from "./CoursePoolCard";
import { ScheduleOptionCard } from "./ScheduleOptionCard";
import { generateSchedules, canGenerateSchedules } from "@/lib/scheduleGenerator";
import type {
  PoolCourse,
  GeneratedScheduleOption,
  CourseWithSections,
  BlockedTime,
  ScheduleSection,
} from "@/types";

interface AutoScheduleGeneratorProps {
  blockedTimes: BlockedTime[];
  termCode: string;
  onPreviewSchedule: (sections: ScheduleSection[]) => void;
  onApplySchedule: (sections: ScheduleSection[]) => void;
}

const MAX_POOL_SIZE = 8;

export function AutoScheduleGenerator({
  blockedTimes,
  termCode,
  onPreviewSchedule,
  onApplySchedule,
}: AutoScheduleGeneratorProps) {
  const [pool, setPool] = useState<PoolCourse[]>([]);
  const [generatedOptions, setGeneratedOptions] = useState<GeneratedScheduleOption[]>([]);
  const [previewOptionId, setPreviewOptionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load pool from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cysearch_autogen_pool");
      if (saved) {
        const data = JSON.parse(saved);
        setPool(data.courses || []);
      }
    } catch (err) {
      console.error("Failed to load pool:", err);
    }
  }, []);

  // Save pool to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        "cysearch_autogen_pool",
        JSON.stringify({ courses: pool, lastUpdated: new Date().toISOString() })
      );
    } catch (err) {
      console.error("Failed to save pool:", err);
    }
  }, [pool]);

  // Add course to pool
  const handleAddCourse = useCallback((course: CourseWithSections) => {
    if (pool.length >= MAX_POOL_SIZE) {
      setError(`Maximum ${MAX_POOL_SIZE} courses allowed in pool`);
      return;
    }

    setPool((prev) => {
      // Check if already in pool
      if (prev.some((p) => p.course.id === course.id)) {
        return prev;
      }
      return [...prev, { course, isRequired: false }];
    });
    setError(null);
    setGeneratedOptions([]); // Clear generated options when pool changes
  }, [pool.length]);

  // Remove course from pool
  const handleRemoveCourse = useCallback((courseId: string) => {
    setPool((prev) => prev.filter((p) => p.course.id !== courseId));
    setGeneratedOptions([]);
  }, []);

  // Toggle required status
  const handleToggleRequired = useCallback((courseId: string) => {
    setPool((prev) =>
      prev.map((p) =>
        p.course.id === courseId ? { ...p, isRequired: !p.isRequired } : p
      )
    );
    setGeneratedOptions([]);
  }, []);

  // Generate schedules
  const handleGenerate = useCallback(() => {
    setError(null);
    setIsGenerating(true);
    setPreviewOptionId(null);

    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      try {
        // Check if generation is possible
        const check = canGenerateSchedules(pool, blockedTimes);
        if (!check.valid) {
          setError(check.error || "Cannot generate schedules");
          setGeneratedOptions([]);
          setIsGenerating(false);
          return;
        }

        const options = generateSchedules(pool, blockedTimes, 5);

        if (options.length === 0) {
          setError("No valid schedules found. Try removing some courses or adjusting blocked times.");
        } else {
          setGeneratedOptions(options);
          // Auto-preview first option
          setPreviewOptionId(options[0].id);
          onPreviewSchedule(options[0].sections);
        }
      } catch (err) {
        console.error("Generation failed:", err);
        setError("Failed to generate schedules. Please try again.");
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  }, [pool, blockedTimes, onPreviewSchedule]);

  // Handle preview
  const handlePreview = useCallback(
    (option: GeneratedScheduleOption) => {
      setPreviewOptionId(option.id);
      onPreviewSchedule(option.sections);
    },
    [onPreviewSchedule]
  );

  // Handle apply
  const handleApply = useCallback(
    (option: GeneratedScheduleOption) => {
      onApplySchedule(option.sections);
    },
    [onApplySchedule]
  );

  // Clear pool
  const handleClearPool = useCallback(() => {
    setPool([]);
    setGeneratedOptions([]);
    setError(null);
    setPreviewOptionId(null);
  }, []);

  const requiredCount = pool.filter((p) => p.isRequired).length;
  const optionalCount = pool.length - requiredCount;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cardinal" />
            Auto Schedule Generator
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Add courses, star required ones, then generate options
          </p>
        </div>
        {pool.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearPool}>
            Clear All
          </Button>
        )}
      </div>

      {/* Search */}
      <CoursePoolSearch pool={pool} onAddCourse={handleAddCourse} termCode={termCode} />

      {/* Pool limit warning */}
      {pool.length >= MAX_POOL_SIZE && (
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
          <AlertTriangle className="h-3 w-3" />
          Maximum {MAX_POOL_SIZE} courses reached
        </div>
      )}

      {/* Course Pool */}
      {pool.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Course Pool ({pool.length})
              {requiredCount > 0 && (
                <span className="text-amber-600 ml-1">
                  ({requiredCount} required, {optionalCount} optional)
                </span>
              )}
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {pool.map((poolCourse) => (
              <CoursePoolCard
                key={poolCourse.course.id}
                poolCourse={poolCourse}
                onToggleRequired={() => handleToggleRequired(poolCourse.course.id)}
                onRemove={() => handleRemoveCourse(poolCourse.course.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Info className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">Search and add courses to your pool</p>
          <p className="text-xs mt-1">Star courses that must be in your schedule</p>
        </div>
      )}

      {/* Generate button */}
      {pool.length > 0 && (
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Schedules
            </>
          )}
        </Button>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Generated options */}
      {generatedOptions.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            Generated {generatedOptions.length} option{generatedOptions.length > 1 ? "s" : ""}
          </div>

          <div className="space-y-2">
            {generatedOptions.map((option, index) => (
              <ScheduleOptionCard
                key={option.id}
                option={option}
                index={index}
                isPreview={previewOptionId === option.id}
                onPreview={() => handlePreview(option)}
                onApply={() => handleApply(option)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
