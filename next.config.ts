import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Оптимизация для разработки
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // Оптимизация компиляции
  typescript: {
    // В production проверять типы, в dev - пропустить для скорости
    ...(process.env.NODE_ENV === 'development' && {
      ignoreBuildErrors: false,
    }),
  },
};

export default nextConfig;
