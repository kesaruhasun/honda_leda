import React, { useState, useEffect } from 'react';
import {
  Receipt,
  CreditCard,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Plus,
  Search,
  DollarSign,
  Clock,
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { billingApi, appointmentApi } from '../services/api';
import { Invoice, Appointment } from '../types';

export const BillingView: React.FC = () => {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // PayHere Modal State
  const [payHereModalInvoice, setPayHereModalInvoice] = useState<Invoice | null>(null);
  const [payHereProcessing, setPayHereProcessing] = useState(false);

  // Generate Invoice Modal State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');

  // Receipt Modal
  const [receiptInvoice, setReceiptInvoice] = useState<Invoice | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, aptRes] = await Promise.all([
        billingApi.getInvoices(),
        appointmentApi.getAll(),
      ]);
      setInvoices(invRes.data);
      setAppointments(aptRes.data);
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
      showToast('error', 'Required Field', 'Please select a completed appointment encounter.');
      return;
    }

    try {
      const res = await billingApi.generateInvoice(Number(selectedAppointmentId));
      setInvoices((prev) => [res.data, ...prev]);
      setIsGenerateModalOpen(false);
      setSelectedAppointmentId('');
      showToast('success', 'Invoice Generated', `Aggregated bill created: ${res.data.invoiceNumber}`);
    } catch (err: any) {
      showToast('error', 'Generation Error', err.message || 'Invoice could not be created');
    }
  };

  const handleSettleCounter = async (invoiceId: number, method: 'CASH' | 'CARD') => {
    try {
      const res = await billingApi.settleCashCard(invoiceId, method);
      setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? res.data : inv)));
      showToast('success', 'Bill Settled', `Invoice paid via ${method} at hospital cashier.`);
    } catch (err: any) {
      showToast('error', 'Settlement Failed', err.message || 'Could not process payment');
    }
  };

  const handleAuthorizePayHere = async (invoice: Invoice) => {
    try {
      setPayHereProcessing(true);
      const res = await billingApi.settleCashCard(
        invoice.id,
        'CARD',
        `PAYHERE-SANDBOX-${Date.now()}`
      );
      setInvoices((prev) => prev.map((inv) => (inv.id === invoice.id ? res.data : inv)));
      setPayHereModalInvoice(null);
      showToast('success', 'PayHere Success', `Sandbox transaction authorized for LKR ${invoice.totalAmount}`);
    } catch (err: any) {
      showToast('error', 'PayHere Error', err.message || 'Gateway transaction declined');
    } finally {
      setPayHereProcessing(false);
    }
  };

  const totalRevenue = invoices
    .filter((i) => i.status === 'PAID')
    .reduce((sum, i) => sum + (i.totalAmount || 0), 0);

  const pendingRevenue = invoices
    .filter((i) => i.status === 'PENDING')
    .reduce((sum, i) => sum + (i.totalAmount || 0), 0);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    const patName = inv.patientName || '';
    const matchesSearch =
      patName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.patientNic && inv.patientNic.includes(searchTerm)) ||
      (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-clinical-ink tracking-tight">Hospital Billing & Cashier Desk</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200">
              PayHere Sandbox Gateway Active
            </span>
          </div>
          <p className="text-xs text-clinical-ink-muted mt-1">
            Encounter fee aggregation (Doctor + Pharmacy + Lab), PayHere gateway checkout, and cashier settlement.
          </p>
        </div>
        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="apple-btn inline-flex items-center gap-2 px-4 py-2 rounded-apple-xl bg-clinical-teal-600 text-white text-xs font-semibold hover:bg-clinical-teal-700 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Generate Encounter Bill</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Settled Revenue"
          value={`LKR ${totalRevenue.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`}
          subtitle="Cleared payments"
          icon={DollarSign}
          variant="emerald"
        />
        <MetricCard
          title="Outstanding Balance"
          value={`LKR ${pendingRevenue.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`}
          subtitle="Pending invoices"
          icon={Clock}
          variant="amber"
        />
        <MetricCard
          title="Total Invoices"
          value={invoices.length}
          subtitle="All encounters billed"
          icon={Receipt}
          variant="teal"
        />
        <MetricCard
          title="Payment Gateway"
          value="PayHere + Cash"
          subtitle="Dual settlement channels"
          icon={CreditCard}
          variant="slate"
        />
      </div>

      {/* Filters and Search Bar */}
      <div className="apple-card p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice number, patient, or NIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-clinical-ink focus:outline-none focus:ring-2 focus:ring-clinical-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-clinical-ink-secondary">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-clinical-ink"
          >
            <option value="ALL">All Invoices</option>
            <option value="PENDING">Pending Payment</option>
            <option value="PAID">Paid / Cleared</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-8 w-8 border-2 border-clinical-teal-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        /* Invoices Table */
        <div className="apple-card overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-clinical-ink-secondary font-semibold border-b border-slate-200">
                  <th className="py-3 px-4 font-mono">Invoice #</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4 font-mono">NIC</th>
                  <th className="py-3 px-4 font-mono">Doctor Fee</th>
                  <th className="py-3 px-4 font-mono">Pharmacy</th>
                  <th className="py-3 px-4 font-mono">Lab Total</th>
                  <th className="py-3 px-4 font-mono">Total (LKR)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Settlement Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-clinical-teal-700">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-clinical-ink">
                      {inv.patientName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {inv.patientNic}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      LKR {Number(inv.consultationFee || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      LKR {Number(inv.pharmacyTotal || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      LKR {Number(inv.labTotal || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      LKR {Number(inv.totalAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={inv.status === 'PAID' ? 'success' : 'emergency'}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => setReceiptInvoice(inv)}
                          className="apple-btn p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                          title="View / Print Tax Receipt"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>

                        {inv.status !== 'PAID' ? (
                          <>
                            <button
                              onClick={() => setPayHereModalInvoice(inv)}
                              className="apple-btn inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] border border-emerald-200"
                            >
                              <CreditCard className="h-3 w-3" />
                              <span>PayHere</span>
                            </button>
                            <button
                              onClick={() => handleSettleCounter(inv.id, 'CASH')}
                              className="apple-btn px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-900 text-white font-semibold text-[11px]"
                            >
                              Cash Settled
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Paid</span>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate Bill Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate Aggregated Encounter Bill"
        subtitle="Consolidate Physician Consultation + Dispensed Medications + Diagnostic Lab Tests"
        maxWidth="md"
      >
        <form onSubmit={handleGenerateInvoice} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Patient Consultation Encounter *
            </label>
            <select
              required
              value={selectedAppointmentId}
              onChange={(e) => setSelectedAppointmentId(e.target.value)}
              className="w-full font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-clinical-ink focus:ring-2 focus:ring-clinical-teal-500"
            >
              <option value="">Choose Clinical Encounter</option>
              {appointments.map((apt) => (
                <option key={apt.id} value={apt.id}>
                  {apt.patientName} &bull; {apt.appointmentNumber} ({apt.doctorName} - {apt.appointmentDate})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3.5 rounded-apple-xl bg-slate-50 border border-slate-200 text-slate-600 space-y-1 text-[11px]">
            <p className="font-semibold text-slate-800">Automated Encounter Calculation:</p>
            <p>1. Attending Doctor's consultation tariff is automatically retrieved.</p>
            <p>2. Dispensed prescriptions associated with this encounter are totaled.</p>
            <p>3. Completed diagnostic pathology test items are appended.</p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsGenerateModalOpen(false)}
              className="apple-btn px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="apple-btn px-4 py-2 text-xs font-semibold bg-clinical-teal-600 text-white rounded-lg hover:bg-clinical-teal-700 shadow-sm"
            >
              Generate Bill
            </button>
          </div>
        </form>
      </Modal>

      {/* PayHere Checkout Modal */}
      {payHereModalInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setPayHereModalInvoice(null)}
          title="PayHere Sandbox Payment Gateway"
          subtitle={`Merchant Check: ${payHereModalInvoice.invoiceNumber}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono text-[10px]">PAYHERE SANDBOX (LK)</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                  TEST ENVIRONMENT
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Payable Total</span>
                <span className="text-2xl font-bold font-mono text-white">
                  LKR {Number(payHereModalInvoice.totalAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                Patient: <span className="text-white font-semibold">{payHereModalInvoice.patientName}</span> &bull; NIC: {payHereModalInvoice.patientNic}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Central Bank of Sri Lanka Certified Gateway</span>
              </div>
              <p>Simulating card transaction with PayHere merchant signature and tokenized callback.</p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPayHereModalInvoice(null)}
                className="apple-btn px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={payHereProcessing}
                onClick={() => handleAuthorizePayHere(payHereModalInvoice)}
                className="apple-btn px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <CreditCard className="h-4 w-4" />
                <span>{payHereProcessing ? 'Authorizing Card...' : 'Authorize LKR Payment'}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Tax Receipt Modal */}
      {receiptInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setReceiptInvoice(null)}
          title="Hospital Tax Receipt"
          subtitle={`Official Tax Invoice ${receiptInvoice.invoiceNumber}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-5 rounded-xl border border-slate-200 bg-white font-mono space-y-3 receipt-container">
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <h3 className="font-bold text-base text-slate-900">PulseOS Tertiary Hospital</h3>
                <p className="text-[10px] text-slate-500">Ministry of Health Certified OPD Cashier</p>
                <p className="text-[10px] text-slate-500">Invoice: {receiptInvoice.invoiceNumber}</p>
                <p className="text-[10px] text-slate-500">
                  Date: {receiptInvoice.createdAt ? new Date(receiptInvoice.createdAt).toLocaleString() : '2026-09-14'}
                </p>
              </div>

              <div className="space-y-1 py-1 border-b border-dashed border-slate-300 text-[11px]">
                <div className="flex justify-between">
                  <span>Patient Name:</span>
                  <span className="font-bold">{receiptInvoice.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Patient NIC:</span>
                  <span>{receiptInvoice.patientNic}</span>
                </div>
              </div>

              <div className="space-y-1 py-1 border-b border-dashed border-slate-300 text-[11px]">
                <div className="flex justify-between">
                  <span>Consultation Fee:</span>
                  <span>LKR {Number(receiptInvoice.consultationFee || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pharmacy Total:</span>
                  <span>LKR {Number(receiptInvoice.pharmacyTotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Laboratory Total:</span>
                  <span>LKR {Number(receiptInvoice.labTotal || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-sm font-bold pt-1">
                <span>TOTAL ENCOUNTER:</span>
                <span>LKR {Number(receiptInvoice.totalAmount).toFixed(2)}</span>
              </div>

              <div className="text-center pt-2 text-[10px] text-slate-400">
                STATUS: {receiptInvoice.status} &bull; PAYMENT: {receiptInvoice.paymentMethod || 'PAYHERE/CASH'}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="apple-btn px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg flex items-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Copy</span>
              </button>
              <button
                onClick={() => setReceiptInvoice(null)}
                className="apple-btn px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default BillingView;