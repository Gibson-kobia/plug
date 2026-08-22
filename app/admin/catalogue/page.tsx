import React from 'react';
import { getAllProducts } from '@/lib/product-data';
import { CatalogueQualityClient } from '@/components/admin/CatalogueQualityClient';

export const dynamic = 'force-dynamic';

export default function AdminCatalogueQualityPage() {
  const products = getAllProducts();

  return <CatalogueQualityClient products={products} />;
}
