import { STATIC_PAGES, fetchLanguages, fetchSitemapData } from './sitemapCommon';

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_WEB_URL;
const EXCLUDED_ROUTES = ['/404', '/sitemap', '/api'];

const STATIC_ROUTES = STATIC_PAGES.map((page) => page.path);


/**
 * Escape special XML characters to prevent XML parsing errors
 * XML requires certain characters to be escaped:
 * - & becomes &amp;
 * - < becomes &lt;
 * - > becomes &gt;
 * - " becomes &quot;
 * - ' becomes &apos;
 * 
 * This is critical for URLs that might contain ampersands or other special characters
 * 
 * @param {string} text - Text to escape for XML
 * @returns {string} - Escaped text safe for XML
 */
const escapeXml = (text) => {
  if (typeof text !== 'string') {
    return String(text);
  }

  // Escape XML special characters in order of importance
  // Must escape & first, otherwise we'd double-escape already escaped entities
  return text
    .replace(/&/g, '&amp;')   // Escape ampersands first
    .replace(/</g, '&lt;')      // Escape less-than
    .replace(/>/g, '&gt;')      // Escape greater-than
    .replace(/"/g, '&quot;')    // Escape double quotes
    .replace(/'/g, '&apos;');   // Escape single quotes
};

// Determine how often a page changes for search engine crawlers
// This helps search engines know how often to check for updates
// All pages are set to weekly frequency for consistent crawling
export const getChangeFrequency = (route) => {
  // All pages use weekly change frequency
  return 'weekly';
};

// Set priority for pages (0.0 to 1.0)
// Higher priority pages are considered more important by search engines
export const getPriority = (route) => {
  // Homepage has highest priority
  if (route === '/') return 1.0;

  // Main listing pages
  if (['/services', '/providers', '/blogs'].includes(route)) return 0.9;

  // Service category pages (high priority as they are main navigation)
  if (route.startsWith('/service/') && route.split('/').length === 3) return 0.85;

  // Individual dynamic pages (services under providers, providers, blog posts)
  if (route.startsWith('/provider-details/')) return 0.8;
  if (route.startsWith('/blog-details/')) return 0.8;

  // Static pages
  if (['/about-us', '/contact-us'].includes(route)) return 0.8;

  // All other pages
  return 0.7;
};

// Convert a file path to a route URL
// Handles Next.js conventions: index files, dynamic routes, etc.
const getRouteFromPage = (filePath) => {
  // Remove the pages directory prefix
  const relativePath = filePath.replace(/^src[\\/]+pages[\\/]+/, '');

  // Skip API routes
  if (relativePath.startsWith('api/')) return null;

  // Remove file extensions
  const parsedPath = relativePath.replace(/\.(jsx?|tsx?|mdx)$/, '');

  // Skip dynamic routes (pages with brackets like [id].jsx)
  if (parsedPath.includes('[')) {
    return null;
  }

  // Convert index files to their directory path
  const normalizedPath = parsedPath === 'index'
    ? ''
    : parsedPath.replace(/index$/, '').replace(/\/+$/, '');

  // Ensure route starts with / and has no double slashes
  return `/${normalizedPath}`.replace(/\/\/+/g, '/');
};

// Build alternate language links for a route
// This helps search engines understand language variations of the same page
const buildAlternateLinks = (route, allLanguages, baseUrl) => {
  const safeRoute = route === '/' ? '' : route;

  // Create alternate link for each language
  // Escape URLs to prevent XML parsing errors from special characters
  const alternateLinks = allLanguages
    .map((lang) => {
      const alternateUrl = route === '/'
        ? `${baseUrl}/?lang=${lang.langCode}`
        : `${baseUrl}${safeRoute}?lang=${lang.langCode}`;
      // Escape the URL before inserting into XML
      const escapedUrl = escapeXml(alternateUrl);
      return `    <xhtml:link rel="alternate" hreflang="${lang.langCode}" href="${escapedUrl}" />`;
    })
    .join('\n');

  // Add x-default for default language
  const defaultLang = allLanguages[0]?.langCode || 'en';
  const defaultUrl = route === '/'
    ? `${baseUrl}/?lang=${defaultLang}`
    : `${baseUrl}${safeRoute}?lang=${defaultLang}`;
  // Escape the default URL before inserting into XML
  const escapedDefaultUrl = escapeXml(defaultUrl);
  const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapedDefaultUrl}" />`;

  return `${xDefault}\n${alternateLinks}`;
};

// Build a complete URL entry for the sitemap XML
// Includes location, metadata, and language alternatives
const buildUrlEntry = (route, langCode, allLanguages, baseUrl) => {
  const safeRoute = route === '/' ? '' : route;

  // Build the full URL with language parameter
  const url = route === '/'
    ? `${baseUrl}/?lang=${langCode}`
    : `${baseUrl}${safeRoute}?lang=${langCode}`;

  // Escape the URL to prevent XML parsing errors from special characters
  // This is critical - URLs might contain & or other XML special characters
  const escapedUrl = escapeXml(url);

  // Get current date in ISO format for lastmod
  const lastModified = new Date().toISOString();

  // Get change frequency and priority for this route
  const changeFreq = getChangeFrequency(route);
  const priority = getPriority(route);

  // Get alternate language links for this route
  const alternateLinks = buildAlternateLinks(route, allLanguages, baseUrl);

  // Return complete URL entry in valid XML format with proper indentation
  // Each element on its own line for proper XML formatting
  // Use escaped URL to ensure valid XML
  return [
    '  <url>',
    `    <loc>${escapedUrl}</loc>`,
    `    <lastmod>${lastModified}</lastmod>`,
    `    <changefreq>${changeFreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    alternateLinks,
    '  </url>'
  ].join('\n');
};

// Format XML for readability
// Keep it simple - just ensure proper line breaks and basic indentation
const formatXml = (xml) => {
  // Just return the XML as-is with clean line breaks
  // The XML is already properly formatted when built
  return xml.trim();
};

// Re-export common functions and constants for backward compatibility
export { STATIC_PAGES };
export { getHumanSitemapData } from './sitemapCommon';
export const getLanguages = fetchLanguages;
export const formatSitemapXml = formatXml;


