/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/rakam-landing.html',
      },
    ];
  },
};

export default nextConfig;
