'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  FileEdit,
  ExternalLink,
} from 'lucide-react';
import type { AdminFulfillmentItem } from '@/lib/admin/types';
import { transitionFulfillmentAction } from '@/lib/admin/actions';

export default function AdminFulfillmentPage() {
  const [items, setItems] = useState<AdminFulfillmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingItem, setEditingItem] = useState<AdminFulfillmentItem | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [trackingNo, setTrackingNo] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [newStatus, setNewStatus] = useState('in_transit');
  const [isActionPending, setIsActionPending] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  const loadFulfillments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/fulfillment?status=${statusFilter}`);
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
    loadFulfillments();
  }, [statusFilter]);

  const handleOpenEdit = (item: AdminFulfillmentItem) => {
    setEditingItem(item);
    setPartnerName(item.partnerName || '');
    setTrackingNo(item.trackingNo || '');
    setDriverName(item.driverName || '');
    setDriverPhone(item.driverPhone || '');
    setNewStatus(item.status);
  };

  const handleSaveFulfillment = async () => {
    if (!editingItem) return;
    setIsActionPending(true);
    setFeedback(null);

    try {
      const res = await transitionFulfillmentAction(editingItem.id, {
        newStatus,
        partnerName,
        trackingNo,
        driverName,
        driverPhone,
      });

      if (res.success) {
        setFeedback({ message: res.message });
        setEditingItem(null);
        loadFulfillments();
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
            <Truck className="w-6 h-6 text-emerald-400" />
            <span>Fulfillment & Dispatch Board</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage parcel packaging, courier dispatch, rider assignments, and delivery completion.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950 border border-slate-800 overflow-x-auto self-start sm:self-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'assigned', label: 'Assigned' },
            { id: 'picked_up', label: 'Picked Up' },
            { id: 'in_transit', label: 'In Transit' },
            { id: 'out_for_delivery', label: 'Out for Delivery' },
            { id: 'delivered', label: 'Delivered' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-emerald-500 text-slate-950 font-bold'
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
          <Clock className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Loading fulfillments pipeline...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Truck className="w-6 h-6" />
          </div>
          <div className="text-base font-semibold text-slate-300">
            No active fulfillments found
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {statusFilter === 'all'
              ? 'When orders are confirmed and packages are assigned to couriers, their dispatch lifecycle will appear here.'
              : `No fulfillments with status "${statusFilter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {items.map((fulfillment) => (
            <div
              key={fulfillment.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white font-mono">
                    Order #{fulfillment.orderRef}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      fulfillment.status === 'delivered'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : fulfillment.status === 'out_for_delivery' ||
                          fulfillment.status === 'in_transit'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {fulfillment.status.replace('_', ' ')}
                  </span>
                  {fulfillment.partnerName && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-900 text-slate-400 border border-slate-800">
                      Partner: {fulfillment.partnerName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                  <span className="font-semibold text-slate-200">
                    {fulfillment.customerName}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{fulfillment.customerPhone}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{fulfillment.deliveryZoneName || 'Nairobi'}</span>
                  </span>
                  {fulfillment.trackingNo && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-emerald-400">
                        Track: {fulfillment.trackingNo}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleOpenEdit(fulfillment)}
                  className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-800 transition-colors"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Update Dispatch</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dispatch Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Dispatch Lifecycle: Order #{editingItem.orderRef}
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  Customer: {editingItem.customerName} ({editingItem.customerPhone})
                </div>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  Fulfillment Status Transition
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="assigned">Assigned to Dispatch</option>
                  <option value="picked_up">Picked Up by Rider</option>
                  <option value="in_transit">In Transit to Destination</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered to Customer</option>
                  <option value="failed_attempt">Delivery Attempt Failed</option>
                  <option value="returned">Returned to Hub</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">
                    Courier Partner Name
                  </label>
                  <input
                    type="text"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="e.g. Fargo, Sendy, In-House"
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNo}
                    onChange={(e) => setTrackingNo(e.target.value)}
                    placeholder="e.g. TRK-98241"
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">
                    Rider / Driver Name
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Driver full name"
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">
                    Rider Phone Number
                  </label>
                  <input
                    type="text"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    placeholder="e.g. 0712345678"
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFulfillment}
                disabled={isActionPending}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Save Dispatch Updates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
