import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://electronics.co.ke';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/seller/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
