'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  ShieldCheck,
  Phone,
  Layers,
  Search,
  Filter,
} from 'lucide-react';
import type { ModerationListingItem } from '@/lib/admin/types';
import {
  approveListingAction,
  rejectListingAction,
  bulkApproveListingsAction,
  bulkRejectListingsAction,
} from '@/lib/admin/actions';

export default function AdminModerationPage() {
  const [items, setItems] = useState<ModerationListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending_review');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [inspectingItem, setInspectingItem] = useState<ModerationListingItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isActionPending, setIsActionPending] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  const loadListings = async () => {
    setLoading(true);
    try {
      // Dynamic import or client query
      const res = await fetch(`/api/admin/moderation?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setSelectedIds([]);
    }
  };

  useEffect(() => {
    loadListings();
  }, [statusFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleApprove = async (id: string) => {
    setIsActionPending(true);
    setFeedback(null);
    try {
      const res = await approveListingAction(id);
      if (res.success) {
        setFeedback({ message: res.message });
        setItems((prev) => prev.filter((i) => i.id !== id));
        if (inspectingItem?.id === id) setInspectingItem(null);
      } else {
        setFeedback({ message: res.message, isError: true });
      }
    } finally {
      setIsActionPending(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      setFeedback({ message: 'Please provide a rejection reason.', isError: true });
      return;
    }
    setIsActionPending(true);
    setFeedback(null);
    try {
      const res = await rejectListingAction(id, rejectReason);
      if (res.success) {
        setFeedback({ message: res.message });
        setItems((prev) => prev.filter((i) => i.id !== id));
        setRejectReason('');
        if (inspectingItem?.id === id) setInspectingItem(null);
      } else {
        setFeedback({ message: res.message, isError: true });
      }
    } finally {
      setIsActionPending(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setIsActionPending(true);
    setFeedback(null);
    try {
      const res = await bulkApproveListingsAction(selectedIds);
      if (res.success) {
        setFeedback({ message: res.message });
        setItems((prev) => prev.filter((i) => !selectedIds.includes(i.id)));
        setSelectedIds([]);
      } else {
        setFeedback({ message: res.message, isError: true });
      }
    } finally {
      setIsActionPending(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return;
    const reason = prompt('Enter rejection reason for selected listings:');
    if (!reason || !reason.trim()) return;

    setIsActionPending(true);
    setFeedback(null);
    try {
      const res = await bulkRejectListingsAction(selectedIds, reason);
      if (res.success) {
        setFeedback({ message: res.message });
        setItems((prev) => prev.filter((i) => !selectedIds.includes(i.id)));
        setSelectedIds([]);
      } else {
        setFeedback({ message: res.message, isError: true });
      }
    } finally {
      setIsActionPending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-amber-400" />
            <span>Listing Moderation Queue</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review user-submitted used & refurbished electronics before public publishing.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950 border border-slate-800 self-start sm:self-auto">
          {[
            { id: 'pending_review', label: 'Pending Review' },
            { id: 'published', label: 'Published' },
            { id: 'rejected_with_reason', label: 'Rejected' },
            { id: 'all', label: 'All' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alert / Feedback message */}
      {feedback && (
        <div
          className={`p-3 rounded-lg text-sm flex items-center justify-between ${
            feedback.isError
              ? 'bg-rose-950/60 border border-rose-800 text-rose-200'
              : 'bg-emerald-950/60 border border-emerald-800 text-emerald-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs underline opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Bulk Action Controls */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-between">
          <div className="text-xs text-slate-300 font-medium">
            <span className="font-bold text-amber-400 font-mono">{selectedIds.length}</span>{' '}
            listing(s) selected
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkApprove}
              disabled={isActionPending}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Bulk Approve</span>
            </button>
            <button
              onClick={handleBulkReject}
              disabled={isActionPending}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Bulk Reject</span>
            </button>
          </div>
        </div>
      )}

      {/* Listings Table / Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm font-mono flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-amber-400" />
          <span>Loading moderation records...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div className="text-base font-semibold text-slate-300">
            No listings found in queue
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {statusFilter === 'pending_review'
              ? 'All seller submissions have been reviewed. New listings will appear here automatically.'
              : `No listings with status "${statusFilter}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 text-xs text-slate-500">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.length === items.length && items.length > 0}
                onChange={toggleSelectAll}
                className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
              />
              <span>Select All</span>
            </label>
            <span>Showing {items.length} listing(s)</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {items.map((listing) => (
              <div
                key={listing.id}
                className={`p-4 rounded-xl bg-slate-950 border transition-all ${
                  selectedIds.includes(listing.id)
                    ? 'border-amber-500/60 bg-amber-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                } flex flex-col md:flex-row md:items-center justify-between gap-4`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(listing.id)}
                    onChange={() => toggleSelect(listing.id)}
                    className="mt-1 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                  />

                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg bg-slate-900 border border-slate-800 shrink-0 overflow-hidden relative">
                    {listing.photos[0] ? (
                      <img
                        src={listing.photos[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px]">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Listing Details */}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white hover:underline cursor-pointer" onClick={() => setInspectingItem(listing)}>
                        {listing.title}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-900 text-slate-400 border border-slate-800">
                        {listing.condition}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        listing.status === 'published'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : listing.status === 'pending_review'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {listing.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      <span className="font-bold text-amber-400 font-mono">
                        KES {listing.priceKes.toLocaleString()}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span>Seller: {listing.sellerName}</span>
                        {listing.sellerVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </span>
                      <span>•</span>
                      <span>{listing.location || listing.county || 'Nairobi'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => setInspectingItem(listing)}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-800 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>

                  {listing.status === 'pending_review' && (
                    <>
                      <button
                        onClick={() => handleApprove(listing.id)}
                        disabled={isActionPending}
                        className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => {
                          setInspectingItem(listing);
                        }}
                        disabled={isActionPending}
                        className="px-3 py-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspection Modal */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{inspectingItem.title}</h3>
                <div className="text-xs text-slate-400 mt-1">
                  Submitted: {new Date(inspectingItem.submittedAt).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => setInspectingItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Photos */}
            {inspectingItem.photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {inspectingItem.photos.map((photo, i) => (
                  <div
                    key={i}
                    className="h-28 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden relative"
                  >
                    <img
                      src={photo}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-500 text-center">
                No photos attached to listing
              </div>
            )}

            {/* Description */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <div className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider mb-1">
                Seller Description
              </div>
              {inspectingItem.description || 'No description provided.'}
            </div>

            {/* Seller Information */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span>{inspectingItem.sellerName}</span>
                  {inspectingItem.sellerVerified && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>
                {inspectingItem.sellerPhone && (
                  <div className="text-slate-400 mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {inspectingItem.sellerPhone}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-amber-400 font-bold font-mono text-sm">
                  KES {inspectingItem.priceKes.toLocaleString()}
                </div>
                <div className="text-slate-500 text-[11px] capitalize">
                  {inspectingItem.condition}
                </div>
              </div>
            </div>

            {/* Moderation Action Form inside Inspection */}
            {inspectingItem.status === 'pending_review' && (
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">
                    Rejection / Change Request Reason (Required if rejecting)
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Inappropriate photo quality, prohibited item, misleading price..."
                    rows={2}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => handleReject(inspectingItem.id)}
                    disabled={isActionPending}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Reject Listing
                  </button>
                  <button
                    onClick={() => handleApprove(inspectingItem.id)}
                    disabled={isActionPending}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Approve & Publish
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
