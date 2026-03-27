/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // This bypasses the error in your screenshot
  },
};

export default nextConfig;