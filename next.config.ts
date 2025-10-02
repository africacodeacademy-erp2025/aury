import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker builds
  output: "standalone",

  // Enable experimental features for better performance
  experimental: {
    // Enable optimizeCss for better CSS optimization
    // optimizeCss: true,
    // Enable optimizePackageImports for better tree shaking
    optimizePackageImports: ["lucide-react", "@radix-ui/react-dialog", "@radix-ui/react-label", "@radix-ui/react-slot"],
  },

  // Configure image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      }
    ]
  },

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
