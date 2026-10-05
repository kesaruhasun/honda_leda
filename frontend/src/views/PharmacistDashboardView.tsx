import React, { useState, useEffect } from 'react';
import {
  Pill,
  AlertTriangle,
  CheckCircle2,
  Package,
  Clock,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { pharmacyApi } from '../services/api';
import { Drug, Prescription } from '../types';

export const PharmacistDashboardView: React.FC = () => {
  const { showToast } = useToast();
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [dispensingId, setDispensingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [drugsRes, rxRes] = await Promise.all([
        pharmacyApi.getDrugs().catch(() => ({ data: [] })),
        pharmacyApi.getPrescriptions().catch(() => ({ data: [] })),
      ]);
      setDrugs(drugsRes.data || []);
      setPrescriptions(rxRes.data || []);
    } catch (err: any) {
      showToast('error', 'Error', 'Failed to load pharmacy data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDispense = async (prescriptionId: number) => {
    try {
      setDispensingId(prescriptionId);
      await pharmacyApi.dispensePrescription(prescriptionId);
      showToast('success', 'Medication Dispensed', 'Prescription fulfilled and inventory stock deducted.');
      fetchData();
    } catch (err: any) {
      showToast('error', 'Dispensation Blocked', err.message || 'Could not fulfill prescription');
    } finally {
      setDispensingId(null);
    }
  };

  const lowStockDrugs = drugs.filter((d) => (d.stockQuantity ?? 0) <= (d.reorderLevel || 50));
  const pendingRx = prescriptions.filter((rx) => rx.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Orders</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600"><Clock className="h-4 w-4" /></span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 font-mono">{pendingRx.length}</span>
            <span className="text-xs text-amber-600 ml-2 font-medium">waiting fulfillment</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Alerts</span>
            <span className="p-2 rounded-lg bg-rose-50 text-rose-600"><AlertTriangle className="h-4 w-4" /></span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 font-mono">{lowStockDrugs.length}</span>
            <span className="text-xs text-rose-600 ml-2 font-medium">below reorder level</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Catalogued Formulary</span>
            <span className="p-2 rounded-lg bg-teal-50 text-teal-600"><Pill className="h-4 w-4" /></span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 font-mono">{drugs.length}</span>
            <span className="text-xs text-slate-500 ml-2">active pharmaceutical items</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dispensary Status</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><Package className="h-4 w-4" /></span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-slate-800">Operational</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Prescription Fulfillment Queue */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Prescription Fulfillment Queue</h3>
              <p className="text-xs text-slate-500">Doctor-issued prescriptions waiting to be verified and dispensed</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold font-mono rounded bg-amber-50 text-amber-700 border border-amber-200">
              {pendingRx.length} Pending
            </span>
          </div>

          <div className="space-y-3">
            {pendingRx.length > 0 ? (
              pendingRx.map((rx) => (
                <div key={rx.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-900">RX-{rx.id}</span>
                      <span className="text-xs text-slate-500 ml-2">&bull; Patient ID: {rx.patientId}</span>
                    </div>
                    <button
                      onClick={() => handleDispense(rx.id)}
                      disabled={dispensingId === rx.id}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {dispensingId === rx.id ? 'Dispensing...' : 'Dispense & Deduct Stock'}
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-slate-200/60 text-xs space-y-1">
                    <span className="font-semibold text-slate-700 block">Medication / Instructions:</span>
                    <p className="text-slate-600 font-mono">{rx.notes || 'Routine prescription dosage'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                All clinical prescriptions have been fulfilled.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Low Stock Warnings */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-900">Stock Depletion Alerts</h3>
            </div>
            <span className="px-2 py-0.5 text-xs font-bold font-mono rounded bg-rose-50 text-rose-700">
              {lowStockDrugs.length}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[450px] overflow-y-auto">
            {lowStockDrugs.length > 0 ? (
              lowStockDrugs.map((d) => (
                <div key={d.id} className="p-3 rounded-lg border border-rose-100 bg-rose-50/40 space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-900">{d.brandName}</span>
                    <span className="text-xs font-mono font-bold text-rose-700">{d.stockQuantity} left</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Generic: {d.genericName} &bull; Min: {d.reorderLevel}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">Inventory levels are healthy across all batches.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacistDashboardView;
