"use client";

import { useEffect, useState } from "react";

// Decorative course-related icons for the background grid
function CourseIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Book/Course icon */}
      <rect x="15" y="20" width="50" height="45" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="40" y1="20" x2="40" y2="65" stroke="currentColor" strokeWidth="2" />
      <line x1="22" y1="30" x2="35" y2="30" stroke="currentColor" strokeWidth="1.5" />
      <line x1="22" y1="38" x2="35" y2="38" stroke="currentColor" strokeWidth="1.5" />
      <line x1="22" y1="46" x2="35" y2="46" stroke="currentColor" strokeWidth="1.5" />
      <line x1="45" y1="30" x2="58" y2="30" stroke="currentColor" strokeWidth="1.5" />
      <line x1="45" y1="38" x2="58" y2="38" stroke="currentColor" strokeWidth="1.5" />
      <line x1="45" y1="46" x2="58" y2="46" stroke="currentColor" strokeWidth="1.5" />
      {/* Graduation cap accent */}
      <path d="M40 10 L55 18 L40 26 L25 18 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="40" y1="26" x2="40" y2="20" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="12" y="18" width="56" height="50" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="12" y1="32" x2="68" y2="32" stroke="currentColor" strokeWidth="2" />
      <line x1="28" y1="10" x2="28" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="52" y1="10" x2="52" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Calendar grid */}
      <rect x="20" y="40" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="35" y="40" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="50" y="40" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="20" y="54" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="35" y="54" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="35" cy="35" r="20" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="50" y1="50" x2="65" y2="65" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {/* Inner details */}
      <circle cx="35" cy="35" r="10" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
    </svg>
  );
}

function ClockIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="40" cy="40" r="3" fill="currentColor" />
      <line x1="40" y1="40" x2="40" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="40" x2="54" y2="46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Hour markers */}
      <line x1="40" y1="14" x2="40" y2="18" stroke="currentColor" strokeWidth="1.5" />
      <line x1="40" y1="62" x2="40" y2="66" stroke="currentColor" strokeWidth="1.5" />
      <line x1="14" y1="40" x2="18" y2="40" stroke="currentColor" strokeWidth="1.5" />
      <line x1="62" y1="40" x2="66" y2="40" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const icons = [CourseIcon, CalendarIcon, SearchIcon, ClockIcon];

export function BackgroundGrid() {
  const [tiles, setTiles] = useState<number[]>([]);

  useEffect(() => {
    // Calculate number of tiles needed to fill viewport
    const cols = Math.ceil(window.innerWidth / 130) + 1;
    const rows = Math.ceil(window.innerHeight / 130) + 1;
    setTiles(Array.from({ length: cols * rows }, (_, i) => i));

    const handleResize = () => {
      const cols = Math.ceil(window.innerWidth / 130) + 1;
      const rows = Math.ceil(window.innerHeight / 130) + 1;
      setTiles(Array.from({ length: cols * rows }, (_, i) => i));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <div
        className="w-full h-full"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, 130px)",
          gridAutoRows: "130px",
          justifyContent: "center",
        }}
      >
        {tiles.map((index) => {
          const IconComponent = icons[index % icons.length];
          return (
            <div
              key={index}
              className="flex items-center justify-center"
            >
              <IconComponent
                className="w-20 h-20 text-gray-400 opacity-30"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
