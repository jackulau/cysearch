import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { LogoIcon } from "@/components/Logo";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy - CySearch",
  description: "Privacy Policy for CySearch, the Iowa State University course search tool.",
};

export default function PrivacyPolicy() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: December 26, 2024</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              CySearch (&quot;we&quot;, &quot;our&quot;, or &quot;the Service&quot;) respects your privacy and is committed to
              protecting any information that may be collected while you use our Service. This Privacy Policy
              explains what information we collect, how we use it, and your rights regarding that information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              CySearch is designed to be privacy-friendly. We collect minimal information:
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-3">2.1 Information You Provide</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              CySearch does not require account creation or login. We do not collect any personal information
              such as your name, email address, or student ID.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-3">2.2 Automatically Collected Information</h3>
            <p className="text-gray-600 leading-relaxed">
              When you use the Service, we may automatically collect certain information, including:
            </p>
            <ul className="list-disc pl-6 mt-4 text-gray-600 space-y-2">
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages visited and time spent on those pages</li>
              <li>Referring website addresses</li>
              <li>General geographic location (country/region level only)</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              This information is collected through standard web server logs and analytics tools and is used
              solely to improve the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Local Storage</h2>
            <p className="text-gray-600 leading-relaxed">
              CySearch may use your browser&apos;s local storage to save your preferences and schedule data locally
              on your device. This data is stored only on your device and is not transmitted to our servers.
              You can clear this data at any time through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              We may use cookies and similar tracking technologies to enhance your experience. Cookies are small
              data files stored on your device. You can instruct your browser to refuse all cookies or to indicate
              when a cookie is being sent. However, if you do not accept cookies, some portions of the Service
              may not function properly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. How We Use Information</h2>
            <p className="text-gray-600 leading-relaxed">
              The limited information we collect is used to:
            </p>
            <ul className="list-disc pl-6 mt-4 text-gray-600 space-y-2">
              <li>Provide, maintain, and improve the Service</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Detect, prevent, and address technical issues</li>
              <li>Understand how users interact with the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Information Sharing</h2>
            <p className="text-gray-600 leading-relaxed">
              We do not sell, trade, or otherwise transfer your information to third parties. We may share
              aggregated, anonymized data that cannot reasonably be used to identify you for purposes such
              as analyzing Service usage trends.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Third-Party Services</h2>
            <p className="text-gray-600 leading-relaxed">
              The Service may use third-party services for analytics or hosting that have their own privacy
              policies. We encourage you to review the privacy policies of any third-party services you access
              through the Service. These may include:
            </p>
            <ul className="list-disc pl-6 mt-4 text-gray-600 space-y-2">
              <li>Web hosting providers</li>
              <li>Analytics services (if implemented)</li>
              <li>Content delivery networks</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement reasonable security measures to protect the information we collect. However, no
              method of transmission over the Internet or method of electronic storage is 100% secure. While
              we strive to use commercially acceptable means to protect any information, we cannot guarantee
              its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              The Service is intended for use by college students and is not directed at children under the
              age of 13. We do not knowingly collect personal information from children under 13. If you believe
              we have collected information from a child under 13, please contact us so we can delete it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              Since we do not collect personal information requiring account creation, there is no personal
              data to request, modify, or delete. You can clear any locally stored preferences through your
              browser settings at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting
              the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. You are advised to
              review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us through our GitHub repository.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
