import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Kenya Electronics Marketplace',
  description: 'Privacy Policy and Data Protection guidelines for Kenya Electronics Marketplace.',
};

export default function PrivacyPage() {
  return (
    <div id="main" className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-jade-200 bg-jade-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-jade-800">
          <Lock size={14} /> Data Protection &amp; Privacy
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-heading sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Last updated: August 20, 2026 · Compliant with the Kenya Data Protection Act, 2019
        </p>
      </div>

      <div className="space-y-8 rounded-3xl bg-white p-6 shadow-card ring-1 ring-neutral-100 sm:p-10">
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-heading">1. Information We Collect</h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            When you interact with Kenya Electronics Marketplace, we collect information necessary to facilitate order inquiries, customer service, and secure fulfillment:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-600">
            <li><strong>Contact Details:</strong> Customer name, Kenyan phone number, and optional email address provided during checkout.</li>
            <li><strong>Delivery Information:</strong> Selected delivery zone, estate address, or preferred pickup station in Kenya.</li>
            <li><strong>Order History:</strong> Reserved product items, timestamps, and cryptographic order reference identifiers.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-heading">2. How We Use Your Information</h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            Your data is used strictly to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-600">
            <li>Generate structured order summaries for customer-to-merchant WhatsApp communications.</li>
            <li>Coordinate delivery and logistics dispatch with authorized couriers.</li>
            <li>Prevent fraudulent transactions and protect customer and seller security.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-heading">3. WhatsApp &amp; Third-Party Services</h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            When you initiate a WhatsApp order or inquiry, communications take place through WhatsApp&apos;s end-to-end encrypted messaging infrastructure under Meta&apos;s privacy policies. We do not sell or rent customer contact information to third-party marketing firms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-heading">4. Data Retention &amp; Security</h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            Order tokens and temporary cart sessions are stored securely in browser storage and encrypted server channels. We retain minimal operational data as required for order tracking and regulatory compliance.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-heading">5. Your Rights</h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            Under the Kenya Data Protection Act (2019), you have the right to request access to, correction of, or deletion of your personal data held by our platform. Contact our support team for any data requests.
          </p>
        </section>
      </div>
    </div>
  );
}
