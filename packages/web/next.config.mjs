/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Allow importing from @upskilled/core workspace package
    externalDir: true,
  },
};

export default nextConfig;
