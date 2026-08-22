import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  LayoutDashboard,
  CheckSquare,
  Users,
  ShoppingBag,
  Truck,
  MapPin,
  FileText,
  ExternalLink,
  LogOut,
  Database,
  Menu,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const metadata = {
  title: 'Admin Control Center | Kenya Electronics Marketplace',
  description: 'Internal operations, moderation, seller KYC, orders, and fulfillment management.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Leads & CRM', href: '/admin/leads', icon: Users },
    { label: 'Catalogue Data Quality', href: '/admin/catalogue', icon: Database },
    { label: 'Listing Moderation', href: '/admin/moderation', icon: CheckSquare },
    { label: 'Sellers & KYC', href: '/admin/sellers', icon: Users },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Fulfillment', href: '/admin/fulfillment', icon: Truck },
    { label: 'Delivery Zones', href: '/admin/settings/delivery', icon: MapPin },
    { label: 'Audit Log', href: '/admin/audit', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col antialiased">
      {/* Top Operations Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-950 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-bold text-base tracking-tight text-amber-500 hover:text-amber-400"
          >
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <span>OPERATIONS CONTROL</span>
          </Link>
          <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-slate-800 text-slate-300 border border-slate-700">
            STAFF PORTAL
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-md hover:bg-slate-800 transition-colors"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="h-4 w-px bg-slate-800 hidden md:block" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-xs font-bold">
              OP
            </div>
            <div className="hidden sm:block text-left leading-none">
              <div className="text-xs font-semibold text-slate-200">Staff Member</div>
              <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">ADMIN_ROLE</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-slate-950 hidden md:flex flex-col justify-between p-3 shrink-0">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Operations Navigation
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors group"
                  >
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>DB Status</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">ONLINE</span>
            </div>

            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit Operations</span>
            </Link>
          </div>
        </aside>

        {/* Mobile Horizontal Navigation */}
        <div className="md:hidden w-full bg-slate-950 border-b border-slate-800 flex overflow-x-auto py-2 px-3 gap-2 shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 whitespace-nowrap shrink-0"
              >
                <Icon className="w-3.5 h-3.5 text-amber-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-900">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
