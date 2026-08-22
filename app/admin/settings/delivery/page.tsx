'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Building,
  Save,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Edit2,
} from 'lucide-react';
import type { AdminDeliveryZoneItem, AdminPickupLocationItem } from '@/lib/admin/types';
import {
  updateDeliveryZoneAction,
  updatePickupLocationAction,
} from '@/lib/admin/actions';

export default function AdminDeliverySettingsPage() {
  const [zones, setZones] = useState<AdminDeliveryZoneItem[]>([]);
  const [pickupLocations, setPickupLocations] = useState<AdminPickupLocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingZone, setEditingZone] = useState<AdminDeliveryZoneItem | null>(null);
  const [feeKes, setFeeKes] = useState<number>(0);
  const [etaMinDays, setEtaMinDays] = useState<number>(0);
  const [etaMaxDays, setEtaMaxDays] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isActionPending, setIsActionPending] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/delivery');
      if (res.ok) {
        const data = await res.json();
        setZones(data.zones || []);
        setPickupLocations(data.pickupLocations || []);
      }
    } catch {
      setZones([]);
      setPickupLocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleOpenEditZone = (zone: AdminDeliveryZoneItem) => {
    setEditingZone(zone);
    setFeeKes(zone.feeKes);
    setEtaMinDays(zone.etaMinDays);
    setEtaMaxDays(zone.etaMaxDays);
    setIsActive(zone.active);
  };

  const handleSaveZone = async () => {
    if (!editingZone) return;
    setIsActionPending(true);
    setFeedback(null);

    try {
      const res = await updateDeliveryZoneAction(editingZone.id, {
        feeKes,
        etaMinDays,
        etaMaxDays,
        active: isActive,
      });

      if (res.success) {
        setFeedback({ message: res.message });
        setEditingZone(null);
        loadSettings();
      } else {
        setFeedback({ message: res.message, isError: true });
      }
    } finally {
      setIsActionPending(false);
    }
  };

  const handleTogglePickup = async (loc: AdminPickupLocationItem) => {
    setIsActionPending(true);
    setFeedback(null);

    try {
      const res = await updatePickupLocationAction(loc.id, {
        active: !loc.active,
      });

      if (res.success) {
        setFeedback({ message: res.message });
        loadSettings();
      } else {
        setFeedback({ message: res.message, isError: true });
      }
    } finally {
      setIsActionPending(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <MapPin className="w-6 h-6 text-amber-400" />
          <span>Delivery Zones & Fulfillment Pricing</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure approved delivery tariffs, estimated transit times, and physical collection hubs.
        </p>
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

      {/* Delivery Zones Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Regional Delivery Zones</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {zones.length} zone(s) registered
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm font-mono flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-spin text-amber-400" />
            <span>Loading delivery configuration...</span>
          </div>
        ) : zones.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
            No delivery zones configured in database. Run migration 0005 to seed baseline zones.
          </div>
        ) : (
          <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Zone Name</th>
                  <th className="py-3 px-4">Region Kind</th>
                  <th className="py-3 px-4">Delivery Tariff (KES)</th>
                  <th className="py-3 px-4">Transit ETA</th>
                  <th className="py-3 px-4">Active Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {zones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{zone.name}</td>
                    <td className="py-3 px-4 capitalize text-slate-400">{zone.kind}</td>
                    <td className="py-3 px-4">
                      {zone.feeKes > 0 ? (
                        <span className="font-mono font-bold text-amber-400">
                          KES {zone.feeKes.toLocaleString()}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-800">
                          Configuration Required
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {zone.etaMinDays === zone.etaMaxDays
                        ? `${zone.etaMinDays} day(s)`
                        : `${zone.etaMinDays}-${zone.etaMaxDays} day(s)`}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          zone.active
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-900 text-slate-500 border border-slate-800'
                        }`}
                      >
                        {zone.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenEditZone(zone)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1 ml-auto border border-slate-800 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Fee</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pickup Collection Hubs */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-400" />
            <span>Pickup Collection Hubs</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {pickupLocations.length} hub(s) registered
          </span>
        </div>

        {pickupLocations.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
            No physical collection hubs configured.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pickupLocations.map((loc) => (
              <div
                key={loc.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="font-bold text-sm text-white">{loc.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{loc.addressLine1}</div>
                  {loc.phone && (
                    <div className="text-[11px] text-slate-500 mt-1">Phone: {loc.phone}</div>
                  )}
                </div>

                <button
                  onClick={() => handleTogglePickup(loc)}
                  disabled={isActionPending}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    loc.active
                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300 hover:bg-emerald-900'
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'
                  }`}
                >
                  {loc.active ? 'Hub Active' : 'Hub Disabled'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Delivery Zone Modal */}
      {editingZone && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Edit Zone: {editingZone.name}</h3>
                <div className="text-xs text-slate-400 mt-0.5 capitalize">
                  Region: {editingZone.kind}
                </div>
              </div>
              <button
                onClick={() => setEditingZone(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  Approved Delivery Fee (KES)
                </label>
                <input
                  type="number"
                  value={feeKes}
                  onChange={(e) => setFeeKes(Number(e.target.value))}
                  min={0}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Min Transit Days</label>
                  <input
                    type="number"
                    value={etaMinDays}
                    onChange={(e) => setEtaMinDays(Number(e.target.value))}
                    min={0}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Max Transit Days</label>
                  <input
                    type="number"
                    value={etaMaxDays}
                    onChange={(e) => setEtaMaxDays(Number(e.target.value))}
                    min={etaMinDays}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="zoneActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                />
                <label htmlFor="zoneActive" className="text-xs font-semibold text-slate-300">
                  Zone is active for buyer checkout
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setEditingZone(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveZone}
                disabled={isActionPending}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors disabled:opacity-50"
              >
                Save Tariff Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
