import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  PackagePlus,
  Search,
  CheckCircle2,
  Clock,
  ArrowDownCircle,
  Boxes,
  Barcode,
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { BarcodeScannerModal } from '../components/common/BarcodeScannerModal';
import { useToast } from '../context/ToastContext';
import { pharmacyApi } from '../services/api';
import { Drug, Prescription } from '../types';
import { Camera } from 'lucide-react';

export const PharmacyView: React.FC = () => {
  const { showToast } = useToast();
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'dispensary' | 'inventory'>('dispensary');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddShipmentOpen, setIsAddShipmentOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);

  // Barcode Scanning Focal Zone
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [scannedDrug, setScannedDrug] = useState<Drug | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Poka-Yoke Dispensing Verification Modal
  const [dispenseModalRx, setDispenseModalRx] = useState<Prescription | null>(null);
  const [dispensingInProgress, setDispensingInProgress] = useState(false);
  const [pharmacistVerified, setPharmacistVerified] = useState(false);
  const [allergyChecked, setAllergyChecked] = useState(false);

  // New Shipment Form State
  const [shipmentForm, setShipmentForm] = useState({
    itemCode: '',
    drugName: '',
    genericName: '',
    strength: '',
    dosageForm: 'Tablet',
    unitPrice: 25.0,
    stockQuantity: 100,
    reorderLevel: 20,
    batchNumber: 'BCH-2026-001',
    expiryDate: '2027-12-31',
    manufacturer: 'State Pharmaceuticals Manufacturing Corporation',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [drugRes, prsRes] = await Promise.all([
        pharmacyApi.getDrugs(),
        pharmacyApi.getPrescriptions(),
      ]);
      setDrugs(drugRes.data);
      setPrescriptions(prsRes.data);
    } catch (err: any) {
      showToast('error', 'Error Loading Pharmacy Data', err.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDrugStock = (d: Drug) => d.stockQuantity ?? d.currentStock ?? 0;
  const lowStockDrugs = drugs.filter((d) => getDrugStock(d) <= (d.reorderLevel || 20));

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
      showToast(
        'success',
        'Barcode Verified',
        `Recognized: ${matched.drugName || matched.brandName} (${matched.batchNumber || 'Batch Active'})`
      );
    } else {
      showToast('error', 'Item Not Found', `No registered batch matches barcode '${barcodeQuery}'.`);
    }
  };

  const handleConfirmDispense = async () => {
    if (!dispenseModalRx) return;
    if (!pharmacistVerified || !allergyChecked) {
      showToast('error', 'Safety Verification Required', 'Both pharmacist check and allergy verification must be acknowledged.');
      return;
    }

    try {
      setDispensingInProgress(true);
      await pharmacyApi.dispensePrescription(dispenseModalRx.id);
      showToast(
        'success',
        'Prescription Dispensed & Stock Deducted',
        `Prescription RX-${dispenseModalRx.id} verified and deducted from dispensary inventory.`
      );
      setDispenseModalRx(null);
      setPharmacistVerified(false);
      setAllergyChecked(false);
      fetchData();
    } catch (err: any) {
      showToast('error', 'Dispensation Blocked', err.message || 'Insufficient stock or system error');
    } finally {
      setDispensingInProgress(false);
    }
  };

  const handleAddShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipmentForm.itemCode || !shipmentForm.drugName || !shipmentForm.genericName) {
      showToast('error', 'Validation Error', 'Please complete all required fields.');
      return;
    }

    try {
      const res = await pharmacyApi.addShipment(shipmentForm);
      setDrugs((prev) => [res.data, ...prev]);
      setIsAddShipmentOpen(false);
      showToast('success', 'Shipment Logged', `Stock updated for ${res.data.drugName || shipmentForm.drugName}`);
      setShipmentForm({
        itemCode: '',
        drugName: '',
        genericName: '',
        strength: '',
        dosageForm: 'Tablet',
        unitPrice: 25.0,
        stockQuantity: 100,
        reorderLevel: 20,
        batchNumber: 'BCH-2026-001',
        expiryDate: '2027-12-31',
        manufacturer: 'State Pharmaceuticals Manufacturing Corporation',
      });
    } catch (err: any) {
      showToast('error', 'Shipment Intake Failed', err.message || 'Failed to add shipment');
    }
  };

  const filteredDrugs = drugs.filter((d) => {
    const name = (d.drugName || d.brandName || '').toLowerCase();
    const generic = (d.genericName || '').toLowerCase();
    const code = (d.itemCode || d.drugCode || String(d.drugId || '')).toLowerCase();
    const batch = (d.batchNumber || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return name.includes(q) || generic.includes(q) || code.includes(q) || batch.includes(q);
  });

  const filteredPrescriptions = prescriptions.filter((p) => {
    const pat = (p.patientName || '').toLowerCase();
    const doc = (p.doctorName || p.prescribedDoctorName || '').toLowerCase();
    const med = (p.drugName || p.items?.[0]?.drugName || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return pat.includes(q) || doc.includes(q) || med.includes(q);
  });

  // Calculate Expiry Warning
  const getExpiryStatus = (expiryDateStr?: string) => {
    if (!expiryDateStr) return { label: 'VALID', color: 'emerald' };
    const expDate = new Date(expiryDateStr);
    const now = new Date();
    const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 30) {
      return { label: `CRITICAL: ${diffDays}d`, color: 'rose' };
    }
    if (diffDays <= 90) {
      return { label: `EXPIRING: ${diffDays}d`, color: 'amber' };
    }
    return { label: 'HEALTHY', color: 'emerald' };
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Device-Compatible Clinical Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Pharmacy Dispensary &amp; Inventory Console
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[11px] font-semibold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Automated Batch &amp; Stock Tracking Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time stock deduction, barcode-assisted medication verification, batch expiration monitoring, and contraindication guards.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAddShipmentOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-colors shrink-0"
          >
            <PackagePlus className="h-4 w-4" />
            <span>+ Log Shipment Intake</span>
          </button>
        </div>
      </div>

      {/* Barcode-Scan Ready Focal Zone (Clinical Velocity / KLM) */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-teal-900 to-slate-900 text-white border border-teal-800/80 shadow-md">
        <form onSubmit={handleBarcodeScan} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 text-teal-300 text-xs font-bold shrink-0">
            <Barcode className="h-5 w-5" />
            <span>BARCODE VERIFY:</span>
          </div>

          <div className="relative flex-1 w-full">
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Scan barcode or type NDC / Item Code / Batch # (e.g. DRG-001, BCH-2026-001)..."
              value={barcodeQuery}
              onChange={(e) => setBarcodeQuery(e.target.value)}
              className="w-full pl-3.5 pr-20 py-2.5 text-xs font-mono bg-slate-950/70 border border-teal-500/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded transition-colors"
            >
              Verify
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsScannerModalOpen(true)}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs rounded-lg border border-teal-500/50 flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
          >
            <Camera className="h-4 w-4 text-teal-400" />
            <span>Camera Scanner</span>
          </button>

          {scannedDrug && (
            <div className="flex items-center gap-3 bg-teal-950/90 border border-teal-600/60 px-3 py-1.5 rounded-lg text-xs font-mono">
              <span className="text-teal-300 font-bold">{scannedDrug.brandName || scannedDrug.drugName}</span>
              <span className="text-slate-300">&bull; {scannedDrug.strength}</span>
              <span className="text-emerald-400 font-bold">Stock: {getDrugStock(scannedDrug)}</span>
              <button
                type="button"
                onClick={() => setScannedDrug(null)}
                className="text-slate-400 hover:text-white ml-1 text-xs"
              >
                &times;
              </button>
            </div>
          )}
        </form>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Catalogued Formulary"
          value={drugs.length}
          subtitle="Active pharmaceutical items"
          icon={Boxes}
          variant="teal"
        />
        <MetricCard
          title="Depletion Threshold"
          value={lowStockDrugs.length}
          subtitle="At or below reorder level"
          icon={AlertTriangle}
          variant={lowStockDrugs.length > 0 ? 'coral' : 'emerald'}
        />
        <MetricCard
          title="Prescriptions Pending"
          value={prescriptions.filter((p) => !p.dispensed && p.status !== 'DISPENSED').length}
          subtitle="Awaiting pharmacist verification"
          icon={Clock}
          variant="amber"
        />
        <MetricCard
          title="Dispensed Today"
          value={prescriptions.filter((p) => p.dispensed || p.status === 'DISPENSED').length}
          subtitle="Closed-loop fulfillments"
          icon={CheckCircle2}
          variant="slate"
        />
      </div>

      {/* Tab Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('dispensary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'dispensary'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Fulfillment Queue ({prescriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'inventory'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Formulary Stock & Batch Ledger ({drugs.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'dispensary'
                ? 'Search patient, doctor, or medication...'
                : 'Search drug, generic, batch or code...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-8 w-8 border-2 border-teal-600 border-t-transparent rounded-full" />
        </div>
      ) : activeTab === 'dispensary' ? (
        /* Prescriptions Dispensary Roster */
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4 font-mono">RX Order #</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Attending Physician</th>
                  <th className="py-3 px-4">Prescribed Medication</th>
                  <th className="py-3 px-4">Dosage & Regimen</th>
                  <th className="py-3 px-4 font-mono">Prescribed Qty</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPrescriptions.map((prs) => {
                  const isDispensed = prs.dispensed || prs.status === 'DISPENSED';
                  const drugName = prs.drugName || prs.items?.[0]?.drugName || 'Prescribed Medicine';
                  const dosage = prs.dosage || prs.items?.[0]?.dosage || 'As directed';
                  const freq = prs.frequency || prs.items?.[0]?.frequency || 'Daily';
                  const duration = prs.durationDays || prs.items?.[0]?.durationDays || 5;
                  const instructions = prs.instructions || prs.notes || prs.doctorInstructions || 'Take with water';
                  const qty = prs.quantity ?? prs.items?.[0]?.prescribedQuantity ?? prs.items?.[0]?.prescribedQty ?? 10;
                  const doc = prs.doctorName || prs.prescribedDoctorName || 'Consultant Doctor';

                  return (
                    <tr key={prs.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-teal-700">
                        {prs.prescriptionNumber || `RX-${prs.id}`}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{prs.patientName}</td>
                      <td className="py-3 px-4 text-slate-700">{doc}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{drugName}</div>
                        <div className="text-[10px] font-mono text-slate-500">{dosage}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{freq} &bull; {duration} days</div>
                        <div className="text-[10px] text-slate-400 italic line-clamp-1">{instructions}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">{qty}</td>
                      <td className="py-3 px-4">
                        <Badge variant={isDispensed ? 'success' : 'warning'}>
                          {isDispensed ? 'DISPENSED' : 'PENDING'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isDispensed ? (
                          <button
                            onClick={() => {
                              setDispenseModalRx(prs);
                              setPharmacistVerified(false);
                              setAllergyChecked(false);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-2xs transition-colors"
                          >
                            <ArrowDownCircle className="h-3.5 w-3.5" />
                            <span>Verify & Dispense</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Fulfilled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Ultra-Dense Formulary Stock & Batch Ledger (Tabular Figures & Reorder Bracketing) */
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4 font-mono">Item Code</th>
                  <th className="py-3 px-4">Brand / Generic Name</th>
                  <th className="py-3 px-4 font-mono">Strength / Form</th>
                  <th className="py-3 px-4 font-mono">Unit Price</th>
                  <th className="py-3 px-4 font-mono">Current Stock</th>
                  <th className="py-3 px-4 font-mono">Reorder Min</th>
                  <th className="py-3 px-4 font-mono">Batch Number</th>
                  <th className="py-3 px-4 font-mono">Expiration State</th>
                  <th className="py-3 px-4">Stock Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredDrugs.map((drug) => {
                  const stock = getDrugStock(drug);
                  const isLow = stock <= (drug.reorderLevel || 20);
                  const code = drug.itemCode || drug.drugCode || String(drug.drugId || `MED-${drug.id}`);
                  const name = drug.drugName || drug.brandName || 'Medicine';
                  const expStatus = getExpiryStatus(drug.expiryDate);

                  return (
                    <tr key={drug.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-teal-700">{code}</td>
                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold text-slate-900">{name}</div>
                        <div className="text-[10px] text-slate-500 italic">{drug.genericName}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{drug.strength || drug.dosageForm || 'Tablet'}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">
                        LKR {Number(drug.unitPrice).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-bold tabular-nums">
                        <span className={isLow ? 'text-rose-600 font-extrabold' : 'text-slate-900'}>
                          {stock}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 tabular-nums">{drug.reorderLevel || 20}</td>
                      <td className="py-3 px-4 text-slate-600">{drug.batchNumber || 'BCH-2026-001'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            expStatus.color === 'rose'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : expStatus.color === 'amber'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {expStatus.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isLow
                              ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {isLow ? 'REORDER NEEDED' : 'ADEQUATE'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Poka-Yoke Tactile Dispense Verification Modal */}
      {dispenseModalRx && (
        <Modal
          isOpen={true}
          onClose={() => setDispenseModalRx(null)}
          title="Tactile Dispensation Verification (Poka-Yoke Protocol)"
          subtitle="Mandatory ISO 9241-110 Verification to Prevent Medication Errors"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono space-y-1">
              <div>Prescription: <strong>{dispenseModalRx.prescriptionNumber || `RX-${dispenseModalRx.id}`}</strong></div>
              <div>Patient: <strong>{dispenseModalRx.patientName}</strong></div>
              <div>Attending Doctor: {dispenseModalRx.doctorName || 'Consultant Specialist'}</div>
              <div>
                Medication: <strong>{dispenseModalRx.drugName || dispenseModalRx.items?.[0]?.drugName || 'Prescribed Drug'}</strong>
              </div>
              <div>
                Quantity: <strong>{dispenseModalRx.quantity ?? dispenseModalRx.items?.[0]?.prescribedQuantity ?? 10} Units</strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <span className="font-bold text-[11px] uppercase tracking-wider block">Clinical Safety Checklist:</span>
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={allergyChecked}
                  onChange={(e) => setAllergyChecked(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <span>Cross-referenced patient allergies & contraindications in EHR</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={pharmacistVerified}
                  onChange={(e) => setPharmacistVerified(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <span>Inspected physical unit-dose blister packaging & expiration date</span>
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
                {dispensingInProgress ? 'Deducting Stock...' : 'Confirm Stock Deduction'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Shipment Modal */}
      <Modal
        isOpen={isAddShipmentOpen}
        onClose={() => setIsAddShipmentOpen(false)}
        title="Log Drug Shipment Intake"
        subtitle="Formulary inventory update with batch and expiry tracking"
        maxWidth="md"
      >
        <form onSubmit={handleAddShipment} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Item / NDC Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. DRG-011"
                value={shipmentForm.itemCode}
                onChange={(e) => setShipmentForm({ ...shipmentForm, itemCode: e.target.value })}
                className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Brand Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Lipitor"
                value={shipmentForm.drugName}
                onChange={(e) => setShipmentForm({ ...shipmentForm, drugName: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Generic Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Atorvastatin"
                value={shipmentForm.genericName}
                onChange={(e) => setShipmentForm({ ...shipmentForm, genericName: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Strength</label>
              <input
                type="text"
                placeholder="e.g. 20mg"
                value={shipmentForm.strength}
                onChange={(e) => setShipmentForm({ ...shipmentForm, strength: e.target.value })}
                className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Unit Price (LKR)</label>
              <input
                type="number"
                step="0.01"
                value={shipmentForm.unitPrice}
                onChange={(e) => setShipmentForm({ ...shipmentForm, unitPrice: parseFloat(e.target.value) || 0 })}
                className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Received Stock Qty</label>
              <input
                type="number"
                value={shipmentForm.stockQuantity}
                onChange={(e) => setShipmentForm({ ...shipmentForm, stockQuantity: parseInt(e.target.value) || 0 })}
                className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Reorder Level</label>
              <input
                type="number"
                value={shipmentForm.reorderLevel}
                onChange={(e) => setShipmentForm({ ...shipmentForm, reorderLevel: parseInt(e.target.value) || 0 })}
                className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Batch Number</label>
              <input
                type="text"
                value={shipmentForm.batchNumber}
                onChange={(e) => setShipmentForm({ ...shipmentForm, batchNumber: e.target.value })}
                className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Expiration Date</label>
              <input
                type="date"
                value={shipmentForm.expiryDate}
                onChange={(e) => setShipmentForm({ ...shipmentForm, expiryDate: e.target.value })}
                className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddShipmentOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-sm"
            >
              Log Shipment Stock
            </button>
          </div>
        </form>
      </Modal>

      {/* Optical Barcode Camera Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onScan={(code) => {
          setBarcodeQuery(code);
          const found = drugs.find((d) => {
            const itemCode = (d.itemCode || d.drugCode || String(d.drugId || '')).toLowerCase();
            const batch = (d.batchNumber || '').toLowerCase();
            const brand = (d.brandName || d.drugName || '').toLowerCase();
            const q = code.toLowerCase().trim();
            return itemCode === q || batch === q || brand === q;
          });
          if (found) {
            setScannedDrug(found);
            showToast('success', 'Barcode Verified', `Matched Formulary Drug: ${found.brandName || found.drugName}`);
          } else {
            showToast('warning', 'Barcode Scanned', `Scanned identifier: ${code}. No direct inventory match found.`);
          }
        }}
        mode="pharmacy"
      />
    </div>
  );
};

export default PharmacyView;
