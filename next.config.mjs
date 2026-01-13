/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['@react-pdf/renderer'],
}

export default nextConfig
