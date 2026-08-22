import React from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Users,
  ShoppingBag,
  Truck,
  ArrowRight,
  Database,
  RefreshCw,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { getAdminDashboardMetrics } from '@/lib/admin/queries';

export const revalidate = 0; // Fresh on every page load

export default async function AdminDashboardPage() {
  const metrics = await getAdminDashboardMetrics();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Operations Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time marketplace activity, pending approvals, and fulfillment queues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <div
              className={`w-2 h-2 rounded-full ${
                metrics.dbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-slate-300 font-mono">
              {metrics.dbConnected ? 'DATABASE LIVE' : 'AWAITING DB CONNECTION'}
            </span>
          </div>
          <Link
            href="/admin"
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {!metrics.dbConnected && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-300">Live Database Migration Notice</div>
            <div className="text-xs text-amber-200/80 mt-1 leading-relaxed">
              The Supabase database connection is running with baseline schema. Operational counts will
              automatically synchronize as real seller applications and listings are created.
            </div>
          </div>
        </div>
      )}

      {/* Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Pending Listings */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending Listings
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-bold tracking-tight text-white font-mono">
              {metrics.pendingListings}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Awaiting staff inspection & approval
            </div>
          </div>
          <Link
            href="/admin/moderation"
            className="flex items-center justify-between text-xs font-semibold text-amber-400 hover:text-amber-300 pt-3 border-t border-slate-800/80 group"
          >
            <span>Review Moderation Queue</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Pending KYC */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending Seller KYC
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-bold tracking-tight text-white font-mono">
              {metrics.pendingKyc}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Seller identity documents pending review
            </div>
          </div>
          <Link
            href="/admin/sellers"
            className="flex items-center justify-between text-xs font-semibold text-blue-400 hover:text-blue-300 pt-3 border-t border-slate-800/80 group"
          >
            <span>Review Seller Applications</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Orders Requiring Fulfillment */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Fulfillment
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-bold tracking-tight text-white font-mono">
              {metrics.ordersRequiringFulfillment}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Orders in dispatch or transit pipeline
            </div>
          </div>
          <Link
            href="/admin/fulfillment"
            className="flex items-center justify-between text-xs font-semibold text-emerald-400 hover:text-emerald-300 pt-3 border-t border-slate-800/80 group"
          >
            <span>Open Fulfillment Board</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Active Sellers */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Verified Sellers
            </span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-bold tracking-tight text-white font-mono">
              {metrics.activeSellers}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Active merchants on marketplace
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-800/80">
            KYC Verified & active status
          </div>
        </div>

        {/* Active Published Listings */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Live Seller Listings
            </span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-bold tracking-tight text-white font-mono">
              {metrics.activeListings}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Approved used/refurbished products
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-800/80">
            Published in buyer search
          </div>
        </div>

        {/* Pending Orders */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending Orders
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-4">
            <div className="text-3xl font-bold tracking-tight text-white font-mono">
              {metrics.pendingOrders}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Orders in WhatsApp confirmation stage
            </div>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center justify-between text-xs font-semibold text-rose-400 hover:text-rose-300 pt-3 border-t border-slate-800/80 group"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Quick Operational Shortcuts */}
      <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Staff Operational Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/admin/moderation"
            className="p-3 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800/70 hover:border-slate-700 transition-colors text-left"
          >
            <div className="text-sm font-semibold text-white">Listing Moderation</div>
            <div className="text-xs text-slate-400 mt-0.5">Approve, reject, or request edits</div>
          </Link>
          <Link
            href="/admin/sellers"
            className="p-3 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800/70 hover:border-slate-700 transition-colors text-left"
          >
            <div className="text-sm font-semibold text-white">Seller KYC Verification</div>
            <div className="text-xs text-slate-400 mt-0.5">National ID & document checks</div>
          </Link>
          <Link
            href="/admin/fulfillment"
            className="p-3 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800/70 hover:border-slate-700 transition-colors text-left"
          >
            <div className="text-sm font-semibold text-white">Dispatch & Delivery</div>
            <div className="text-xs text-slate-400 mt-0.5">Assign courier & update status</div>
          </Link>
          <Link
            href="/admin/audit"
            className="p-3 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800/70 hover:border-slate-700 transition-colors text-left"
          >
            <div className="text-sm font-semibold text-white">Audit Event Trail</div>
            <div className="text-xs text-slate-400 mt-0.5">Append-only privileged activity</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
