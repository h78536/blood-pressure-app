/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除或注释掉 output: 'export'
  // output: 'export', 
  
  // 改为使用默认的SSG/SSR模式
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig