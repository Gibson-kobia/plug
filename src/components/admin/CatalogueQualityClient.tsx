'use client';

import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Cpu,
  Smartphone,
  Laptop,
  Layers,
  Filter,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { enrichProductSpecification } from '@/lib/product-spec-engine';
import { Badge } from '@/components/ui/badge';
import type { NormalizedProduct } from '@/types';

interface CatalogueQualityClientProps {
  products: NormalizedProduct[];
}

export function CatalogueQualityClient({ products }: CatalogueQualityClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'verified_specs' | 'unverified_specs' | 'verified_price' | 'needs_review'>('all');

  const enrichedProducts = useMemo(() => {
    return products.map((p) => {
      const enriched = enrichProductSpecification(p);
      return {
        product: p,
        enriched,
        isVerifiedSpec: enriched.trust.verificationStatus === 'verified',
        isVerifiedPrice: p.marketPriceStatus === 'VERIFIED',
      };
    });
  }, [products]);

  const stats = useMemo(() => {
    const total = enrichedProducts.length;
    const verifiedSpecs = enrichedProducts.filter((p) => p.isVerifiedSpec).length;
    const verifiedPrices = enrichedProducts.filter((p) => p.isVerifiedPrice).length;
    const needsReview = enrichedProducts.filter((p) => p.product.needsReview || p.product.confidence === 'LOW').length;

    return {
      total,
      verifiedSpecs,
      verifiedPrices,
      needsReview,
      specCompletenessPct: total > 0 ? Math.round((verifiedSpecs / total) * 100) : 0,
      priceCompletenessPct: total > 0 ? Math.round((verifiedPrices / total) * 100) : 0,
    };
  }, [enrichedProducts]);

  const filteredItems = useMemo(() => {
    return enrichedProducts.filter(({ product, isVerifiedSpec, isVerifiedPrice }) => {
      if (filterType === 'verified_specs' && !isVerifiedSpec) return false;
      if (filterType === 'unverified_specs' && isVerifiedSpec) return false;
      if (filterType === 'verified_price' && !isVerifiedPrice) return false;
      if (filterType === 'needs_review' && !product.needsReview && product.confidence !== 'LOW') return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          product.displayName.toLowerCase().includes(q) ||
          (product.brand && product.brand.toLowerCase().includes(q)) ||
          product.productId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [enrichedProducts, filterType, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-6 h-6 text-amber-400" />
            Catalogue Data Quality & Verification Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Audit hardware specifications, provenance benchmarks, and Kenyan pricing confidence across {stats.total} catalogue products.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Catalogue Total</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2">{stats.total}</p>
          <span className="text-xs text-slate-400 mt-1 block">Live normalized electronics</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Verified Specifications</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            {stats.verifiedSpecs}{' '}
            <span className="text-xs font-normal text-slate-400">({stats.specCompletenessPct}%)</span>
          </p>
          <span className="text-xs text-slate-400 mt-1 block">Authoritative manufacturer match</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Kenyan Price Benchmarked</span>
            <FileSpreadsheet className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-sky-400 mt-2">
            {stats.verifiedPrices}{' '}
            <span className="text-xs font-normal text-slate-400">({stats.priceCompletenessPct}%)</span>
          </p>
          <span className="text-xs text-slate-400 mt-1 block">PhonePlace Kenya / Avechi grounded</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Flagged for Review</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">{stats.needsReview}</p>
          <span className="text-xs text-slate-400 mt-1 block">Uncertain titles or low confidence</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search by model, brand, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {[
            { key: 'all', label: 'All Items' },
            { key: 'verified_specs', label: 'Verified Specs' },
            { key: 'unverified_specs', label: 'Unverified Specs' },
            { key: 'verified_price', label: 'Verified Price' },
            { key: 'needs_review', label: 'Needs Review' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                filterType === tab.key
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Product Name & ID</th>
              <th className="px-4 py-3">Hardware Specs Extracted</th>
              <th className="px-4 py-3">Kenyan Price (KES)</th>
              <th className="px-4 py-3">Provenance Source</th>
              <th className="px-4 py-3">Quality Status</th>
              <th className="px-4 py-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredItems.slice(0, 100).map(({ product, enriched, isVerifiedSpec, isVerifiedPrice }) => (
              <tr key={product.productId} className="hover:bg-slate-800/40 transition">
                <td className="px-4 py-3 max-w-xs">
                  <div className="font-medium text-slate-100 line-clamp-1">
                    {product.displayName}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    {product.productId} • {product.categoryName || 'General'}
                  </div>
                </td>

                <td className="px-4 py-3 text-xs">
                  {enriched.hardware.processor || enriched.hardware.ramGb || enriched.hardware.storageGb ? (
                    <div className="space-y-0.5 text-slate-300">
                      {enriched.hardware.processor && <div>{enriched.hardware.processor}</div>}
                      <div className="text-slate-400">
                        {enriched.hardware.ramGb ? `${enriched.hardware.ramGb}GB RAM` : ''}
                        {enriched.hardware.ramGb && enriched.hardware.storageGb ? ' / ' : ''}
                        {enriched.hardware.storageGb ? `${enriched.hardware.storageGb}GB Storage` : ''}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-500 italic">No structured hardware specs</span>
                  )}
                </td>

                <td className="px-4 py-3 font-medium text-slate-200">
                  {product.marketRefPriceKes ? (
                    <div>
                      <span>KSh {product.marketRefPriceKes.toLocaleString()}</span>
                      {product.marketPriceSource && (
                        <div className="text-[11px] text-slate-500 line-clamp-1">{product.marketPriceSource}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-500 text-xs">Unpriced</span>
                  )}
                </td>

                <td className="px-4 py-3 text-xs text-slate-400">
                  {enriched.trust.source}
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {isVerifiedSpec ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Spec Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                        Unverified
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3 text-right">
                  <a
                    href={`/product/${product.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 px-2 py-1 rounded bg-slate-800 border border-slate-700"
                  >
                    <span>View PDP</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
