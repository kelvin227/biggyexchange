import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kalajtomdzamxvkl.public.blob.vercel-storage.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
