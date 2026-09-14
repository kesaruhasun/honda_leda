import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  PackagePlus,
  Search,
  CheckCircle2,
  Clock,
  ArrowDownCircle,
  Boxes,
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { pharmacyApi } from '../services/api';
import { Drug, Prescription } from '../types';

export const PharmacyView: React.FC = () => {
  const { showToast } = useToast();
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'inventory' | 'dispensary'>('dispensary');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddShipmentOpen, setIsAddShipmentOpen] = useState(false);

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

  const handleDispense = async (prescriptionId: number) => {
    try {
      await pharmacyApi.dispensePrescription(prescriptionId);
      showToast('success', 'Prescription Dispensed', `Stock automatically deducted for prescription.`);
      fetchData();
    } catch (err: any) {
      showToast('error', 'Dispensing Failed', err.message || 'Insufficient stock or invalid prescription');
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

  const getDrugStock = (d: Drug) => d.stockQuantity ?? d.currentStock ?? 0;
  const lowStockDrugs = drugs.filter((d) => getDrugStock(d) <= (d.reorderLevel || 20));

  const filteredDrugs = drugs.filter((d) => {
    const name = (d.drugName || d.brandName || '').toLowerCase();
    const generic = (d.genericName || '').toLowerCase();
    const code = (d.itemCode || d.drugCode || String(d.drugId || '')).toLowerCase();
    const q = searchTerm.toLowerCase();
    return name.includes(q) || generic.includes(q) || code.includes(q);
  });

  const filteredPrescriptions = prescriptions.filter((p) => {
    const pat = (p.patientName || '').toLowerCase();
    const doc = (p.doctorName || p.prescribedDoctorName || '').toLowerCase();
    const med = (p.drugName || p.items?.[0]?.drugName || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return pat.includes(q) || doc.includes(q) || med.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-clinical-ink tracking-tight">Central Dispensary & Therapeutics</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200">
              Real-Time Stock Deduction
            </span>
          </div>
          <p className="text-xs text-clinical-ink-muted mt-1">
            Formulary management, batch expiry tracking, prescription fulfillment, and stock integrity.
          </p>
        </div>
        <button
          onClick={() => setIsAddShipmentOpen(true)}
          className="apple-btn inline-flex items-center gap-2 px-4 py-2 rounded-apple-xl bg-clinical-teal-600 text-white text-xs font-semibold hover:bg-clinical-teal-700 shadow-sm"
        >
          <PackagePlus className="h-4 w-4" />
          <span>Log Drug Shipment Intake</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Formulary Items"
          value={drugs.length}
          subtitle="Hospital drug catalog"
          icon={Boxes}
          variant="teal"
        />
        <MetricCard
          title="Low-Stock Alert"
          value={lowStockDrugs.length}
          subtitle="At or below reorder threshold"
          icon={AlertTriangle}
          variant={lowStockDrugs.length > 0 ? 'coral' : 'emerald'}
        />
        <MetricCard
          title="Prescriptions Pending"
          value={prescriptions.filter((p) => !p.dispensed && p.status !== 'DISPENSED').length}
          subtitle="Awaiting pharmacist fulfillment"
          icon={Clock}
          variant="amber"
        />
        <MetricCard
          title="Dispensed Today"
          value={prescriptions.filter((p) => p.dispensed || p.status === 'DISPENSED').length}
          subtitle="Fulfillments finalized"
          icon={CheckCircle2}
          variant="slate"
        />
      </div>

      {/* Tab Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 apple-card p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('dispensary')}
            className={`apple-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'dispensary'
                ? 'bg-clinical-teal-600 text-white shadow-2xs'
                : 'bg-white text-clinical-ink-secondary border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Prescription Queue ({prescriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`apple-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'inventory'
                ? 'bg-clinical-teal-600 text-white shadow-2xs'
                : 'bg-white text-clinical-ink-secondary border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Formulary Stock Inventory ({drugs.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'dispensary'
                ? 'Search patient, doctor, or medication...'
                : 'Search drug, generic, or item code...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-clinical-ink focus:outline-none focus:ring-2 focus:ring-clinical-teal-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-8 w-8 border-2 border-clinical-teal-600 border-t-transparent rounded-full" />
        </div>
      ) : activeTab === 'dispensary' ? (
        /* Prescriptions Dispensary Table */
        <div className="apple-card overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-clinical-ink-secondary font-semibold border-b border-slate-200">
                  <th className="py-3 px-4 font-mono">Prescription #</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Attending Doctor</th>
                  <th className="py-3 px-4">Medication & Strength</th>
                  <th className="py-3 px-4">Dosage Regimen</th>
                  <th className="py-3 px-4 font-mono">Qty</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Fulfillment</th>
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
                    <tr key={prs.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-clinical-teal-700">
                        {prs.prescriptionNumber || `RX-${prs.id}`}
                      </td>
                      <td className="py-3 px-4 font-semibold text-clinical-ink">
                        {prs.patientName}
                      </td>
                      <td className="py-3 px-4 text-slate-700">{doc}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{drugName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{dosage}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{freq} &bull; {duration} days</div>
                        <div className="text-[10px] text-slate-400 italic">{instructions}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{qty}</td>
                      <td className="py-3 px-4">
                        <Badge variant={isDispensed ? 'success' : 'warning'}>
                          {isDispensed ? 'DISPENSED' : 'PENDING'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isDispensed ? (
                          <button
                            onClick={() => handleDispense(prs.id)}
                            className="apple-btn inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-clinical-teal-600 hover:bg-clinical-teal-700 text-white font-semibold text-xs shadow-2xs"
                          >
                            <ArrowDownCircle className="h-3.5 w-3.5" />
                            <span>Dispense Stock</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-mono text-slate-400">
                            {prs.dispensedDate || prs.issuedDate ? `Dispensed ${prs.dispensedDate || prs.issuedDate}` : 'Fulfilled'}
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
        /* Inventory Table */
        <div className="apple-card overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-clinical-ink-secondary font-semibold border-b border-slate-200">
                  <th className="py-3 px-4 font-mono">Item Code</th>
                  <th className="py-3 px-4">Brand / Generic Name</th>
                  <th className="py-3 px-4 font-mono">Strength</th>
                  <th className="py-3 px-4 font-mono">Unit Price</th>
                  <th className="py-3 px-4 font-mono">Current Stock</th>
                  <th className="py-3 px-4 font-mono">Reorder Level</th>
                  <th className="py-3 px-4 font-mono">Batch / Expiry</th>
                  <th className="py-3 px-4">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDrugs.map((drug) => {
                  const stock = getDrugStock(drug);
                  const isLow = stock <= (drug.reorderLevel || 20);
                  const code = drug.itemCode || drug.drugCode || String(drug.drugId || `MED-${drug.id}`);
                  const name = drug.drugName || drug.brandName || 'Medicine';

                  return (
                    <tr key={drug.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-clinical-teal-700">{code}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{name}</div>
                        <div className="text-[10px] text-slate-500 italic">{drug.genericName}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">{drug.strength || drug.dosageForm || 'Tablet'}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        LKR {Number(drug.unitPrice).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        <span className={isLow ? 'text-rose-600' : 'text-slate-900'}>
                          {stock} units
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">{drug.reorderLevel} units</td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        <div>{drug.batchNumber || 'BCH-2026'}</div>
                        <div className="text-[10px] text-slate-400">Exp: {drug.expiryDate}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            isLow
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
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
              <label className="block font-semibold text-slate-700 mb-1">Item Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. MED-109"
                value={shipmentForm.itemCode}
                onChange={(e) => setShipmentForm({ ...shipmentForm, itemCode: e.target.value })}
                className="w-full font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Medicine Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Lipitor 20mg"
                value={shipmentForm.drugName}
                onChange={(e) => setShipmentForm({ ...shipmentForm, drugName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Generic Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Atorvastatin Calcium"
                value={shipmentForm.genericName}
                onChange={(e) => setShipmentForm({ ...shipmentForm, genericName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Strength / Form *</label>
              <input
                type="text"
                required
                placeholder="e.g. 20mg Tablet"
                value={shipmentForm.strength}
                onChange={(e) => setShipmentForm({ ...shipmentForm, strength: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit Price (LKR) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={shipmentForm.unitPrice}
                onChange={(e) => setShipmentForm({ ...shipmentForm, unitPrice: Number(e.target.value) })}
                className="w-full font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quantity Added *</label>
              <input
                type="number"
                required
                value={shipmentForm.stockQuantity}
                onChange={(e) => setShipmentForm({ ...shipmentForm, stockQuantity: Number(e.target.value) })}
                className="w-full font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reorder Level *</label>
              <input
                type="number"
                required
                value={shipmentForm.reorderLevel}
                onChange={(e) => setShipmentForm({ ...shipmentForm, reorderLevel: Number(e.target.value) })}
                className="w-full font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Batch Number</label>
              <input
                type="text"
                value={shipmentForm.batchNumber}
                onChange={(e) => setShipmentForm({ ...shipmentForm, batchNumber: e.target.value })}
                className="w-full font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
              <input
                type="date"
                value={shipmentForm.expiryDate}
                onChange={(e) => setShipmentForm({ ...shipmentForm, expiryDate: e.target.value })}
                className="w-full font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-clinical-teal-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddShipmentOpen(false)}
              className="apple-btn px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="apple-btn px-4 py-2 text-xs font-semibold bg-clinical-teal-600 text-white rounded-lg hover:bg-clinical-teal-700 shadow-sm"
            >
              Intake Stock
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default PharmacyView;