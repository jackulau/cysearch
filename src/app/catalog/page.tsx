"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function CatalogPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function redirectToLatestTerm() {
      try {
        const data = await api.courses.getTerms();
        const terms = data.terms || [];

        if (terms.length > 0) {
          // Redirect to the latest term (first in the list since ordered by termCode DESC)
          router.replace(`/catalog/${terms[0].value}`);
        } else {
          setError("No terms available. Please try again later.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load catalog");
      }
    }

    redirectToLatestTerm();
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      {error ? (
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-cardinal" />
          <p className="text-gray-600">Loading catalog...</p>
        </div>
      )}
    </div>
  );
}
