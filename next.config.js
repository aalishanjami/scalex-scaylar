/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers for internal dashboard
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },

  // Redirect all traffic to HTTPS
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "(?!localhost).*",
          },
        ],
        permanent: true,
        destination: "https://:path*",
      },
    ];
  },

  // Enable React strict mode for better development
  reactStrictMode: true,

  // Optimize image handling
  images: {
    domains: ["localhost"],
    unoptimized: process.env.NODE_ENV === "development",
  },

  // Enable experimental features
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ["@prisma/client"],
  },

  // Disable automatic static optimization for internal dashboard
  staticPageGenerationTimeout: 0,

  // Enable source maps in production for better error tracking
  productionBrowserSourceMaps: true,

  // Configure build output
  distDir: ".next",
  compress: true,

  // ESLint during builds
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint checking during builds
    dirs: ["app", "components", "lib", "hooks"], // Specify directories to lint
  },

  // TypeScript checking during builds
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript checking during builds
  },

  // Customize webpack config if needed
  webpack: (config, { dev, isServer }) => {
    // Add any custom webpack configurations here
    return config;
  },
};

module.exports = nextConfig;