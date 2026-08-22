import Link from 'next/link';
import { Package, Shield, Truck, Headphones, MapPin, Phone, Mail } from 'lucide-react';
import { CATEGORIES } from '@/lib/catalogue';

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-t-neutral-200 bg-navy-900 text-neutral-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-copper-500 to-copper-700 text-white shadow-md">
                <Package size={22} strokeWidth={1.75} />
              </span>
              <div>
                <div className="font-display text-lg font-bold text-white">Kenya Electronics</div>
                <div className="-mt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-copper-400">
                  Marketplace
                </div>
              </div>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
              Kenya&rsquo;s marketplace for new and verified electronics. Direct WhatsApp inquiries, 8 Nairobi delivery zones, and countrywide dispatch.
            </p>
            <div className="mt-6 space-y-2.5 text-sm text-neutral-400">
              <div className="flex items-center gap-2">
                <MapPin size={14} strokeWidth={1.75} className="shrink-0 text-copper-400" />
                <span>Nairobi, Kenya · Countrywide delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} strokeWidth={1.75} className="shrink-0 text-copper-400" />
                <a
                  href="https://wa.me/254798021312?text=Hello%20Plugke"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp: 0798021312
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} strokeWidth={1.75} className="shrink-0 text-copper-400" />
                <span>support@plugke.co.ke</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Shop</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {CATEGORIES.slice(0, 7).map(cat => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`} className="text-neutral-400 hover:text-copper-400 transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">More</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {CATEGORIES.slice(7).map(cat => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`} className="text-neutral-400 hover:text-copper-400 transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Why Buy From Us</h4>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Shield size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-jade-500" />
                <div>
                  <p className="font-medium text-white">Verified Sellers</p>
                  <p className="text-xs text-neutral-400">KYC-verified sellers, moderated listings</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Truck size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-copper-400" />
                <div>
                  <p className="font-medium text-white">Same-Day Nairobi</p>
                  <p className="text-xs text-neutral-400">8 Nairobi delivery zones + nationwide</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Headphones size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-navy-400" />
                <div>
                  <p className="font-medium text-white">WhatsApp Support</p>
                  <p className="text-xs text-neutral-400">Fast order confirmations via WhatsApp</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-t-white/10 pt-6 text-xs text-neutral-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Kenya Electronics Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-neutral-300">Terms</Link>
            <Link href="/privacy" className="hover:text-neutral-300">Privacy</Link>
            <Link href="/sellers" className="hover:text-neutral-300">Sell on Marketplace</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
