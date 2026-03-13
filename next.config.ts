import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: "build",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  webpack: (config, { dev, isServer }) => {
    // Handle node modules that need to be treated as ES modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      path: false,
      os: false,
      util: false,
      buffer: false,
    };

    // Handle pino-pretty and other problematic modules
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push(
        'pino-pretty',
        'encoding',
        '@walletconnect/logger'
      );
    }

    // Ignore specific modules that cause issues
    config.resolve.alias = {
      ...config.resolve.alias,
      'pino-pretty': false,
      'encoding': false,
    };

    // Add module resolution for ES modules
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });

    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 10,
            },
            common: {
              name: 'common',
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },
};

export default nextConfig;
