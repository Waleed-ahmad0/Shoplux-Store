/** @type {import('next').NextConfig} */
const nextConfig = {
   images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allows any HTTPS domain
      },
    ],
    // Allow local images from uploads folder
    unoptimized: false,
  },
};

export default nextConfig;
