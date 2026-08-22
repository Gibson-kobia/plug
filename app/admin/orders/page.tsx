'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Phone,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Truck,
} from 'lucide-react';
import type { AdminOrderItem } from '@/lib/admin/types';
import { updateOrderStatusAction } from '@/lib/admin/actions';

export default function AdminOrdersPage() {
  const [items, setItems] = useState<AdminOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isActionPending, setIsActionPending] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?status=${statusFilter}`);
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
    loadOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setIsActionPending(true);
    setFeedback(null);
    try {
      const res = await updateOrderStatusAction(orderId, newStatus);
      if (res.success) {
        setFeedback({ message: res.message });
        setItems((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      } else {
        setFeedback({ message: res.message, isError: true });
      }
    } finally {
      setIsActionPending(false);
    }
  };

  const filteredOrders = items.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.ref.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.customerPhone.includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-rose-400" />
            <span>Orders Management</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track customer orders, WhatsApp verification, line items, and delivery zones.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950 border border-slate-800 overflow-x-auto self-start sm:self-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'pending_whatsapp', label: 'Pending WA' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'processing', label: 'Processing' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-rose-500 text-white font-bold'
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

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Order Ref (e.g. ELEC-2608-A1B2), Customer Name, or Phone..."
          className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
        />
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm font-mono flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-rose-400" />
          <span>Loading orders from database...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="text-base font-semibold text-slate-300">
            No orders found
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No orders matching "${searchQuery}".`
              : 'No orders recorded in this status. New customer checkouts will appear here immediately.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all overflow-hidden"
            >
              {/* Order Header Row */}
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white font-mono">
                      #{order.ref}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        order.status === 'delivered'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : order.status === 'confirmed' || order.status === 'processing'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : order.status === 'pending_whatsapp'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-900 text-slate-400 border border-slate-800">
                      {order.mode}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                    <span className="font-semibold text-slate-200">{order.customerName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{order.customerPhone}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{order.deliveryZoneName || order.pickupLocationName || 'Nairobi'}</span>
                    </span>
                    <span>•</span>
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-bold text-amber-400 font-mono">
                      KES {order.totalKes.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {order.itemsCount} item(s)
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Select */}
                    <select
                      value={order.status}
                      disabled={isActionPending}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 px-2.5 py-1.5 focus:outline-none focus:border-rose-500"
                    >
                      <option value="pending_whatsapp">Pending WhatsApp</option>
                      <option value="customer_contacted">Customer Contacted</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="ready_for_pickup">Ready for Pickup</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <button
                      onClick={() =>
                        setExpandedOrderId(expandedOrderId === order.id ? null : order.id)
                      }
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                    >
                      {expandedOrderId === order.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable Line Items Drawer */}
              {expandedOrderId === order.id && (
                <div className="p-4 bg-slate-900/60 border-t border-slate-800/80 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Order Line Items
                  </div>
                  {order.items.length === 0 ? (
                    <div className="text-xs text-slate-500">No item breakdown found</div>
                  ) : (
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-xs"
                        >
                          <div>
                            <div className="font-semibold text-white">{item.title}</div>
                            <div className="text-[10px] text-slate-400">
                              Qty: {item.qty} × KES {item.unitPriceKes.toLocaleString()}
                            </div>
                          </div>
                          <div className="font-mono font-bold text-slate-200">
                            KES {item.lineTotalKes.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
