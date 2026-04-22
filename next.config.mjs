/** @type {import('next').NextConfig} */

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
const domain = apiUrl ? (apiUrl.replace(/^https?:\/\//, "").split("/api")[0]) : "localhost";

const nextConfig = {
  reactStrictMode: true,
  // Explicitly set the project root for Turbopack to resolve the workspace warning
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: domain,
      },
    ],
    unoptimized: false,
  },
  devIndicators: {
    buildActivity: false,
  },




  // Headers configuration
  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

// Output mode based on SEO setting
// When SEO is enabled (true): Use standalone for optimized server-side rendering
// When SEO is disabled (false): Use static export for simple hosting
if (process.env.NEXT_PUBLIC_ENABLE_SEO === "false") {
  nextConfig.output = "export";
}

export default nextConfig;