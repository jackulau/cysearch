"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { CourseWithSections } from "@/types";

interface CarouselCourse {
  code: string;
  credits: string;
  title: string;
  sectionsAvailable: number;
  sectionsTotal: number;
}

// Fallback sample courses in case API is unavailable
const fallbackCourses: CarouselCourse[] = [
  { code: "COMS 227", credits: "4", title: "Object-oriented Programming", sectionsAvailable: 8, sectionsTotal: 10 },
  { code: "COMS 228", credits: "3", title: "Introduction to Data Structures", sectionsAvailable: 5, sectionsTotal: 6 },
  { code: "MATH 165", credits: "4", title: "Calculus I", sectionsAvailable: 12, sectionsTotal: 15 },
  { code: "PHYS 221", credits: "4", title: "Introduction to Classical Physics I", sectionsAvailable: 6, sectionsTotal: 8 },
  { code: "CHEM 167", credits: "4", title: "General Chemistry for Engineering", sectionsAvailable: 0, sectionsTotal: 6 },
  { code: "STAT 330", credits: "3", title: "Probability and Statistics for Computer Science", sectionsAvailable: 4, sectionsTotal: 5 },
];

const fallbackSecondaryCourses: CarouselCourse[] = [
  { code: "BIOL 211", credits: "3", title: "Principles of Biology I", sectionsAvailable: 7, sectionsTotal: 10 },
  { code: "PSYCH 101", credits: "3", title: "Introduction to Psychology", sectionsAvailable: 15, sectionsTotal: 18 },
  { code: "ENGL 150", credits: "3", title: "Critical Thinking and Communication", sectionsAvailable: 20, sectionsTotal: 25 },
  { code: "SE 319", credits: "3", title: "Construction of User Interfaces", sectionsAvailable: 2, sectionsTotal: 3 },
  { code: "CPRE 281", credits: "4", title: "Digital Logic", sectionsAvailable: 5, sectionsTotal: 6 },
  { code: "ACCT 284", credits: "3", title: "Financial Accounting", sectionsAvailable: 11, sectionsTotal: 14 },
];

function transformCourse(course: CourseWithSections): CarouselCourse {
  const openSections = course.sections.filter(s => s.seatsAvailable > 0).length;
  return {
    code: `${course.subject} ${course.courseNumber}`,
    credits: course.credits || "3",
    title: course.title,
    sectionsAvailable: openSections,
    sectionsTotal: course.sections.length,
  };
}

function getAvailabilityColor(available: number, total: number): string {
  if (total === 0) return "text-gray-500";
  const ratio = available / total;
  if (available === 0) return "text-red-500";
  if (ratio <= 0.25) return "text-amber-500";
  return "text-green-600";
}

function CourseCard({ course }: { course: CarouselCourse }) {
  const availabilityColor = getAvailabilityColor(course.sectionsAvailable, course.sectionsTotal);

  return (
    <Link
      href={`/catalog?q=${encodeURIComponent(course.code)}`}
      className="inline-flex items-center rounded no-underline transition-opacity duration-200 ease-linear hover:opacity-80"
    >
      <div className="bg-white flex w-[280px] flex-col rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between pb-1">
          <h3 className="text-base leading-tight font-bold text-gray-900">{course.code}</h3>
          <span className="text-gray-500 text-sm">{course.credits} credits</span>
        </div>
        <p className="text-gray-500 truncate pr-14 pb-1 text-sm">{course.title}</p>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${availabilityColor}`}>
            {course.sectionsAvailable}/{course.sectionsTotal} section{course.sectionsTotal !== 1 ? "s" : ""} available
          </span>
        </div>
      </div>
    </Link>
  );
}

interface CourseCarouselProps {
  reverse?: boolean;
}

export function CourseCarousel({ reverse = false }: CourseCarouselProps) {
  const [courses, setCourses] = useState<CarouselCourse[]>(
    reverse ? fallbackSecondaryCourses : fallbackCourses
  );

  useEffect(() => {
    async function fetchCourses() {
      try {
        // Fetch courses from different subjects for variety
        const subjects = reverse
          ? ["BIOL", "PSYCH", "ENGL", "SE", "CPRE", "ACCT"]
          : ["COMS", "MATH", "PHYS", "CHEM", "STAT", "ENGR"];

        const params = new URLSearchParams();
        params.set("subjects", subjects.join(","));
        params.set("pageSize", "12");

        const data = await api.courses.search(params);

        if (data.courses.length > 0) {
          setCourses(data.courses.map(transformCourse));
        }
      } catch (error) {
        // Keep using fallback courses if API fails
        console.error("Failed to fetch carousel courses:", error);
      }
    }

    fetchCourses();
  }, [reverse]);

  // Duplicate the courses array for seamless looping
  const duplicatedCourses = [...courses, ...courses, ...courses];

  return (
    <div className="relative w-full overflow-hidden py-4" role="region" aria-label="Featured courses">
      {/* Fade edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[clamp(24px,8%,120px)] bg-gradient-to-r from-white to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[clamp(24px,8%,120px)] bg-gradient-to-l from-white to-transparent"
      />

      {/* Scrolling content */}
      <div className={`flex w-max select-none gap-2 ${reverse ? 'animate-carousel-reverse' : 'animate-carousel'}`}>
        {duplicatedCourses.map((course, index) => (
          <div key={`${course.code}-${index}`} className="flex-none">
            <CourseCard course={course} />
          </div>
        ))}
      </div>
    </div>
  );
}
