'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Phone,
  MessageCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import type { AdminLeadItem } from '@/lib/admin/types';
import { updateLeadStatusAction } from '@/lib/admin/actions';

const DEFAULT_STATUS_CONF = {
  label: 'Inquiry',
  bg: 'bg-amber-500/10',
  text: 'text-amber-400',
  border: 'border-amber-500/20',
};

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  new: { label: 'New Inquiry', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  contacted: { label: 'Contacted', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  negotiating: { label: 'Negotiating', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  payment_pending: { label: 'Payment Pending', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  converted: { label: 'Converted / Paid', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  lost: { label: 'Lost', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  cancelled: { label: 'Cancelled', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<AdminLeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalPipelineKes, setTotalPipelineKes] = useState(0);
  const [selectedLead, setSelectedLead] = useState<AdminLeadItem | null>(null);
  const [actionPending, setActionPending] = useState(false);
  const [notesInput, setNotesInput] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leads?status=${statusFilter}&q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.items || []);
        setTotalPipelineKes(data.totalEstimatedValueKes || 0);
      } else {
        setLeads([]);
      }
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setActionPending(true);
    setFeedback(null);
    try {
      const res = await updateLeadStatusAction(leadId, newStatus, notesInput || undefined);
      if (res.success) {
        setFeedback({ message: res.message });
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus as any, notes: notesInput || l.notes } : l))
        );
        if (selectedLead?.id === leadId) {
          setSelectedLead((prev) => (prev ? { ...prev, status: newStatus as any } : null));
        }
      } else {
        setFeedback({ message: res.message, isError: true });
      }
    } finally {
      setActionPending(false);
    }
  };

  const filteredLeads = leads.filter((l) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.productTitle.toLowerCase().includes(q) ||
      (l.customerPhone && l.customerPhone.includes(q)) ||
      (l.customerName && l.customerName.toLowerCase().includes(q))
    );
  });

  const convertedCount = leads.filter((l) => l.status === 'converted').length;
  const newCount = leads.filter((l) => l.status === 'new').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            Customer Leads & CRM Pipeline
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time intent ingestion from WhatsApp clicks, PDP reservations, and direct checkout inquiries.
          </p>
        </div>

        <button
          onClick={fetchLeads}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
        >
          Refresh Leads
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Pipeline Volume</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2">{leads.length}</p>
          <span className="text-xs text-amber-400 mt-1 block">{newCount} new pending action</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Estimated Pipeline Value</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2">
            KSh {totalPipelineKes.toLocaleString()}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">Across active high-intent leads</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Converted Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{convertedCount}</p>
          <span className="text-xs text-slate-400 mt-1 block">Successfully closed leads</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Avg. Conversion Ratio</span>
            <UserCheck className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2">
            {leads.length > 0 ? Math.round((convertedCount / leads.length) * 100) : 0}%
          </p>
          <span className="text-xs text-slate-400 mt-1 block">Inquiry-to-checkout rate</span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-lg text-sm flex items-center gap-2 border ${
            feedback.isError
              ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
              : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
          }`}
        >
          {feedback.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search by customer phone, name, or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {['all', 'new', 'contacted', 'negotiating', 'payment_pending', 'converted', 'lost'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap capitalize transition ${
                statusFilter === status
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {status === 'all' ? 'All Statuses' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
          Loading customer CRM leads...
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800 space-y-2">
          <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
          <p className="font-semibold text-slate-300">No customer leads found</p>
          <p className="text-xs text-slate-500">
            Leads appear automatically when customers click WhatsApp or Reserve buttons on product pages.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Customer & Channel</th>
                <th className="px-4 py-3">Product of Interest</th>
                <th className="px-4 py-3">Est. Value (KES)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Captured</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLeads.map((lead) => {
                const conf = STATUS_CONFIG[lead.status] || DEFAULT_STATUS_CONF;
                return (
                  <tr key={lead.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-100">
                        {lead.customerName || 'Direct Customer'}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        {lead.customerPhone ? (
                          <a
                            href={`https://wa.me/${lead.customerPhone.replace(/\+/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
                          >
                            <Phone className="w-3 h-3" />
                            {lead.customerPhone}
                          </a>
                        ) : (
                          <span className="text-slate-500">No phone provided</span>
                        )}
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400 font-mono text-[11px] bg-slate-800 px-1.5 py-0.5 rounded">
                          {lead.source}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="font-medium text-slate-200 line-clamp-1">
                        {lead.productTitle}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        ID: {lead.productId}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-slate-200">
                      {lead.estimatedValueKes
                        ? `KSh ${lead.estimatedValueKes.toLocaleString()}`
                        : 'Price upon inquiry'}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${conf.bg} ${conf.text} ${conf.border}`}
                      >
                        {conf.label}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-slate-400">
                      {new Date(lead.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <select
                          value={lead.status}
                          disabled={actionPending}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className="text-xs bg-slate-950 border border-slate-700 text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="negotiating">Negotiating</option>
                          <option value="payment_pending">Payment Pending</option>
                          <option value="converted">Converted</option>
                          <option value="lost">Lost</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
