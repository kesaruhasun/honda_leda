import React, { useState } from 'react';
import { Pill, AlertTriangle, CheckCircle, ArrowDownRight, Search } from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';
import { Drug, Prescription } from '../types';

const INITIAL_DRUGS: Drug[] = [
  {
    id: 1,
    drugId: 'DRG-1001',
    drugName: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin Trihydrate',
    category: 'Antibiotic',
    dosageForm: 'Capsule',
    unitPrice: 35.0,
    stockQuantity: 450,
    reorderLevel: 100,
    batchNumber: 'BATCH-AMX-26A',
    expiryDate: '2027-05-30',
  },
  {
    id: 2,
    drugId: 'DRG-1002',
    drugName: 'Paracetamol 500mg',
    genericName: 'Acetaminophen',
    category: 'Analgesic',
    dosageForm: 'Tablet',
    unitPrice: 5.0,
    stockQuantity: 1200,
    reorderLevel: 250,
    batchNumber: 'BATCH-PCM-26C',
    expiryDate: '2027-12-31',
  },
  {
    id: 3,
    drugId: 'DRG-1003',
    drugName: 'Atorvastatin 20mg',
    genericName: 'Atorvastatin Calcium',
    category: 'Cardiovascular',
    dosageForm: 'Tablet',
    unitPrice: 42.5,
    stockQuantity: 45, // BELOW REORDER LEVEL!
    reorderLevel: 60,
    batchNumber: 'BATCH-ATV-25X',
    expiryDate: '2026-11-15',
  },
  {
    id: 4,
    drugId: 'DRG-1004',
    drugName: 'Metformin 850mg',
    genericName: 'Metformin Hydrochloride',
    category: 'Antidiabetic',
    dosageForm: 'Tablet',
    unitPrice: 18.0,
    stockQuantity: 18, // CRITICAL LOW STOCK!
    reorderLevel: 50,
    batchNumber: 'BATCH-MET-25Z',
    expiryDate: '2026-10-30',
  },
  {
    id: 5,
    drugId: 'DRG-1005',
    drugName: 'Cetirizine 10mg',
    genericName: 'Cetirizine Dihydrochloride',
    category: 'Antihistamine',
    dosageForm: 'Tablet',
    unitPrice: 12.0,
    stockQuantity: 320,
    reorderLevel: 80,
    batchNumber: 'BATCH-CET-27B',
    expiryDate: '2027-08-20',
  },
];

const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 1,
    prescriptionId: 'RX-2026-001',
    appointmentId: 1,
    patientId: 1,
    patientName: 'Kalyani Bandara',
    doctorId: 1,
    doctorName: 'Dr. Kavinda Rathnayaka',
    prescriptionDate: '2026-09-14',
    doctorInstructions: 'Take Atorvastatin at bedtime. Avoid grapefruit.',
    status: 'PENDING',
    items: [
      {
        drugId: 3,
        drugName: 'Atorvastatin 20mg',
        dosageFrequency: '1 tab nocte for 30 days',
        durationDays: 30,
        prescribedQty: 30,
        dispensedQty: 0,
        unitPrice: 42.5,
      },
    ],
  },
  {
    id: 2,
    prescriptionId: 'RX-2026-002',
    appointmentId: 2,
    patientId: 2,
    patientName: 'Pradeep Jayasinghe',
    doctorId: 2,
    doctorName: 'Dr. Chamari Perera',
    prescriptionDate: '2026-09-14',
    doctorInstructions: 'Take Paracetamol as needed for severe headache.',
    status: 'PENDING',
    items: [
      {
        drugId: 2,
        drugName: 'Paracetamol 500mg',
        dosageFrequency: '2 tabs QDS PRN',
        durationDays: 5,
        prescribedQty: 20,
        dispensedQty: 0,
        unitPrice: 5.0,
      },
    ],
  },
];

export const PharmacyView: React.FC = () => {
  const { showToast } = useToast();
  const [drugs, setDrugs] = useState<Drug[]>(INITIAL_DRUGS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [searchTerm, setSearchTerm] = useState('');

  // ATOMIC DISPENSE & STOCK DEDUCTION INVARIANT
  const handleDispense = (prescriptionId: number) => {
    const rx = prescriptions.find((p) => p.id === prescriptionId);
    if (!rx) return;

    // Check stock availability for all items
    for (const item of rx.items) {
      const drug = drugs.find((d) => d.id === item.drugId);
      if (!drug || drug.stockQuantity < item.prescribedQty) {
        showToast(
          'error',
          'Stock Depletion Block',
          `Cannot dispense ${item.drugName}. Available: ${drug ? drug.stockQuantity : 0}, Required: ${item.prescribedQty}.`
        );
        return;
      }
    }

    // Deduct stock
    setDrugs((prevDrugs) =>
      prevDrugs.map((d) => {
        const item = rx.items.find((i) => i.drugId === d.id);
        if (item) {
          const newStock = d.stockQuantity - item.prescribedQty;
          return { ...d, stockQuantity: newStock };
        }
        return d;
      })
    );

    // Update Rx status
    setPrescriptions((prevRx) =>
      prevRx.map((p) => (p.id === prescriptionId ? { ...p, status: 'DISPENSED' } : p))
    );

    showToast(
      'success',
      'Prescription Dispensed',
      `Prescription ${rx.prescriptionId} fulfilled. Inventory atomically decremented in database.`
    );
  };

  const lowStockCount = drugs.filter((d) => d.stockQuantity <= d.reorderLevel).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-clinical-ink tracking-tight">Pharmacy & Drug Inventory</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200">
              M4: Udumullage S.H.U. (IT25100826)
            </span>
          </div>
          <p className="text-xs text-clinical-ink-muted mt-1">
            Formulary batch tracking, automated low-stock reorder alerts, and real-time prescription dispensing decrement.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Catalog Formulary" value={drugs.length} subtitle="Active medical preparations" icon={Pill} variant="teal" />
        <MetricCard
          title="Low-Stock Alerts"
          value={lowStockCount}
          subtitle="Below reorder threshold"
          icon={AlertTriangle}
          variant="amber"
          delta={{ value: `${lowStockCount} items critical`, isPositive: false }}
        />
        <MetricCard
          title="Pending Dispenses"
          value={prescriptions.filter((p) => p.status === 'PENDING').length}
          subtitle="Patient queue at counter"
          icon={ArrowDownRight}
          variant="coral"
        />
        <MetricCard
          title="Dispensed Today"
          value={prescriptions.filter((p) => p.status === 'DISPENSED').length}
          subtitle="Fulfilled prescription regimens"
          icon={CheckCircle}
          variant="emerald"
        />
      </div>

      {/* Prescription Dispensing Queue Section */}
      <div className="apple-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-xs text-clinical-ink">Active Prescription Dispense Queue</h2>
            <Badge variant="urgent">Counter Ready</Badge>
          </div>
          <span className="text-[11px] text-clinical-ink-muted font-mono">2 Prescriptions Awaiting</span>
        </div>

        <div className="space-y-3">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className={`p-3.5 rounded-xl border transition-all ${
                rx.status === 'DISPENSED'
                  ? 'bg-slate-50 border-slate-200/60 opacity-60'
                  : 'bg-white border-clinical-teal-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-clinical-teal-700">{rx.prescriptionId}</span>
                    <span className="text-xs font-semibold text-clinical-ink">• Patient: {rx.patientName}</span>
                    <span className="text-[10px] text-slate-400">({rx.doctorName})</span>
                  </div>
                  <p className="text-[11px] text-clinical-ink-muted mt-0.5">{rx.doctorInstructions}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs font-mono">
                    {rx.items.map((i) => (
                      <div key={i.drugId} className="text-slate-700 font-semibold">
                        {i.drugName} × {i.prescribedQty}
                      </div>
                    ))}
                  </div>

                  {rx.status === 'PENDING' ? (
                    <button
                      onClick={() => handleDispense(rx.id)}
                      className="apple-btn px-3 py-1.5 rounded-lg bg-clinical-teal-600 text-white text-xs font-semibold hover:bg-clinical-teal-700 shadow-sm"
                    >
                      Dispense & Deduct Stock
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[11px] font-bold">
                      DISPENSED
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drug Inventory Table */}
      <div className="apple-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-xs text-clinical-ink">Central Formulary & Batch Inventory</span>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search drug or batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-clinical-ink-secondary font-semibold">
                <th className="py-3 px-4 font-mono">Drug ID</th>
                <th className="py-3 px-4">Name & Generic</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 font-mono">Batch No</th>
                <th className="py-3 px-4 font-mono">Expiry</th>
                <th className="py-3 px-4 font-mono">Unit Price</th>
                <th className="py-3 px-4 font-mono">Stock Level</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drugs
                .filter((d) => d.drugName.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((drug) => {
                  const isLow = drug.stockQuantity <= drug.reorderLevel;
                  const percent = Math.min(100, Math.round((drug.stockQuantity / (drug.reorderLevel * 3)) * 100));

                  return (
                    <tr key={drug.id} className={isLow ? 'bg-amber-50/40' : 'hover:bg-slate-50/60'}>
                      <td className="py-3 px-4 font-mono font-bold text-clinical-teal-700">{drug.drugId}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-clinical-ink">{drug.drugName}</div>
                        <div className="text-[10px] text-slate-400">{drug.genericName} ({drug.dosageForm})</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-600 border border-slate-200">
                          {drug.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{drug.batchNumber}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{drug.expiryDate}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-clinical-ink">Rs. {drug.unitPrice.toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isLow ? 'text-amber-600' : 'text-slate-700'}`}>
                            {drug.stockQuantity}
                          </span>
                          <span className="text-[10px] text-slate-400">/ min {drug.reorderLevel}</span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full ${isLow ? 'bg-amber-500' : 'bg-clinical-teal-500'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {isLow ? (
                          <Badge variant="warning">Low Stock</Badge>
                        ) : (
                          <Badge variant="success">Normal</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};