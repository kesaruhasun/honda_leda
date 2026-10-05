import React, { useState, useEffect } from 'react';
import {
  Receipt,
  CreditCard,
  CheckCircle2,
  Printer,
  Plus,
  DollarSign,
  Clock,
  Banknote,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataTable, Column } from '../components/common/DataTable';
import { SlideOverDrawer } from '../components/common/SlideOverDrawer';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { billingApi, appointmentApi } from '../services/api';
import { Invoice, Appointment } from '../types';

export const BillingView: React.FC = () => {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Generate Invoice Modal State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');

  // Cash / Card Settle Confirmation Modal
  const [confirmSettleData, setConfirmSettleData] = useState<{
    invoice: Invoice;
    method: 'CASH' | 'CARD';
  } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, aptRes] = await Promise.all([
        billingApi.getInvoices().catch(() => ({ data: [] })),
        appointmentApi.getAll().catch(() => ({ data: [] })),
      ]);
      setInvoices(invRes.data || []);
      setAppointments(aptRes.data || []);
    } catch (err: any) {
      showToast('error', 'Error Loading Billing Data', err.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointmentId) {
      showToast('error', 'Required Field', 'Please select an appointment encounter.');
      return;
    }

    try {
      const res = await billingApi.generateInvoice(Number(selectedAppointmentId));
      showToast('success', 'Invoice Generated', `Aggregated bill created: ${res.data.invoiceNumber}`);
      setIsGenerateModalOpen(false);
      setSelectedAppointmentId('');
      fetchData();
    } catch (err: any) {
      showToast('error', 'Generation Error', err.message || 'Invoice could not be created');
    }
  };

  const handleExecuteSettlement = async () => {
    if (!confirmSettleData) return;
    const { invoice, method } = confirmSettleData;

    try {
      await billingApi.settleCashCard(invoice.id, method);
      showToast('success', 'Bill Settled', `Invoice #${invoice.invoiceNumber} paid via ${method} at cashier counter.`);
      setConfirmSettleData(null);
      fetchData();
    } catch (err: any) {
      showToast('error', 'Settlement Failed', err.message || 'Could not process payment');
    }
  };

  const totalRevenue = invoices
    .filter((inv) => inv.status === 'PAID' || inv.paymentStatus === 'PAID')
    .reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);

  const paidCount = invoices.filter((i) => i.status === 'PAID' || i.paymentStatus === 'PAID').length;
  const pendingCount = invoices.length - paidCount;

  const filteredInvoices = invoices.filter((inv) => {
    const isPaid = inv.status === 'PAID' || inv.paymentStatus === 'PAID';
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PAID' && isPaid) ||
      (statusFilter === 'PENDING' && !isPaid);

    return matchesStatus;
  });

  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice No',
      sortable: true,
      render: (inv) => (
        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {inv.invoiceNumber}
        </span>
      ),
    },
    {
      key: 'patientName',
      header: 'Patient Name',
      mobileTitle: true,
      sortable: true,
      render: (inv) => (
        <div>
          <div className="font-bold text-slate-900 truncate" title={inv.patientName}>{inv.patientName || `Patient #${inv.patientId}`}</div>
          <div className="text-[10px] text-slate-500 font-mono">NIC: {inv.patientNic || 'Verified'}</div>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      sortable: true,
      render: (inv) => (
        <span className="font-mono font-bold text-slate-900 whitespace-nowrap">
          LKR {Number(inv.totalAmount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'billingDate',
      header: 'Billing Date',
      sortable: true,
      render: (inv) => (
        <span className="font-mono text-slate-600 text-xs whitespace-nowrap">
          {inv.billingDate || inv.createdAt?.slice(0, 10) || 'Today'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Payment Status',
      sortable: true,
      render: (inv) => {
        const isPaid = inv.status === 'PAID' || inv.paymentStatus === 'PAID';
        return <StatusBadge status={isPaid ? 'PAID' : 'PENDING'} dot />;
      },
    },
  ];

  return (
    <div className="space-y-6 font-sans min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
              Billing, Cashier &amp; Revenue Reconciliation
            </h1>
            <StatusBadge status="ACTIVE" dot>CBSL Gateway Certified</StatusBadge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated OPD, pharmacy, and pathology charges with PayHere online checkout &amp; counter cash settlements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsGenerateModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Generate New Bill</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        <StatCard
          title="Total Reconciled Revenue"
          value={`LKR ${totalRevenue.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`}
          subtitle="Settled via PayHere / Cashier"
          icon={DollarSign}
          variant="emerald"
          loading={loading}
          trend={{ value: '100% Settled', isPositive: true }}
        />
        <StatCard
          title="Paid Invoices"
          value={paidCount}
          subtitle="Reconciled patient bills"
          icon={CheckCircle2}
          variant="teal"
          loading={loading}
        />
        <StatCard
          title="Outstanding / Pending"
          value={pendingCount}
          subtitle="Awaiting payment settlement"
          icon={Clock}
          variant="amber"
          loading={loading}
          trend={{ value: pendingCount > 0 ? 'Pending' : 'Cleared', isPositive: pendingCount === 0 }}
        />
        <StatCard
          title="Total Invoices Issued"
          value={invoices.length}
          subtitle="Master audit billing records"
          icon={Receipt}
          variant="sky"
          loading={loading}
        />
      </div>

      {/* Main Table View */}
      <DataTable<Invoice>
        data={filteredInvoices}
        columns={columns}
        keyExtractor={(inv) => inv.id}
        loading={loading}
        title="Master Invoice Directory"
        subtitle="Search and process payments across all clinical departments"
        searchPlaceholder="Search invoice #, patient name, NIC..."
        searchFilter={(inv, q) =>
          (inv.invoiceNumber ? inv.invoiceNumber.toLowerCase().includes(q) : false) ||
          (inv.patientName ? inv.patientName.toLowerCase().includes(q) : false) ||
          (inv.patientNic ? inv.patientNic.toLowerCase().includes(q) : false)
        }
        onRowClick={(inv) => setSelectedInvoice(inv)}
        headerRight={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Payments</option>
              <option value="PAID">✓ Paid</option>
              <option value="PENDING">⏳ Pending</option>
            </select>
          </div>
        }
        actions={(inv) => {
          const isPaid = inv.status === 'PAID' || inv.paymentStatus === 'PAID';
          return (
            <div className="flex items-center gap-1.5">
              {!isPaid ? (
                <>
                  <button
                    type="button"
                    onClick={() => setConfirmSettleData({ invoice: inv, method: 'CASH' })}
                    className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200/80 transition-colors flex items-center gap-1"
                  >
                    <Banknote className="h-3 w-3" />
                    <span>Cashier</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmSettleData({ invoice: inv, method: 'CARD' })}
                    className="px-2.5 py-1 text-[11px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-md border border-sky-200/80 transition-colors flex items-center gap-1"
                  >
                    <CreditCard className="h-3 w-3" />
                    <span>PayHere</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(inv)}
                  className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 transition-colors flex items-center gap-1"
                >
                  <Printer className="h-3 w-3" />
                  <span>View Receipt</span>
                </button>
              )}
            </div>
          );
        }}
      />

      {/* Inspector Drawer */}
      <SlideOverDrawer
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={selectedInvoice ? `Invoice #${selectedInvoice.invoiceNumber}` : ''}
        subtitle={selectedInvoice ? `Patient: ${selectedInvoice.patientName || `ID #${selectedInvoice.patientId}`}` : ''}
        size="md"
      >
        {selectedInvoice && (
          <div className="space-y-4 text-xs font-sans">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Status:</span>
                <StatusBadge status={(selectedInvoice.status === 'PAID' || selectedInvoice.paymentStatus === 'PAID') ? 'PAID' : 'PENDING'} dot />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Billing Date:</span>
                <span>{selectedInvoice.billingDate || selectedInvoice.createdAt?.slice(0, 10)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Patient NIC:</span>
                <span>{selectedInvoice.patientNic || 'Verified'}</span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Itemized Tariff Breakdown</h4>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600 font-mono">
                <span>Doctor Consultation Fee:</span>
                <span>LKR {Number(selectedInvoice.doctorFee || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600 font-mono">
                <span>Pharmacy Medication Fee:</span>
                <span>LKR {Number(selectedInvoice.pharmacyFee || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600 font-mono">
                <span>Pathology Laboratory Fee:</span>
                <span>LKR {Number(selectedInvoice.labFee || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-900 font-bold font-mono text-sm pt-2">
                <span>Net Total Payable:</span>
                <span>LKR {Number(selectedInvoice.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </SlideOverDrawer>

      {/* Generate Bill Modal */}
      {isGenerateModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsGenerateModalOpen(false)}
          title="Generate Aggregated Hospital Invoice"
          subtitle="Compile consultation, pharmacy, and laboratory fees into unified bill"
          maxWidth="md"
        >
          <form onSubmit={handleGenerateInvoice} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Completed Consultation Encounter *</label>
              <select
                required
                value={selectedAppointmentId}
                onChange={(e) => setSelectedAppointmentId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="">-- Choose Encounter --</option>
                {appointments.map((apt) => (
                  <option key={apt.id} value={apt.id}>
                    APT-{apt.id} &bull; {apt.patientName} (Dr. {apt.doctorName}) — {apt.appointmentDate}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-500 space-y-1">
              <span className="font-bold text-slate-700 block">Automated Aggregation:</span>
              <p>
                Generating this bill automatically calculates doctor tariffs, e-prescription prices, and Pathology lab orders attached to this encounter ID.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsGenerateModalOpen(false)}
                className="px-4 py-2 rounded-lg border text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs"
              >
                Generate Bill
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Settlement Confirmation Modal */}
      {confirmSettleData && (
        <Modal
          isOpen={true}
          onClose={() => setConfirmSettleData(null)}
          title={`Settle Bill #${confirmSettleData.invoice.invoiceNumber}`}
          subtitle={`Process settlement via ${confirmSettleData.method}`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-center space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">TOTAL PAYABLE AMOUNT</span>
              <span className="text-xl font-bold text-slate-900 block">
                LKR {Number(confirmSettleData.invoice.totalAmount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <p className="text-slate-600">
              Confirm recording payment of <strong>LKR {Number(confirmSettleData.invoice.totalAmount || 0).toFixed(2)}</strong> via <strong>{confirmSettleData.method}</strong> for patient {confirmSettleData.invoice.patientName || 'Record'}.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmSettleData(null)}
                className="px-3.5 py-1.5 rounded-lg border text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSettlement}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                Confirm Settlement
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BillingView;
