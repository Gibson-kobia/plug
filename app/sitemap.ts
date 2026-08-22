import { MetadataRoute } from 'next';
import { CATEGORIES } from '@/lib/catalogue';
import { getAllProducts } from '@/lib/product-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const baseUrl = rawSiteUrl && rawSiteUrl !== ''
    ? rawSiteUrl
    : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://electronics.co.ke');
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/search`, lastModified, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/cart`, lastModified, changeFrequency: 'always', priority: 0.5 },
    { url: `${baseUrl}/checkout`, lastModified, changeFrequency: 'always', priority: 0.5 },
    { url: `${baseUrl}/compare`, lastModified, changeFrequency: 'weekly', priority: 0.4 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const products = getAllProducts();
  const productRoutes: MetadataRoute.Sitemap = products.slice(0, 100).map((prod) => ({
    url: `${baseUrl}/product/${prod.slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
