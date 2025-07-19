import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // Handle ES modules transpilation
  transpilePackages: ['next-swagger-doc'],

  // Experimental features for better module handling
  experimental: {
    esmExternals: true,
  },

  // Allow cross-origin requests in development
  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:3000',
    'localhost:3001',
    '127.0.0.1:3001',
    // Add local network IP for mobile testing
    '192.168.1.0/24',
    '10.0.0.0/24',
    // Add any other development domains you might use
  ],

  // Development server configuration
  ...(process.env.NODE_ENV === 'development' && {
    devIndicators: {
      buildActivity: true,
      buildActivityPosition: 'bottom-right',
    },
  }),

  // Webpack configuration for module handling
  webpack: (config: any) => {
    // Handle YAML and other ES modules properly
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },

  // Handle CORS for development and production
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';

    return [
      {
        source: "/_next/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: isDev ? "*" : "https://sparks.help",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Requested-With",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: isDev ? "*" : "https://sparks.help",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Requested-With",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
        ],
      },
    ];
  },
  /* config options here */
};

export default nextConfig;
