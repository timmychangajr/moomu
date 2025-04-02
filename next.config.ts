import type { NextConfig } from "next";

export const hostnames = [
  'images.unsplash.com',
  'serpapi.com',
  'i.imgur.com',
  'encrypted-tbn0.gstatic.com'
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: hostnames.map(hostname => ({
      protocol: 'https',
      hostname
    }))
  },
}

export default nextConfig;
