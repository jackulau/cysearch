"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { LogoIcon } from "@/components/Logo";
import { BackgroundGrid } from "@/components/BackgroundGrid";
import { Footer } from "@/components/Footer";
import { CourseCarousel } from "@/components/CourseCarousel";
import { api } from "@/lib/api";

function QuickLink({ subject, label }: { subject: string; label: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await api.courses.getTerms();
      const terms = data.terms || [];
      const termCode = terms[0]?.value || "latest";
      router.push(`/catalog/${termCode}?subject=${subject}`);
    } catch {
      router.push(`/catalog?subject=${subject}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-full hover:bg-white hover:border-cardinal/30 hover:text-cardinal hover:shadow-sm transition-all duration-200 disabled:opacity-50"
    >
      {label}
    </button>
  );
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMac] = useState(() => {
    if (typeof navigator !== "undefined") {
      return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    }
    return false;
  });
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Fetch the latest term and redirect to catalog
      try {
        const data = await api.courses.getTerms();
        const terms = data.terms || [];
        const termCode = terms[0]?.value || "latest";
        router.push(`/catalog/${termCode}?q=${encodeURIComponent(searchQuery.trim())}`);
      } catch {
        router.push(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    } else {
      router.push("/catalog");
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      {/* Background grid of decorative icons */}
      <BackgroundGrid />

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <LogoIcon className="h-20 w-20 md:h-24 md:w-24" />
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            CySearch
          </h1>

          {/* Tagline */}
          <p className="text-lg text-gray-600 mb-8">
            The better way to search for classes at{" "}
            <span className="font-semibold text-cardinal">Iowa State University</span>
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="w-full max-w-[650px] lg:max-w-[800px] mx-auto mb-8">
            <div className="group w-full h-14 lg:h-16 flex items-center gap-3 px-5 lg:px-6 rounded-full border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg focus-within:border-cardinal focus-within:ring-4 focus-within:ring-cardinal/10 transition-all duration-200 shadow-md">
              <Search className="h-6 w-6 lg:h-7 lg:w-7 text-gray-400 group-hover:text-gray-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for classes, professors, or subjects..."
                className="flex-1 text-lg lg:text-xl text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded-md shadow-sm">
                {isMac ? "⌘" : "Ctrl"} K
              </kbd>
            </div>
          </form>

          {/* Quick links */}
          <div className="flex flex-wrap justify-center gap-2.5">
            <Link
              href="/catalog"
              className="px-4 py-2 text-sm font-medium text-white bg-cardinal border border-cardinal rounded-full hover:bg-cardinal/90 hover:shadow-sm transition-all duration-200"
            >
              Browse Catalog
            </Link>
            {[
              { label: "Computer Science", subject: "COMS" },
              { label: "Mathematics", subject: "MATH" },
              { label: "Physics", subject: "PHYS" },
            ].map((item) => (
              <QuickLink key={item.subject} subject={item.subject} label={item.label} />
            ))}
          </div>
        </div>
      </main>

      {/* Course Carousels */}
      <div className="pb-4">
        <CourseCarousel />
        <CourseCarousel reverse />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
