/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/rakam-landing.html',
      },
      {
        source: '/guide',
        destination: '/rakam-guide.html',
      },
    ];
  },
};

export default nextConfig;
