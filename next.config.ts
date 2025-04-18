import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `async_hooks` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'async_hooks': false,
        'fs': false,
        'net': false,
        'tls': false,
        'perf_hooks': false,
        'child_process': false,
        'http2': false,
        'process': require.resolve('process/browser'),
      };
    }
    
    return config;
  },
};

export default nextConfig;
