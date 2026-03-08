import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/macro',
        destination: '/boletim-focus',
        permanent: true, // 301
      },
    ]
  },
};

export default nextConfig;
