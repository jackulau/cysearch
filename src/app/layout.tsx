import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CommandMenu } from "@/components/CommandMenu";
import { Toaster } from "@/components/Toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CySearch - Iowa State University Course Search",
  description: "Search for courses, track seat availability, and build your schedule at Iowa State University. Never miss an open seat again!",
  keywords: ["Iowa State University", "ISU", "course search", "class search", "schedule builder", "Cyclones"],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/logo.svg",
  },
  openGraph: {
    title: "CySearch - Iowa State University Course Search",
    description: "Search for courses, track seat availability, and build your schedule at Iowa State University.",
    type: "website",
    siteName: "CySearch",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "CySearch - Iowa State University Course Search",
    description: "Search for courses, track seat availability, and build your schedule at Iowa State University.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
        <CommandMenu />
        <Toaster />
      </body>
    </html>
  );
}
