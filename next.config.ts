import BundleAnalyzer from "@next/bundle-analyzer";
import createNextIntlPlugin from "next-intl/plugin"; // Assurez-vous d'importer correctement
import type { NextConfig } from "next/types";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["sanity"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "6njvcatb4pcugmyl.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
  experimental: {
    useCache: true,
  },
};

const withBundleAnalyzer = BundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(withBundleAnalyzer(nextConfig));
