import { NextResponse, type NextRequest } from 'next/server';
import { getFeaturedProducts, getTrendingProducts, getRecentProducts, searchProducts, getProductBySlug } from '@/lib/product-data';
import type { SearchFilters } from '@/types';

export const dynamic = 'force-static';
export const revalidate = 86400;

type ProductsRouteContext = { params: { slug: string[] } };

export function GET(req: NextRequest, { params }: ProductsRouteContext) {
  try {
    const slug = params.slug?.[0] || '';
    const { searchParams } = new URL(req.url);
    const limit = Math.min(60, parseInt(searchParams.get('limit') || '30', 10) || 30);

    let result;
    switch (slug) {
      case 'featured':
        result = getFeaturedProducts(limit);
        break;
      case 'trending':
        result = getTrendingProducts(limit);
        break;
      case 'recent':
        result = getRecentProducts(limit);
        break;
      case 'search': {
        const q = searchParams.get('q');
        const categoryId = searchParams.get('categoryId');
        const subId = searchParams.get('subcategoryId');
        const page = parseInt(searchParams.get('page') || '1', 10) || 1;
        const pageSize = Math.min(60, parseInt(searchParams.get('pageSize') || '24', 10) || 24);
        const sortBy = (searchParams.get('sortBy') as any) || 'relevance';
        const searchFilters: SearchFilters = {};
        if (q) searchFilters.searchQuery = q;
        if (categoryId) searchFilters.categoryId = categoryId;
        if (subId) searchFilters.subcategoryId = subId;
        searchFilters.page = page;
        searchFilters.pageSize = pageSize;
        searchFilters.sortBy = sortBy;
        result = searchProducts(searchFilters);
        break;
      }
      case 'by-slug': {
        const productSlug = searchParams.get('slug');
        if (!productSlug) return NextResponse.json({ error: 'slug required' }, { status: 400 });
        result = getProductBySlug(productSlug);
        if (!result) return NextResponse.json({ error: 'not found' }, { status: 404 });
        break;
      }
      default:
        return NextResponse.json({ error: 'unknown route' }, { status: 404 });
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
