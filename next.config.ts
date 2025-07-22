import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ulqf2xmuzjhvhqg7.public.blob.vercel-storage.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
