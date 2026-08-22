import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const baseUrl = rawSiteUrl && rawSiteUrl !== ''
    ? rawSiteUrl
    : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://electronics.co.ke');
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/seller/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
