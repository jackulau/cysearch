import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { LogoIcon } from "@/components/Logo";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service - CySearch",
  description: "Terms of Service for CySearch, the Iowa State University course search tool.",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <LogoIcon className="h-8 w-8" />
              <span className="font-semibold text-lg text-gray-900">CySearch</span>
            </Link>
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-cardinal transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: December 26, 2024</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing and using CySearch (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use the Service. CySearch is an unofficial tool
              and is not affiliated with, endorsed by, or sponsored by Iowa State University.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-600 leading-relaxed">
              CySearch provides a search interface for Iowa State University course information. The Service
              allows users to search for courses, view course details, and plan their class schedules. The
              information displayed is sourced from publicly available Iowa State University data and is
              provided for informational purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. No Warranty</h2>
            <p className="text-gray-600 leading-relaxed">
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without any warranties of any kind,
              either express or implied. We do not guarantee that:
            </p>
            <ul className="list-disc pl-6 mt-4 text-gray-600 space-y-2">
              <li>The course information displayed is accurate, complete, or up-to-date</li>
              <li>The Service will be uninterrupted, timely, secure, or error-free</li>
              <li>Any errors in the Service will be corrected</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              Always verify course information through official Iowa State University channels before making
              academic decisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              In no event shall CySearch, its creators, or contributors be liable for any indirect, incidental,
              special, consequential, or punitive damages, including but not limited to loss of data, academic
              opportunities, or other intangible losses, arising out of or in connection with your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Use Restrictions</h2>
            <p className="text-gray-600 leading-relaxed">You agree not to:</p>
            <ul className="list-disc pl-6 mt-4 text-gray-600 space-y-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to the Service or its related systems</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated scripts to collect information from the Service without permission</li>
              <li>Reproduce, duplicate, copy, sell, or exploit any portion of the Service for commercial purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              The Service and its original content, features, and functionality are owned by CySearch and are
              protected by applicable copyright, trademark, and other intellectual property laws. Iowa State
              University trademarks and course data remain the property of Iowa State University.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Third-Party Links</h2>
            <p className="text-gray-600 leading-relaxed">
              The Service may contain links to third-party websites or services that are not owned or controlled
              by CySearch. We have no control over and assume no responsibility for the content, privacy policies,
              or practices of any third-party websites or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we
              will provide notice prior to any new terms taking effect. What constitutes a material change will
              be determined at our sole discretion. Continued use of the Service after any such changes constitutes
              acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about these Terms, please contact us through our GitHub repository.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
