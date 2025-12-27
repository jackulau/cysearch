"use client";

import Link from "next/link";
import { Search, Calendar } from "lucide-react";
import { Logo } from "./Logo";
import { MobileDrawer } from "./MobileDrawer";
import { CommandMenuTrigger } from "./CommandMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/90 backdrop-blur-xl">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center transition-all duration-200 hover:opacity-80"
        >
          <Logo size="sm" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-0.5">
          <Link
            href="/catalog"
            className="group flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-600 hover:text-cardinal hover:bg-cardinal/5 rounded-lg transition-all duration-200"
          >
            <Search className="h-4 w-4 group-hover:scale-105 transition-transform" />
            <span>Catalog</span>
          </Link>
          <Link
            href="/schedule"
            className="group flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-600 hover:text-cardinal hover:bg-cardinal/5 rounded-lg transition-all duration-200"
          >
            <Calendar className="h-4 w-4 group-hover:scale-105 transition-transform" />
            <span>Schedule</span>
          </Link>
        </nav>

        {/* Right side: Command Menu + Mobile Drawer */}
        <div className="flex items-center gap-2">
          <CommandMenuTrigger className="hidden sm:flex" />
          <MobileDrawer />
        </div>
      </div>
    </header>
  );
}
