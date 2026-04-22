import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const STATIC_PAGES = [
    { path: '/', label: 'Home' },
    { path: '/about-us', label: 'About Us' },
    { path: '/contact-us', label: 'Contact Us' },
    { path: '/faqs', label: 'FAQs' },
    { path: '/blogs', label: 'Blogs' },
    { path: '/services', label: 'Services' },
    { path: '/providers', label: 'Providers' },
    { path: '/become-provider', label: 'Become a Provider' },
    { path: '/privacy-policy', label: 'Privacy Policy' },
    { path: '/terms-and-conditions', label: 'Terms & Conditions' },
];

/**
 * Format a slug into a readable label
 */
export const formatLabelFromSlug = (slug = '') =>
    slug
        .replace(/[-_]/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .trim();

/**
 * Fetch available languages from the API
 */
export const fetchLanguages = async () => {
    if (process.env.NEXT_PUBLIC_ENABLE_SEO !== "true") {
        console.log('📌 SEO disabled: Using default language (en) only');
        return [{ langCode: 'en', language: 'English' }];
    }

    if (!API_URL) {
        console.warn('API URL not defined, using default English');
        return [{ langCode: 'en', language: 'English' }];
    }

    try {
        const response = await axios.get(`${API_URL}get_language_list`, {
            timeout: 10000,
        });

        const languageList = response?.data?.data;

        if (!Array.isArray(languageList) || languageList.length === 0) {
            console.warn('Language API returned empty list, using default English');
            return [{ langCode: 'en', language: 'English' }];
        }

        return languageList
            .map((lang) => ({
                langCode: (lang.code || lang.langCode || '').toLowerCase(),
                language: lang.language || lang.name || lang.langCode,
            }))
            .filter((lang) => lang.langCode && lang.langCode.length >= 2);
    } catch (error) {
        console.error('Error fetching languages:', error.message);
        return [{ langCode: 'en', language: 'English' }];
    }
};

/**
 * Fetch all sitemap data from the dedicated API endpoint
 */
export const fetchSitemapData = async (langCode = 'en') => {
    if (process.env.NEXT_PUBLIC_ENABLE_SEO !== "true") {
        console.log('📌 SEO disabled: Skipping sitemap data API call');
        return { categories: [], providers: [], blogs: [], services: [] };
    }

    if (!API_URL) {
        console.warn('API URL not defined, returning empty sitemap data');
        return { categories: [], providers: [], blogs: [], services: [] };
    }

    try {
        const response = await axios.get(`${API_URL}get_site_map_data`, {
            timeout: 15000,
            headers: {
                'Content-Language': langCode,
            },
        });

        if (response?.data?.error === true) {
            console.warn('Sitemap API returned error:', response?.data?.message);
            return { categories: [], providers: [], blogs: [], services: [] };
        }

        const data = response?.data?.data || {};

        const categories = Array.isArray(data.categories) ? data.categories : [];
        const providers = Array.isArray(data.providers) ? data.providers : [];
        const blogs = Array.isArray(data.blogs) ? data.blogs : [];
        const services = Array.isArray(data.services) ? data.services : [];

        console.log(`✅ Sitemap API returned (lang: ${langCode}):`);
        console.log(`   - ${categories.length} categories`);
        console.log(`   - ${providers.length} providers`);
        console.log(`   - ${blogs.length} blogs`);
        console.log(`   - ${services.length} services`);

        return { categories, providers, blogs, services };
    } catch (error) {
        console.error('Error fetching sitemap data:', error.message);
        return { categories: [], providers: [], blogs: [], services: [] };
    }
};

/**
 * Get human-readable sitemap data for the sitemap page
 */
export const getHumanSitemapData = async (langCode = 'en') => {
    const { categories, providers, blogs, services } = await fetchSitemapData(langCode);

    return {
        pages: STATIC_PAGES.map((page) => ({
            label: page.label,
            href: page.path,
        })),
        categories: categories
            .filter((cat) => cat.slug)
            .map((cat) => ({
                label: cat.title || formatLabelFromSlug(cat.slug),
                href: `/service/${cat.slug}`,
            })),
        blogs: blogs
            .filter((blog) => blog.slug)
            .map((blog) => ({
                label: blog.title || formatLabelFromSlug(blog.slug),
                href: `/blog-details/${blog.slug}`,
            })),
        services: services
            .filter((service) => service.slug && service.provider_slug)
            .map((service) => ({
                label: service.title || formatLabelFromSlug(service.slug),
                href: `/provider-details/${service.provider_slug}/${service.slug}`,
                provider: service.company_name || service.provider_slug,
            })),
        providers: providers
            .filter((provider) => provider.slug)
            .map((provider) => ({
                label: provider.title || provider.company_name || formatLabelFromSlug(provider.slug),
                href: `/provider-details/${provider.slug}`,
            })),
    };
};
