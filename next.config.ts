import BundleAnalyzer from "@next/bundle-analyzer";
import createNextIntlPlugin from "next-intl/plugin"; // Assurez-vous d'importer correctement
import type { NextConfig } from "next/types";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    position: "bottom-right",
  },
  transpilePackages: ["sanity", "@smithy"],
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
      {
        protocol: "https",
        hostname: "fm4all-dev-files.s3.eu-west-3.amazonaws.com",
      },
    ],
  },
  experimental: {
    useCache: true,
  },
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
      ],
    },
    {
      source: "/:path*",
      has: [{ type: "host", value: "fm4all.vercel.app" }],
      headers: [{ key: "X-Robots-Tag", value: "noindex" }],
    },
  ],
};

const withBundleAnalyzer = BundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(withBundleAnalyzer(nextConfig));
