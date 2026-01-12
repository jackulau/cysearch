import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",
  // Externalize native modules that don't work in Vercel's serverless environment
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
