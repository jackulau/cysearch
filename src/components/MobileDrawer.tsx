"use client";

import { Drawer } from "vaul";
import Link from "next/link";
import { Search, Calendar, Menu, X, Home } from "lucide-react";
import { Logo } from "./Logo";

interface MobileDrawerProps {
  children?: React.ReactNode;
}

export function MobileDrawer({ children }: MobileDrawerProps) {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex h-[85vh] flex-col rounded-t-2xl bg-white">
          {/* Handle */}
          <div className="mx-auto mt-4 h-1.5 w-12 rounded-full bg-gray-300" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <Logo size="sm" />
            <Drawer.Close asChild>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </Drawer.Close>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-2">
              <Drawer.Close asChild>
                <Link
                  href="/"
                  className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Home className="h-5 w-5 text-cardinal" />
                  <span className="font-medium">Home</span>
                </Link>
              </Drawer.Close>

              <Drawer.Close asChild>
                <Link
                  href="/catalog"
                  className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Search className="h-5 w-5 text-cardinal" />
                  <span className="font-medium">Search Catalog</span>
                </Link>
              </Drawer.Close>

              <Drawer.Close asChild>
                <Link
                  href="/schedule"
                  className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Calendar className="h-5 w-5 text-cardinal" />
                  <span className="font-medium">Schedule Builder</span>
                </Link>
              </Drawer.Close>
            </div>

            {children}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4">
            <p className="text-sm text-gray-500 text-center">
              Made for Iowa State University
            </p>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
