'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  User,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';
import type { AdminAuditLogItem } from '@/lib/admin/types';

export default function AdminAuditLogPage() {
  const [items, setItems] = useState<AdminAuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit?action=${actionFilter}`);
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
    loadLogs();
  }, [actionFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            <span>Operational Audit Trail</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Immutable append-only record of administrative mutations, KYC approvals, and order events.
          </p>
        </div>

        {/* Action Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Actions</option>
            <option value="listing.approved">Listing Approvals</option>
            <option value="listing.rejected">Listing Rejections</option>
            <option value="listing.bulk_approved">Bulk Approvals</option>
            <option value="seller_kyc.approved">KYC Approvals</option>
            <option value="seller_kyc.rejected">KYC Rejections</option>
            <option value="order.status_change">Order State Transitions</option>
            <option value="fulfillment.status_transition">Fulfillment Updates</option>
            <option value="delivery_zone.updated">Delivery Fee Updates</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm font-mono flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Loading immutable audit logs...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div className="text-base font-semibold text-slate-300">No audit events recorded</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            As staff members approve listings, verify sellers, or update delivery tariffs, every event is
            appended here with full before/after state diffs.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((log) => (
            <div
              key={log.id}
              className="rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all overflow-hidden"
            >
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                      {log.action}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      Target: {log.targetType} {log.targetId ? `(${log.targetId.slice(0, 8)})` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>{log.actorId ? `Staff ID: ${log.actorId.slice(0, 8)}` : log.actorSystem || 'System'}</span>
                    </span>
                    <span>•</span>
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  {(log.before || log.after) && (
                    <button
                      onClick={() =>
                        setExpandedLogId(expandedLogId === log.id ? null : log.id)
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-800 transition-colors"
                    >
                      <span>State Diff</span>
                      {expandedLogId === log.id ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* State Diff Details */}
              {expandedLogId === log.id && (
                <div className="p-4 bg-slate-900/80 border-t border-slate-800 text-xs space-y-3 font-mono">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1">
                        State Before Mutation
                      </div>
                      <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 overflow-x-auto text-[11px]">
                        {log.before ? JSON.stringify(log.before, null, 2) : 'null'}
                      </pre>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                        State After Mutation
                      </div>
                      <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 overflow-x-auto text-[11px]">
                        {log.after ? JSON.stringify(log.after, null, 2) : 'null'}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
