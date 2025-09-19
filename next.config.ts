import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker builds
  output: "standalone",
  
  // Optimize for production builds
  swcMinify: true,
  
  // Enable experimental features for better performance
  experimental: {
    // Enable optimizeCss for better CSS optimization
    optimizeCss: true,
    // Enable optimizePackageImports for better tree shaking
    optimizePackageImports: ["lucide-react", "@radix-ui/react-dialog", "@radix-ui/react-label", "@radix-ui/react-slot"],
  },
  
  // Configure image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    domains: ["firebasestorage.googleapis.com"],
  },
  
  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
