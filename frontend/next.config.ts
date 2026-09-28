import type { NextConfig } from "next";

const backendUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080"
    : "https://oji-backend.onrender.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;