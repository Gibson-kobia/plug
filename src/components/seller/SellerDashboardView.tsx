'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Store,
  Plus,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  Trash2,
  Edit3,
  ExternalLink,
  MessageCircle,
  Star,
  MapPin,
  Phone,
  RefreshCw,
  LogOut,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { deleteSellerListingAction } from '@/lib/seller/actions';
import { signOutSellerAction } from '@/lib/seller/auth-actions';
import type { SellerDashboardData, SellerListingItem, UsedListingStatus } from '@/lib/seller/types';

interface SellerDashboardViewProps {
  initialData: SellerDashboardData;
}

export function SellerDashboardView({ initialData }: SellerDashboardViewProps) {
  const router = useRouter();
  const [data, setData] = React.useState<SellerDashboardData>(initialData);
  const [activeTab, setActiveTab] = React.useState<'all' | 'published' | 'pending_review' | 'draft_seller' | 'rejected_with_reason'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { profile, kyc, listings, stats } = data;

  const filteredListings = React.useMemo(() => {
    return listings.filter((item) => {
      if (activeTab !== 'all' && item.status !== activeTab) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCategory = item.categoryName?.toLowerCase().includes(q);
        return matchTitle || matchCategory;
      }
      return true;
    });
  }, [listings, activeTab, searchQuery]);

  const handleDeleteListing = async (listingId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    setActionLoading(listingId);
    try {
      const res = await deleteSellerListingAction(listingId);
      if (res.success) {
        setFeedbackMsg({ type: 'success', text: res.message });
        setData((prev) => ({
          ...prev,
          listings: prev.listings.filter((l) => l.id !== listingId),
          stats: {
            ...prev.stats,
            totalListings: Math.max(0, prev.stats.totalListings - 1),
          },
        }));
        router.refresh();
      } else {
        setFeedbackMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Deletion failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSignOut = async () => {
    await signOutSellerAction();
    router.refresh();
  };

  const renderStatusBadge = (status: UsedListingStatus) => {
    switch (status) {
      case 'published':
        return (
          <Badge variant="verified" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-[11px]">
            <CheckCircle2 size={12} /> Active / Published
          </Badge>
        );
      case 'pending_review':
        return (
          <Badge variant="secondary" className="bg-amber-50 text-amber-800 border-amber-200 gap-1 text-[11px]">
            <Clock size={12} /> Pending Moderation
          </Badge>
        );
      case 'draft_seller':
        return (
          <Badge variant="outline" className="bg-neutral-50 text-neutral-600 border-neutral-200 gap-1 text-[11px]">
            Draft
          </Badge>
        );
      case 'rejected_with_reason':
        return (
          <Badge variant="destructive" className="bg-rose-50 text-rose-700 border-rose-200 gap-1 text-[11px]">
            <XCircle size={12} /> Action Required
          </Badge>
        );
      case 'sold_by_seller':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[11px]">
            Sold
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div id="main" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-copper-100 p-1.5 text-copper-700">
              <Store size={20} />
            </span>
            <h1 className="font-display text-2xl font-bold text-heading sm:text-3xl">
              {profile?.displayName || 'Seller Portal'}
            </h1>
            {profile?.verified && (
              <Badge variant="verified" className="bg-emerald-100 text-emerald-800 border-emerald-300">
                <ShieldCheck size={12} className="mr-1" /> Verified Store
              </Badge>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
            {profile?.location && (
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-copper-600" /> {profile.location}, {profile.county || 'Nairobi'}
              </span>
            )}
            {profile?.whatsappNumber && (
              <span className="flex items-center gap-1">
                <Phone size={13} className="text-emerald-600" /> {profile.whatsappNumber}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star size={13} className="text-amber-500 fill-amber-500" /> {stats.rating.toFixed(1)} / 5.0 Rating
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/seller/kyc">
            <Button variant="outline" size="sm" className="h-10 text-xs">
              <FileText size={14} className="mr-1.5 text-copper-600" /> KYC Verification
            </Button>
          </Link>
          <Link href="/seller/listings/new">
            <Button size="sm" className="h-10 text-xs bg-copper-600 hover:bg-copper-700 text-white">
              <Plus size={14} className="mr-1.5" /> List New Product
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut} title="Sign Out" className="h-10 px-2.5 text-neutral-500">
            <LogOut size={16} />
          </Button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`flex items-center justify-between rounded-2xl p-4 text-xs font-medium ${
            feedbackMsg.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* KYC Alert Banner */}
      {stats.kycStatus === 'rejected' && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-rose-900">KYC Verification Requires Action</h3>
                <p className="text-xs text-rose-700 mt-0.5">
                  Moderator Note: <span className="font-semibold">{kyc?.rejectionReason || 'Please re-upload clearer photos of your Kenyan National ID.'}</span>
                </p>
              </div>
            </div>
            <Link href="/seller/kyc">
              <Button size="sm" variant="destructive" className="shrink-0 text-xs">
                Update & Resubmit KYC
              </Button>
            </Link>
          </div>
        </div>
      )}

      {stats.kycStatus === 'pending' && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900">KYC Documents Under Review</p>
              <p className="text-[11px] text-amber-700">Marketplace moderators review submissions within 24 hours.</p>
            </div>
          </div>
          <Link href="/seller/kyc">
            <Button variant="outline" size="sm" className="h-8 text-xs border-amber-300 bg-white">
              View Status
            </Button>
          </Link>
        </div>
      )}

      {stats.kycStatus === 'unverified' && (
        <div className="rounded-3xl border border-blue-200 bg-blue-50/60 p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-blue-900">Complete KYC to Get Verified Seller Status</p>
              <p className="text-[11px] text-blue-700">Verified sellers receive a verified badge and priority placement in search results.</p>
            </div>
          </div>
          <Link href="/seller/kyc">
            <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white">
              Start Verification
            </Button>
          </Link>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Listings</span>
          <p className="mt-1 font-display text-2xl font-bold text-heading">{stats.totalListings}</p>
          <span className="text-[11px] text-neutral-500 font-medium">All recorded</span>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Published Active</span>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-800">{stats.activePublished}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">Live in store</span>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-4 shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">In Moderation</span>
          <p className="mt-1 font-display text-2xl font-bold text-amber-800">{stats.pendingReview}</p>
          <span className="text-[11px] text-amber-600 font-semibold">Awaiting review</span>
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Drafts</span>
          <p className="mt-1 font-display text-2xl font-bold text-heading">{stats.drafts}</p>
          <span className="text-[11px] text-neutral-500 font-medium">Unsubmitted</span>
        </div>

        <div className="rounded-2xl border border-copper-100 bg-copper-50/30 p-4 shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-copper-700">WhatsApp Inquiries</span>
          <p className="mt-1 font-display text-2xl font-bold text-copper-800">{stats.whatsappEnquiries}</p>
          <span className="text-[11px] text-copper-600 font-semibold">Buyer leads</span>
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">KYC Status</span>
          <div className="mt-1 flex items-center">
            {stats.kycStatus === 'approved' && (
              <Badge variant="verified" className="bg-emerald-100 text-emerald-800 text-[10px]">
                Approved
              </Badge>
            )}
            {stats.kycStatus === 'pending' && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-[10px]">
                Pending
              </Badge>
            )}
            {stats.kycStatus === 'rejected' && (
              <Badge variant="destructive" className="bg-rose-100 text-rose-800 text-[10px]">
                Rejected
              </Badge>
            )}
            {stats.kycStatus === 'unverified' && (
              <Badge variant="outline" className="text-[10px]">
                Unverified
              </Badge>
            )}
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">Trust badge</span>
        </div>
      </div>

      {/* Listings Management Section */}
      <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-card space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-heading">Your Product Listings</h2>
            <p className="text-xs text-neutral-500">Real Supabase database records for this seller account</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 rounded-xl border border-neutral-200 px-3 text-xs focus:border-copper-400 focus:outline-none w-48 sm:w-64"
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex overflow-x-auto border-b border-neutral-100 gap-1 pb-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'all' ? 'bg-copper-50 text-copper-700' : 'text-neutral-500 hover:bg-neutral-50'
            }`}
          >
            All ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('published')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'published' ? 'bg-emerald-50 text-emerald-700' : 'text-neutral-500 hover:bg-neutral-50'
            }`}
          >
            Published ({stats.activePublished})
          </button>
          <button
            onClick={() => setActiveTab('pending_review')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'pending_review' ? 'bg-amber-50 text-amber-800' : 'text-neutral-500 hover:bg-neutral-50'
            }`}
          >
            Pending Review ({stats.pendingReview})
          </button>
          <button
            onClick={() => setActiveTab('draft_seller')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'draft_seller' ? 'bg-neutral-100 text-neutral-800' : 'text-neutral-500 hover:bg-neutral-50'
            }`}
          >
            Drafts ({stats.drafts})
          </button>
          <button
            onClick={() => setActiveTab('rejected_with_reason')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'rejected_with_reason' ? 'bg-rose-50 text-rose-700' : 'text-neutral-500 hover:bg-neutral-50'
            }`}
          >
            Action Required ({stats.rejected})
          </button>
        </div>

        {/* Listings Table / List */}
        {filteredListings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 p-12 text-center">
            <Store className="mx-auto h-12 w-12 text-neutral-300" />
            <h3 className="mt-3 text-sm font-bold text-heading">No listings found</h3>
            <p className="mt-1 text-xs text-neutral-500">
              {listings.length === 0
                ? "You haven't created any marketplace listings yet. Click below to add your first product!"
                : 'No listings match your search or selected filter.'}
            </p>
            <Link href="/seller/listings/new" className="mt-4 inline-block">
              <Button size="sm" className="bg-copper-600 hover:bg-copper-700 text-white text-xs">
                <Plus size={14} className="mr-1" /> Create First Listing
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/70 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Item</th>
                  <th className="p-3">Category / Brand</th>
                  <th className="p-3">Asking Price</th>
                  <th className="p-3">Condition</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredListings.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-100">
                          {item.photos[0] ? (
                            <Image
                              src={item.photos[0]}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                              No photo
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-heading line-clamp-1">{item.title}</p>
                          <span className="text-[11px] text-neutral-400 block">
                            Updated {new Date(item.updatedAt).toLocaleDateString()}
                          </span>
                          {item.latestModerationNote && item.status === 'rejected_with_reason' && (
                            <span className="mt-0.5 inline-block text-[11px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                              Feedback: {item.latestModerationNote}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-3 text-neutral-600">
                      <p className="font-medium text-heading">{item.categoryName || 'Electronics'}</p>
                      <span className="text-[11px] text-neutral-400">{item.brandName || 'Generic'}</span>
                    </td>

                    <td className="p-3">
                      <p className="font-bold text-copper-700">KSh {item.priceKes.toLocaleString()}</p>
                      {item.negotiable && <span className="text-[10px] text-neutral-400">Negotiable</span>}
                    </td>

                    <td className="p-3">
                      <span className="capitalize text-neutral-700 font-medium">{item.condition.replace(/_/g, ' ')}</span>
                    </td>

                    <td className="p-3">{renderStatusBadge(item.status)}</td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'published' && (
                          <Link href={`/product/${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${item.id.substring(0, 8)}`}>
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-copper-600" title="View on Storefront">
                              <ExternalLink size={13} />
                            </Button>
                          </Link>
                        )}

                        <Link href={`/seller/listings/new?editId=${item.id}`}>
                          <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs" title="Edit / Resubmit Listing">
                            <Edit3 size={13} className="mr-1" />
                            {item.status === 'rejected_with_reason' ? 'Fix' : 'Edit'}
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={actionLoading === item.id}
                          onClick={() => handleDeleteListing(item.id, item.title)}
                          className="h-8 px-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                          title="Delete Listing"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
