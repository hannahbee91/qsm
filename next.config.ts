import type { NextConfig } from "next";

const allowedOrigins = ["localhost:3000"];
const appUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL;
if (appUrl) {
  try {
    allowedOrigins.push(new URL(appUrl).host);
  } catch {}
}

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      allowedOrigins,
    },
  },
};

export default nextConfig;
