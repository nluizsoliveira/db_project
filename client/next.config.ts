import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use standalone output in production
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
};

export default nextConfig;
