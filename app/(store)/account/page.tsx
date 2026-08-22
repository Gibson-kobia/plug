'use client';

import * as React from 'react';
import Link from 'next/link';
import { User, Heart, Package, ShieldCheck, MapPin, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWishlistStore } from '@/stores/wishlistStore';

export default function AccountPage() {
  const wishlistItems = useWishlistStore((s) => s.items);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div id="main" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-64 animate-pulse rounded-3xl bg-neutral-100" />
      </div>
    );
  }

  return (
    <div id="main" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-heading sm:text-3xl lg:text-4xl">
            My Account
          </h1>
          <p className="mt-1 text-xs text-neutral-500">Manage your orders, saved items, and account preferences</p>
        </div>
        <Badge variant="warranty" className="self-start sm:self-auto bg-copper-50 text-copper-700 border-copper-200">
          <ShieldCheck size={12} className="mr-1" /> Guest / Buyer Profile
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-card text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-copper-100 text-copper-700 text-2xl font-bold">
              KW
            </div>
            <h2 className="mt-3 font-bold text-heading text-lg">Kenya Buyer</h2>
            <p className="text-xs text-neutral-500">Guest Session Active</p>

            <div className="mt-6 border-t border-neutral-100 pt-4 space-y-2">
              <Link href="/account/wishlist" className="flex items-center justify-between rounded-xl p-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-50">
                <span className="flex items-center gap-2">
                  <Heart size={16} className="text-copper-600" /> Saved Wishlist
                </span>
                <Badge variant="secondary">{wishlistItems.length}</Badge>
              </Link>
              <Link href="/cart" className="flex items-center justify-between rounded-xl p-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-50">
                <span className="flex items-center gap-2">
                  <Package size={16} className="text-copper-600" /> Active Cart
                </span>
                <Badge variant="secondary">View</Badge>
              </Link>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-8 space-y-6">
          <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-heading flex items-center gap-2">
              <Package size={20} className="text-copper-600" /> Recent Order History
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              Orders created via WhatsApp guest checkout are saved locally in your active session.
            </p>
            <div className="mt-6 rounded-2xl border border-dashed border-neutral-200 p-8 text-center text-xs text-neutral-500">
              No recent verified orders found in this session context. Place an order via WhatsApp checkout to view reference tracking.
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-heading flex items-center gap-2">
              <MapPin size={20} className="text-copper-600" /> Saved Delivery Locations
            </h2>
            <div className="mt-4 rounded-2xl border border-neutral-100 bg-neutral-50/50 p-4 text-xs">
              <p className="font-semibold text-heading">Default Zone: Nairobi CBD & Central</p>
              <p className="mt-1 text-neutral-500">Standard Delivery ETA: 2–4 hours (KSh 200)</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
