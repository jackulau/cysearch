"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

function SearchRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function redirectToCatalog() {
      try {
        // Fetch the latest term
        const data = await api.courses.getTerms();
        const terms = data.terms || [];

        if (terms.length > 0) {
          // Build the query string from existing search params
          const params = new URLSearchParams();
          const q = searchParams.get("q");
          const subject = searchParams.get("subject");
          const term = searchParams.get("term");
          const classType = searchParams.get("classType");
          const deliveryMode = searchParams.get("deliveryMode");
          const openOnly = searchParams.get("openOnly");

          if (q) params.set("q", q);
          if (subject) params.set("subject", subject);
          if (classType) params.set("classType", classType);
          if (deliveryMode) params.set("deliveryMode", deliveryMode);
          if (openOnly) params.set("openOnly", openOnly);

          // Use the term from URL or default to latest
          const termCode = term || terms[0].value;
          const queryString = params.toString();
          router.replace(`/catalog/${termCode}${queryString ? `?${queryString}` : ""}`);
        }
      } catch (error) {
        console.error("Failed to redirect:", error);
        router.replace("/catalog");
      }
    }

    redirectToCatalog();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-cardinal" />
        <p className="text-gray-600">Redirecting to catalog...</p>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-cardinal" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <SearchRedirect />
    </Suspense>
  );
}
