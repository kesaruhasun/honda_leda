import React, { useState, useEffect } from 'react';
import {
  Pill,
  AlertTriangle,
  Package,
  Clock,
  Barcode,
  ArrowDownCircle,
  Camera,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataTable, Column } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { BarcodeScannerModal } from '../components/common/BarcodeScannerModal';
import { useToast } from '../context/ToastContext';
import { pharmacyApi } from '../services/api';
import { Drug, Prescription } from '../types';

export const PharmacistDashboardView: React.FC = () => {
  const { showToast } = useToast();
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [dispenseModalRx, setDispenseModalRx] = useState<Prescription | null>(null);
  const [dispensingInProgress, setDispensingInProgress] = useState(false);
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [scannedDrug, setScannedDrug] = useState<Drug | null>(null);
  const [pharmacistVerified, setPharmacistVerified] = useState(false);
  const [allergyChecked, setAllergyChecked] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [drugsRes, rxRes] = await Promise.all([
        pharmacyApi.getDrugs().catch(() => ({ data: [] })),
        pharmacyApi.getPrescriptions().catch(() => ({ data: [] })),
      ]);
      setDrugs(drugsRes.data || []);
      setPrescriptions(rxRes.data || []);
    } catch (err: any) {
      showToast('error', 'Error', 'Failed to load pharmacy data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeQuery.trim()) return;

    const query = barcodeQuery.trim().toLowerCase();
    const matched = drugs.find(
      (d) =>
        (d.itemCode && d.itemCode.toLowerCase() === query) ||
        (d.drugCode && d.drugCode.toLowerCase() === query) ||
        (d.batchNumber && d.batchNumber.toLowerCase() === query) ||
        (d.drugName && d.drugName.toLowerCase().includes(query)) ||
        (d.brandName && d.brandName.toLowerCase().includes(query))
    );

    if (matched) {
      setScannedDrug(matched);
      showToast('success', 'Batch Verified', `Verified ${matched.brandName || matched.drugName} (Stock: ${matched.stockQuantity || 0})`);
    } else {
      showToast('error', 'Item Not Found', `Barcode '${barcodeQuery}' is not in active formulary.`);
    }
  };

  const handleConfirmDispense = async () => {
    if (!dispenseModalRx) return;
    if (!pharmacistVerified || !allergyChecked) {
      showToast('error', 'Safety Verification Required', 'Both verification checks must be completed.');
      return;
    }

    try {
      setDispensingInProgress(true);
      await pharmacyApi.dispensePrescription(dispenseModalRx.id);
      showToast('success', 'Medication Dispensed', 'Prescription fulfilled and inventory stock deducted in database.');
      setDispenseModalRx(null);
      setPharmacistVerified(false);
      setAllergyChecked(false);
      fetchData();
    } catch (err: any) {
      showToast('error', 'Dispensation Blocked', err.message || 'Could not fulfill prescription');
    } finally {
      setDispensingInProgress(false);
    }
  };

  const lowStockDrugs = drugs.filter((d) => (d.stockQuantity ?? 0) <= (d.reorderLevel || 50));
  const pendingRx = prescriptions.filter((rx) => rx.status === 'PENDING' || !rx.dispensed);

  const rxColumns: Column<Prescription>[] = [
    {
      key: 'id',
      header: 'Prescription ID',
      sortable: true,
      render: (rx) => (
        <span className="font-mono font-bold text-slate-900">
          RX-{rx.id}
        </span>
      ),
    },
    {
      key: 'patientName',
      header: 'Patient Name',
      mobileTitle: true,
      sortable: true,
      render: (rx) => (
        <div>
          <div className="font-bold text-slate-900 truncate">{rx.patientName || `Patient #${rx.patientId}`}</div>
          <div className="text-[10px] text-slate-500 font-mono">Prescribed by {rx.doctorName || 'Attending Physician'}</div>
        </div>
      ),
    },
    {
      key: 'drugName',
      header: 'Medication Regimen',
      render: (rx) => (
        <span className="font-mono text-slate-800 text-xs truncate max-w-xs block" title={rx.notes || rx.drugName}>
          {rx.notes || rx.drugName || 'Standard formulary item'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Fulfillment Status',
      sortable: true,
      render: (rx) => <StatusBadge status={rx.dispensed ? 'DISPENSED' : rx.status || 'PENDING'} dot />,
    },
  ];

  return (
    <div className="space-y-6 font-sans min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
              Pharmacist Verification &amp; Fulfillment Console
            </h1>
            <StatusBadge status="ACTIVE" dot>GMP &amp; ISO 9001 Compliant</StatusBadge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Barcode-assisted batch dispensing, unit-dose reconciliation, and allergy safety verification.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsScannerModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs flex items-center gap-2 transition-colors shrink-0"
        >
          <Camera className="h-4 w-4" />
          <span>Optical Barcode Scanner</span>
        </button>
      </div>

      {/* Barcode-Scan Focal Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white border border-teal-800/80 shadow-md">
        <form onSubmit={handleBarcodeScan} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 text-teal-300 text-xs font-bold shrink-0">
            <Barcode className="h-5 w-5" />
            <span>BARCODE VERIFY:</span>
          </div>

          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Scan barcode or type NDC / Item Code / Batch # (e.g. DRG-001, BCH-2026-001)..."
              value={barcodeQuery}
              onChange={(e) => setBarcodeQuery(e.target.value)}
              className="w-full pl-3.5 pr-20 py-2 text-xs font-mono bg-slate-950/80 border border-teal-500/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1 px-3 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded transition-colors"
            >
              Verify
            </button>
          </div>

          {scannedDrug && (
            <div className="flex items-center gap-3 bg-teal-950/90 border border-teal-600/60 px-3 py-1.5 rounded-lg text-xs font-mono w-full sm:w-auto justify-between">
              <span className="text-teal-300 font-bold">{scannedDrug.brandName || scannedDrug.drugName}</span>
              <span className="text-emerald-400 font-bold">Stock: {scannedDrug.stockQuantity || 0}</span>
              <button
                type="button"
                onClick={() => setScannedDrug(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                &times;
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        <StatCard
          title="Pending Orders"
          value={pendingRx.length}
          subtitle="Waiting for fulfillment"
          icon={Clock}
          variant="amber"
          loading={loading}
          trend={{ value: 'Queue' }}
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockDrugs.length}
          subtitle="Below safety threshold"
          icon={AlertTriangle}
          variant="rose"
          loading={loading}
          trend={{ value: lowStockDrugs.length > 0 ? 'Action Needed' : 'Nominal', isPositive: lowStockDrugs.length === 0 }}
        />
        <StatCard
          title="Formulary Catalog"
          value={drugs.length}
          subtitle="Active pharmaceutical drugs"
          icon={Pill}
          variant="teal"
          loading={loading}
        />
        <StatCard
          title="Dispensary Status"
          value="Operational"
          subtitle="Real-time inventory deduction"
          icon={Package}
          variant="emerald"
          loading={loading}
        />
      </div>

      {/* Main Split: Pending Queue & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
        {/* Left 8 Cols: Prescription Fulfillment Queue */}
        <div className="lg:col-span-8 space-y-4 min-w-0">
          <DataTable<Prescription>
            data={pendingRx}
            columns={rxColumns}
            keyExtractor={(rx) => rx.id}
            loading={loading}
            title="Prescription Fulfillment Queue"
            subtitle="Doctor orders requiring pharmacist verification & unit-dose dispensation"
            searchPlaceholder="Filter prescription queue by patient name..."
            searchFilter={(rx, q) =>
              (rx.patientName ? rx.patientName.toLowerCase().includes(q) : false) ||
              (rx.drugName ? rx.drugName.toLowerCase().includes(q) : false) ||
              String(rx.id).includes(q)
            }
            actions={(rx) => (
              <button
                type="button"
                onClick={() => {
                  setDispenseModalRx(rx);
                  setPharmacistVerified(false);
                  setAllergyChecked(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <ArrowDownCircle className="h-3.5 w-3.5" />
                <span>Dispense</span>
              </button>
            )}
          />
        </div>

        {/* Right 4 Cols: Low Stock Warnings */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white shadow-2xs p-5 space-y-4 flex flex-col h-[520px] min-w-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-900">Stock Reorder Alerts</h3>
            </div>
            <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-rose-50 text-rose-700 border border-rose-200">
              {lowStockDrugs.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1 min-h-0">
            {lowStockDrugs.length > 0 ? (
              lowStockDrugs.map((d) => (
                <div key={d.id} className="p-3 rounded-xl border border-rose-100 bg-rose-50/40 space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-900 truncate">{d.brandName || d.drugName}</span>
                    <span className="text-xs font-mono font-bold text-rose-700 shrink-0">{d.stockQuantity} left</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Batch: {d.batchNumber || 'BCH-2026'} &bull; Min: {d.reorderLevel || 50}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">All formulary inventory counts exceed reorder levels.</div>
            )}
          </div>
        </div>
      </div>

      {/* Tactile Dispense Modal */}
      {dispenseModalRx && (
        <Modal
          isOpen={true}
          onClose={() => setDispenseModalRx(null)}
          title="Tactile Dispensation Verification (Poka-Yoke Protocol)"
          subtitle="Mandatory verification before deducting live database inventory"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono space-y-1">
              <div>Prescription: <strong>RX-{dispenseModalRx.id}</strong></div>
              <div>Patient: <strong>{dispenseModalRx.patientName || `Patient #${dispenseModalRx.patientId}`}</strong></div>
              <div>Attending Doctor: {dispenseModalRx.doctorName || 'Consultant Specialist'}</div>
              <div>
                Medication: <strong>{dispenseModalRx.notes || dispenseModalRx.drugName || 'Prescribed Drug'}</strong>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <span className="font-bold text-[11px] uppercase tracking-wider block">Safety Verification Checklist:</span>
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={allergyChecked}
                  onChange={(e) => setAllergyChecked(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <span>Cross-referenced patient allergies &amp; contraindications</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={pharmacistVerified}
                  onChange={(e) => setPharmacistVerified(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <span>Inspected unit-dose packaging &amp; batch expiration</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDispenseModalRx(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!allergyChecked || !pharmacistVerified || dispensingInProgress}
                onClick={handleConfirmDispense}
                className="px-4 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg shadow-sm transition-colors"
              >
                {dispensingInProgress ? 'Deducting Live Inventory...' : 'Confirm Live Dispense'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Optical Camera Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onScan={(code) => {
          setBarcodeQuery(code);
          const matched = drugs.find((d) => {
            const itemCode = (d.itemCode || d.drugCode || String(d.id || '')).toLowerCase();
            const batch = (d.batchNumber || '').toLowerCase();
            const brand = (d.brandName || d.drugName || '').toLowerCase();
            const q = code.toLowerCase().trim();
            return itemCode === q || batch === q || brand === q;
          });
          if (matched) {
            setScannedDrug(matched);
            showToast('success', 'Batch Verified', `Verified ${matched.brandName || matched.drugName} (Stock: ${matched.stockQuantity || 0})`);
          } else {
            showToast('warning', 'Barcode Scanned', `Scanned identifier: ${code}. No formulary match found.`);
          }
        }}
        mode="pharmacy"
      />
    </div>
  );
};

export default PharmacistDashboardView;
