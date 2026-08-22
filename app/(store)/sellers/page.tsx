import type { Metadata } from 'next';
import Link from 'next/link';
import { Store, ShieldCheck, TrendingUp, MessageCircle, Truck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Sell on Kenya Electronics Marketplace | Merchant Hub',
  description: 'Join Kenya Electronics Marketplace as an electronics vendor. Reach customers across Nairobi and nationwide.',
};

export default function SellersPage() {
  const businessWhatsapp = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP_NO || '254798021312';
  const cleanPhone = businessWhatsapp.replace(/[^0-9]/g, '');
  const sellerInquiryUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello Plugke, I am interested in onboarding as an electronics merchant on Kenya Electronics Marketplace.')}`;

  return (
    <div id="main" className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Hero */}
      <div className="overflow-hidden rounded-3xl bg-navy-900 px-6 py-12 text-white shadow-2xl sm:px-12 sm:py-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-copper-400/30 bg-copper-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-copper-300">
            <Store size={14} /> Merchant Hub
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Grow your electronics business with Plugke.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-300 sm:text-lg">
            List your inventory on Kenya&apos;s fastest growing electronics platform. Receive verified customer orders directly via WhatsApp with integrated local fulfillment.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={sellerInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="whatsapp" className="w-full sm:w-auto">
                <MessageCircle size={18} className="mr-2" />
                Apply via WhatsApp
              </Button>
            </a>
            <Link href="/category/smartphones">
              <Button size="lg" variant="outline" className="w-full border-white/30 text-white hover:bg-white/10 sm:w-auto">
                Explore Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Value Pillars */}
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-neutral-100 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-copper-50 text-copper-600">
            <MessageCircle size={24} />
          </div>
          <h3 className="mt-5 font-display text-lg font-bold text-heading">Direct Customer Inquiries</h3>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            Orders route directly into WhatsApp with customer details, item quantities, and selected delivery zone pre-formatted.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-neutral-100 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-jade-50 text-jade-700">
            <Truck size={24} />
          </div>
          <h3 className="mt-5 font-display text-lg font-bold text-heading">Seamless Nairobi &amp; National Delivery</h3>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            Deliver across 8 Nairobi zones and dispatch across all 47 counties through our standardized dispatch workflow.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-neutral-100 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-50 text-navy-800">
            <ShieldCheck size={24} />
          </div>
          <h3 className="mt-5 font-display text-lg font-bold text-heading">Verified Merchant Identity</h3>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            Build buyer trust with verified merchant status, accurate catalogue mapping, and transparent product specifications.
          </p>
        </div>
      </div>

      {/* Requirements */}
      <div className="mt-12 rounded-3xl bg-white p-6 shadow-card ring-1 ring-neutral-100 sm:p-10">
        <h2 className="font-display text-2xl font-bold text-heading">Merchant Onboarding Requirements</h2>
        <p className="mt-1 text-sm text-neutral-500">
          To maintain marketplace quality, all electronics sellers must meet the following criteria:
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            'Valid Kenyan national ID / business registration',
            'Physical electronics store or verifiable warehouse location in Kenya',
            'Clear return policy and verifiable product warranties',
            'Active WhatsApp business phone number for order processing',
            'Commitment to competitive and transparent KES pricing',
            'Authentic product stock with genuine serial numbers'
          ].map((req, idx) => (
            <div key={idx} className="flex items-start gap-3 rounded-2xl bg-neutral-50 p-4">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-jade-600" />
              <span className="text-sm font-medium text-neutral-800">{req}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-neutral-100 pt-6 text-center sm:text-left">
          <a
            href={sellerInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-copper-600 hover:text-copper-700"
          >
            Start onboarding with Plugke merchant coordinator <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
