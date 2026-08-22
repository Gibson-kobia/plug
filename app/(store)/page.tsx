import type { Metadata } from 'next';
import { HomePageContent } from '@/components/layout/HomePageContent';
import {
  getFeaturedProducts,
  getProductsByCategory,
  getCategoryStats,
} from '@/lib/product-data';
import { CATEGORIES } from '@/lib/catalogue';
import type { NormalizedProduct } from '@/types';

export const metadata: Metadata = {
  title: 'Kenya Electronics Marketplace — Smartphones, Laptops, TVs, Audio',
  description:
    "Kenya's trusted electronics marketplace. Shop new and used smartphones, laptops, TVs, earbuds and more from verified sellers with WhatsApp-first checkout.",
};

export default function StoreHomePage() {
  // Load small curated set of featured products
  const featuredProducts = getFeaturedProducts(6);

  // Load small subset (up to 4 products) for EACH authoritative category
  const categoryProductsMap: Record<string, NormalizedProduct[]> = {};
  for (const cat of CATEGORIES) {
    categoryProductsMap[cat.id] = getProductsByCategory(cat.id, 4);
  }

  const categoryStats = getCategoryStats();

  return (
    <HomePageContent
      categories={CATEGORIES}
      featuredProducts={featuredProducts}
      categoryProductsMap={categoryProductsMap}
      categoryStats={categoryStats}
    />
  );
}

