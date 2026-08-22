import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight, Home, Share2, Heart, ShoppingCart, Clock,
  MessageCircle, Shield, Truck, Package, AlertTriangle, Image as ImageIcon,
  CheckCircle2, ExternalLink,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Price } from '@/components/ui/price';
import {
  getAllProducts,
  getProductBySlug,
  getProductsByCategory,
  getProductBreadcrumbs,
} from '@/lib/product-data';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductGallery } from '@/components/products/ProductGallery';
import { ProductDetailInteractive } from '@/components/products/ProductDetailInteractive';
import type { NormalizedProduct } from '@/types';

interface ProductPageProps {
  params: { slug: string };
}

export const dynamicParams = true;

export function generateStaticParams() {
  try {
    const all = getAllProducts();
    // Pre-render top 20 featured products for instant loading; rest load dynamically
    return all.slice(0, 20).map(p => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export function generateMetadata({ params }: ProductPageProps): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return { title: 'Product Not Found' };
  const title = product.brand
    ? `${product.brand} ${product.displayName}`
    : product.displayName;
  const desc = product.categoryName
    ? `${title} — ${product.categoryName}. ${product.imageCount} images in the ImageKit catalogue.`
    : title;
  const ogImages = product.primaryImageUrl ? [{ url: product.primaryImageUrl }] : [];
  return {
    title: `${title} | Kenya Electronics Marketplace`,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: ogImages,
    },
  };
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const breadcrumbs = getProductBreadcrumbs(product);
  const related: NormalizedProduct[] = product.categoryId
    ? getProductsByCategory(product.categoryId, 7)
        .filter(p => p.productId !== product.productId)
        .slice(0, 6)
    : [];

  return (
    <div id="main" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-neutral-500 sm:text-sm">
        {breadcrumbs.map((b, idx) => (
          <span key={idx} className="flex items-center gap-1.5">
            {idx > 0 && <ChevronRight size={14} strokeWidth={2} className="text-neutral-300" />}
            {b.href ? (
              <Link href={b.href} className="hover:text-copper-600">
                {b.label}
              </Link>
            ) : (
              <span className="font-medium text-neutral-800">{b.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <ProductGallery product={product} />
        </section>

        <section className="min-w-0 lg:col-span-5">
          <div className="sticky top-24 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {product.brand && (
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-copper-600">
                    {product.brand}
                  </span>
                )}
                {product.confidence === 'LOW' || product.needsReview ? (
                  <Badge variant="low_stock">
                    <AlertTriangle size={10} strokeWidth={2} /> Pending Review
                  </Badge>
                ) : (
                  <Badge variant="verified">
                    <CheckCircle2 size={10} strokeWidth={2} /> ImageKit Verified
                  </Badge>
                )}
                {product.condition && (
                  product.condition.toLowerCase() === 'new'
                    ? <Badge variant="new">New</Badge>
                    : product.condition.toLowerCase() === 'used'
                      ? <Badge variant="used">Used</Badge>
                      : <Badge variant="warranty">{product.condition}</Badge>
                )}
                {product.sourceFolder && (
                  <Badge variant="warranty" className="bg-neutral-100 text-neutral-600 hover:bg-neutral-100">
                    <ImageIcon size={10} strokeWidth={2} />
                    {product.sourceFolder}
                  </Badge>
                )}
              </div>
              <h1 className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight text-heading sm:text-3xl">
                {product.displayName}
                {product.model && product.model !== product.displayName && (
                  <span className="ml-2 text-base font-semibold text-neutral-500 sm:text-lg">
                    {product.model}
                  </span>
                )}
              </h1>
              {(product.categoryName || product.subcategoryName) && (
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
                  {product.categoryName && (
                    <Link
                      href={breadcrumbs[1]?.href || '#'}
                      className="inline-flex items-center gap-1 hover:text-copper-600"
                    >
                      <Package size={12} strokeWidth={1.75} />
                      {product.categoryName}
                    </Link>
                  )}
                  {product.subcategoryName && (
                    <>
                      <span className="text-neutral-300">·</span>
                      <span>{product.subcategoryName}</span>
                    </>
                  )}
                  <span className="text-neutral-300">·</span>
                  <span>{product.imageCount} images</span>
                </div>
              )}
            </div>

            <ProductDetailInteractive product={product} />
          </div>
        </section>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper-600">
                You may also like
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-heading sm:text-3xl">
                Related in {product.categoryName || 'this category'}
              </h2>
            </div>
            {product.categoryName && breadcrumbs[1]?.href && (
              <Link
                href={breadcrumbs[1].href}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-copper-600 hover:text-copper-700"
              >
                View all <ChevronRight size={16} strokeWidth={2} />
              </Link>
            )}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
            {related.map(p => (
              <ProductCard key={p.productId} product={p} variant="compact" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
