/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Disable static optimization since this is an internal app
  staticPageGenerationTimeout: 0,
  experimental: {
    // Disable static exports for dynamic data
    isrMemoryCacheSize: 0,
    // Force server-side rendering
    workerThreads: false,
    cpus: 1,
  },
};

module.exports = nextConfig;