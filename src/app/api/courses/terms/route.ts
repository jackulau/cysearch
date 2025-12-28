import { NextResponse } from "next/server";
import { getDb, initializeDatabase } from "@/db";
import { sections } from "@/db/schema";
import { sql } from "drizzle-orm";

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    initializeDatabase();
    initialized = true;
  }
}

export async function GET() {
  await ensureInitialized();

  try {
    const allTerms = await getDb()
      .selectDistinct({
        term: sections.term,
        termCode: sections.termCode,
      })
      .from(sections)
      .orderBy(sql`${sections.termCode} DESC`);

    // Filter out past semesters based on current date
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    const filteredTerms = allTerms.filter((t) => {
      const termCode = t.termCode;
      const year = parseInt(termCode.slice(0, 4));
      const semester = termCode.slice(4);

      // Determine end month for each semester type
      // FA (Fall): ends December
      // SU (Summer): ends August
      // SP (Spring): ends May
      // WI (Winter): ends January of NEXT year (but coded as same year)

      if (year > currentYear) return true;
      if (year < currentYear) {
        // Only show winter of previous year if it's January
        if (semester === "WI" && year === currentYear - 1 && currentMonth === 1) {
          return true;
        }
        return false;
      }

      // Same year - check semester
      if (semester === "FA") {
        // Fall ends in December, show if before January next year
        return currentMonth <= 12;
      } else if (semester === "SU") {
        // Summer ends in August
        return currentMonth <= 8;
      } else if (semester === "SP") {
        // Spring ends in May
        return currentMonth <= 5;
      } else if (semester === "WI") {
        // Winter is typically Jan term
        return currentMonth <= 1;
      }

      return true;
    });

    // Sort terms so that Spring/Fall come before Winter/Summer for the same time period
    // This ensures the default (first term) is a main semester
    const sortedTerms = [...filteredTerms].sort((a, b) => {
      // First sort by termCode descending (most recent first)
      if (a.termCode !== b.termCode) {
        // Extract year and semester
        const yearA = parseInt(a.termCode.slice(0, 4));
        const yearB = parseInt(b.termCode.slice(0, 4));
        const semA = a.termCode.slice(4);
        const semB = b.termCode.slice(4);

        // Different years - sort by year descending
        if (yearA !== yearB) {
          return yearB - yearA;
        }

        // Same year - prioritize FA > SP > SU > WI
        const priority: Record<string, number> = { FA: 1, SP: 2, SU: 3, WI: 4 };
        return (priority[semA] || 5) - (priority[semB] || 5);
      }
      return 0;
    });

    return NextResponse.json({
      terms: sortedTerms.map((t) => ({
        label: t.term,
        value: t.termCode,
      })),
    });
  } catch (error) {
    console.error("Error fetching terms:", error);
    return NextResponse.json(
      { error: "Failed to fetch terms" },
      { status: 500 }
    );
  }
}
