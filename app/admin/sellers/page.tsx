'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileText,
  Phone,
  Clock,
  ExternalLink,
  Search,
} from 'lucide-react';
import type { SellerKycItem } from '@/lib/admin/types';
import { reviewSellerKycAction } from '@/lib/admin/actions';

export default function AdminSellersKycPage() {
  const [items, setItems] = useState<SellerKycItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [inspectingSeller, setInspectingSeller] = useState<SellerKycItem | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [isActionPending, setIsActionPending] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  const loadSellers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/sellers?status=${statusFilter}`);
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
    }
  };

  useEffect(() => {
    loadSellers();
  }, [statusFilter]);

  const handleReview = async (sellerId: string, decision: 'approved' | 'rejected' | 'pending') => {
    if (decision === 'rejected' && !rejectionNotes.trim()) {
      setFeedback({ message: 'Please specify the KYC rejection reason.', isError: true });
      return;
    }

    setIsActionPending(true);
    setFeedback(null);
    try {
      const res = await reviewSellerKycAction(sellerId, decision, rejectionNotes);
      if (res.success) {
        setFeedback({ message: res.message });
        setItems((prev) => prev.filter((i) => i.id !== sellerId));
        setRejectionNotes('');
        if (inspectingSeller?.id === sellerId) setInspectingSeller(null);
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
            <Users className="w-6 h-6 text-blue-400" />
            <span>Seller KYC Verification</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Verify merchant identity documents (National ID / Huduma Card / Passport) before granting seller access.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950 border border-slate-800 self-start sm:self-auto">
          {[
            { id: 'pending', label: 'Pending Review' },
            { id: 'approved', label: 'Approved Sellers' },
            { id: 'rejected', label: 'Rejected' },
            { id: 'all', label: 'All Submissions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                statusFilter === tab.id
                  ? 'bg-blue-500 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

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

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm font-mono flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-blue-400" />
          <span>Loading KYC submissions...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div className="text-base font-semibold text-slate-300">
            No seller applications found
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {statusFilter === 'pending'
              ? 'There are no pending seller verification submissions. When a seller registers and uploads ID documents, they will appear here.'
              : `No sellers with status "${statusFilter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {items.map((seller) => (
            <div
              key={seller.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">{seller.displayName}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      seller.kycStatus === 'approved'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : seller.kycStatus === 'pending'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {seller.kycStatus}
                  </span>
                  {seller.verified && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified Badge
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{seller.whatsappNumber}</span>
                  </span>
                  <span>•</span>
                  <span>{seller.location || seller.county || 'Nairobi'}</span>
                  <span>•</span>
                  <span>{seller.documents.length} document(s) submitted</span>
                  <span>•</span>
                  <span>Joined: {new Date(seller.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setInspectingSeller(seller)}
                  className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-800 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Inspect KYC Docs</span>
                </button>

                {seller.kycStatus === 'pending' && (
                  <>
                    <button
                      onClick={() => handleReview(seller.id, 'approved')}
                      disabled={isActionPending}
                      className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => setInspectingSeller(seller)}
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
      )}

      {/* KYC Documents Inspection Modal */}
      {inspectingSeller && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  KYC Dossier: {inspectingSeller.displayName}
                </h3>
                <div className="text-xs text-slate-400 mt-1">
                  WhatsApp: {inspectingSeller.whatsappNumber} • Submitted:{' '}
                  {new Date(inspectingSeller.createdAt).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => setInspectingSeller(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Document Gallery */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Verification Documents
              </div>

              {inspectingSeller.documents.length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-500 text-center">
                  No identity documents uploaded yet
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inspectingSeller.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300 uppercase">
                          {doc.documentType.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(doc.submittedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="h-40 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden relative">
                        <img
                          src={doc.frontImageUrl}
                          alt="Front"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {doc.selfieWithIdUrl && (
                        <div className="h-40 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden relative">
                          <img
                            src={doc.selfieWithIdUrl}
                            alt="Selfie with ID"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Decision Controls */}
            {inspectingSeller.kycStatus === 'pending' && (
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">
                    Rejection / Correction Notes (Required if rejecting)
                  </label>
                  <textarea
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                    placeholder="e.g. ID photo is blurry, name mismatch, expired passport..."
                    rows={2}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => handleReview(inspectingSeller.id, 'rejected')}
                    disabled={isActionPending}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Reject KYC
                  </button>
                  <button
                    onClick={() => handleReview(inspectingSeller.id, 'approved')}
                    disabled={isActionPending}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Approve Seller
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
