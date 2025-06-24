import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint hatalarını build sırasında görmezden gel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript hatalarını build sırasında görmezden gel
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
