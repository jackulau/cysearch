import Link from "next/link";
import { LogoIcon } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="py-6 bg-transparent text-gray-500">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo and name */}
          <div className="flex items-center gap-2">
            <LogoIcon className="h-5 w-5 opacity-80" />
            <span className="font-semibold text-sm text-gray-700">CySearch</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
            <Link href="/terms" className="hover:text-cardinal transition-colors duration-200">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-cardinal transition-colors duration-200">
              Privacy
            </Link>
            <a
              href="https://github.com/jackulau/cysearch"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cardinal transition-colors duration-200"
            >
              GitHub
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} CySearch
          </p>
        </div>
      </div>
    </footer>
  );
}
