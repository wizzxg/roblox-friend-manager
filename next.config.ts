/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, 
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }, // This allows all external profile pictures to load safely
    ],
  },
};

export default nextConfig;