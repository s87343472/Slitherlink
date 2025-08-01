import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 生产环境配置
  output: 'standalone', // 支持独立部署
  
  // 环境变量配置
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // 生产环境API代理配置
  async rewrites() {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/api/:path*',
          destination: `http://localhost:${process.env.BACKEND_PORT || 8000}/api/:path*`,
        },
      ];
    }
    return [];
  },
  
  // 性能优化
  compress: true,
  poweredByHeader: false,
  
  // 静态资源优化
  images: {
    unoptimized: false,
  },
  
  // 构建优化
  experimental: {
    optimizeCss: true,
  },
  
  // 安全头配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
