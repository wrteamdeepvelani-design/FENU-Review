/**
 * Dynamic XML Sitemap Generator for Next.js 14 (Pages Router)
 *
 * This file generates a valid XML sitemap at /sitemap.xml
 * It follows Google's sitemap protocol and includes:
 * - All static pages
 * - Dynamic routes (discovered from pages directory)
 * - Multi-language support with hreflang tags
 * - SEO metadata (priority, changefreq, lastmod)
 *
 * Compatible with Next.js 14.2.33 (Pages Router)
 * 
 * Conditional rendering:
 * - If NEXT_PUBLIC_ENABLE_SEO="true" → uses getServerSideProps (server-side rendering)
 * - If NEXT_PUBLIC_ENABLE_SEO="false" or not set → sitemap is generated statically
 * 
 * We intentionally avoid importing sitemapBuilder at the top level.
 * Instead we dynamically import it inside getServerSideProps so Node-only
 * dependencies like globby never end up in the client bundle during build.
 */

/**
 * Determine the base URL for the sitemap
 * Uses environment variables and request headers
 */
const resolveBaseUrl = (req) => {
  // In development, build URL dynamically from request headers
  if (process.env.NODE_ENV === 'development' && req) {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host || 'localhost:3000';
    return `${protocol}://${host}`;
  }

  // In production, use the configured public web URL
  return process.env.NEXT_PUBLIC_WEB_URL;
};

const FALLBACK_ROUTES = [
  '/',
  '/about-us',
  '/contact-us',
  '/faqs',
  '/blogs',
  '/services',
  '/providers',
  '/become-provider',
  '/privacy-policy',
  '/terms-and-conditions',
];

const buildFallbackSitemap = (baseUrl) => {
  const safeBaseUrl = baseUrl || process.env.NEXT_PUBLIC_WEB_URL;

  const urlEntries = FALLBACK_ROUTES.map((route) => {
    const safeRoute = route === '/' ? '' : route;
    return [
      '  <url>',
      `    <loc>${safeBaseUrl}${safeRoute}</loc>`,
      `    <lastmod>${new Date().toISOString()}</lastmod>`,
      '    <changefreq>weekly</changefreq>',
      '    <priority>0.7</priority>',
      '  </url>',
    ].join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '  <!-- Fallback sitemap generated due to runtime error -->',
    ...urlEntries,
    '</urlset>',
  ].join('\n');
};

// Conditionally export getServerSideProps (like other pages do)
// When SEO is enabled: export the handler function (server-side API calls for sitemap)
// When SEO is disabled: export null (Next.js will ignore it)
let serverSidePropsFunction = null;

if (process.env.NEXT_PUBLIC_ENABLE_SEO === "true") {
  /**
   * Server-side function to generate and serve the XML sitemap.
   * This runs on every request to /sitemap.xml when SEO is enabled.
   * 
   * We end the response manually here — preventing React from rendering anything.
   */
  serverSidePropsFunction = async ({ req, res }) => {
    const baseUrl = resolveBaseUrl(req);

    try {
      // Dynamic import keeps Node-only dependencies out of the client bundle
      const { generateSitemapXml } = await import('@/utils/sitemapBuilder');
      const sitemapXml = await generateSitemapXml({ baseUrl });

      // ✅ Always set headers before writing data
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader(
        'Cache-Control',
        'public, s-maxage=3600, stale-while-revalidate=86400'
      );

      // ✅ Write XML directly
      res.end(sitemapXml);

      return { props: {} };
    } catch (error) {
      console.error('🚨 Failed to render sitemap.xml:', error);

      // Graceful fallback: return minimal sitemap instead of a 500
      const fallbackXml = buildFallbackSitemap(baseUrl);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader(
        'Cache-Control',
        'public, s-maxage=600, stale-while-revalidate=3600'
      );
      res.end(fallbackXml);

      return { props: { fallback: true } };
    }
  };
}

export const getServerSideProps = serverSidePropsFunction;

// 🪶 This component renders nothing (response is already sent in getServerSideProps)
const Sitemap = () => null;

export default Sitemap;
