import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, Shield, Scale, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Kenya Electronics Marketplace',
  description: 'Terms of Service and Marketplace Conditions for Kenya Electronics Marketplace (Plugke).',
};

export default function TermsPage() {
  return (
    <div id="main" className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-copper-200 bg-copper-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-copper-700">
          <Scale size={14} /> Legal & Compliance
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-heading sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Last updated: August 20, 2026 · Kenya Electronics Marketplace
        </p>
      </div>

      <div className="space-y-8 rounded-3xl bg-white p-6 shadow-card ring-1 ring-neutral-100 sm:p-10">
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-heading">1. Marketplace Overview</h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            Kenya Electronics Marketplace (&quot;Plugke&quot;, &quot;we&quot;, &quot;our&quot;) operates an online marketplace and catalogue platform connecting buyers with verified electronics sellers across Kenya. By accessing our platform, browsing product listings, reserving items, or placing order inquiries, you agree to comply with and be bound by these Terms of Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-heading">2. Product Catalogue &amp; Market Reference Pricing</h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            Our catalogue displays authentic product specifications and imagery served from high-resolution Content Delivery Networks. Where indicated, &quot;Kenyan Market Reference Price&quot; represents researched retail market benchmarks gathered from established Kenyan retailers. Market reference pricing provides market guidance and does not guarantee stock availability or final seller pricing until confirmed by an authorized merchant via our order communication channels.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-heading">3. Order Reservations &amp; WhatsApp Checkout</h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            Orders placed on the platform generate unique verifiable order reference codes and allow direct communication with seller coordinators through official WhatsApp channels. A placed order inquiry or cart reservation does not constitute a final binding sale until availability is confirmed and payment is executed via approved Kenyan payment rails (including M-Pesa).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-heading">4. Delivery &amp; Fulfillment</h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            Fulfillment options include scheduled local deliveries across designated Nairobi metropolitan zones and courier dispatch across all 47 counties in Kenya. Delivery timelines and delivery fees depend on the selected zone and local courier operations. Customers are encouraged to inspect products upon receipt.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-heading">5. Warranties &amp; Returns</h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            Warranty terms, if applicable, are determined by the manufacturer or the merchant fulfilling the order. Customers are advised to confirm warranty certificates and return windows prior to final purchase confirmation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-heading">6. Contact &amp; Inquiries</h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            For questions regarding these terms, product inquiries, or merchant dispute resolution, reach out to customer operations via our official WhatsApp channel or by visiting our <Link href="/sellers" className="font-semibold text-copper-600 hover:underline">Seller Hub</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
