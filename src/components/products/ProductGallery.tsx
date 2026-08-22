'use client';

import * as React from 'react';
import { ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { NormalizedProduct } from '@/types';

export function ProductGallery({ product }: { product: NormalizedProduct }) {
  const [selectedImageUrl, setSelectedImageUrl] = React.useState(product.primaryImageUrl);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-neutral-100">
        <div className="relative aspect-square w-full bg-zinc-50">
          <img
            src={selectedImageUrl || product.primaryImageUrl}
            alt={product.brand ? `${product.brand} ${product.displayName}` : product.displayName}
            loading="eager"
            className="h-full w-full object-cover transition-opacity duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.visibility = 'hidden';
            }}
          />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {product.imageCount > 1 && (
              <Badge variant="warranty" className="bg-black/60 text-white hover:bg-black/60 backdrop-blur-sm">
                <ImageIcon size={10} strokeWidth={2} /> {product.imageCount} Photos
              </Badge>
            )}
          </div>
        </div>
      </div>

      {product.images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {product.images.slice(0, 8).map(img => {
            const isSelected = img.url === selectedImageUrl;
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelectedImageUrl(img.url)}
                className={`group relative aspect-square overflow-hidden rounded-xl bg-white ring-1 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-copper-400/50 ${
                  isSelected
                    ? 'ring-2 ring-copper-500 shadow-sm'
                    : 'ring-neutral-200 hover:ring-copper-400/50'
                }`}
                aria-label={`View photo ${img.filename || ''}`}
              >
                <img
                  src={img.url}
                  alt={img.filename || product.displayName}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.visibility = 'hidden';
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
