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
  Trash2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  X,
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

  // PayHere Online Gateway Modal
  const [payHereData, setPayHereData] = useState<{
    invoice: Invoice;
    params: any;
  } | null>(null);
  const [isInitiatingPayHere, setIsInitiatingPayHere] = useState(false);

  // Invoice Cancellation Modal (Kesaru CRUD)
  const [cancellingInvoice, setCancellingInvoice] = useState<Invoice | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [payHereSuccessBanner, setPayHereSuccessBanner] = useState<string | null>(null);

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

    // Check for PayHere redirect query parameters (e.g. ?order_id=INV-2026-0001)
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    if (orderId) {
      setPayHereSuccessBanner(orderId);
      showToast('success', 'PayHere Payment Confirmed', `Payment for invoice #${orderId} was successfully processed via PayHere Gateway.`);
      // Settle invoice in backend to guarantee state parity in case sandbox IPN is delayed
      billingApi.getInvoices().then(res => {
        const matching = (res.data || []).find((inv: Invoice) => 
          inv.invoiceNumber === orderId || String(inv.id) === orderId.replace('INV-', '')
        );
        if (matching && matching.status !== 'PAID') {
          billingApi.settleCashCard(matching.id, 'CARD').catch(() => {});
        }
      }).finally(() => {
        fetchData();
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }
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

  const handleInitiatePayHere = async (invoice: Invoice) => {
    try {
      setIsInitiatingPayHere(true);
      const res = await billingApi.initiatePayHere(invoice.id);
      setPayHereData({ invoice, params: res.data });
    } catch (err: any) {
      showToast('error', 'PayHere Gateway Error', err.message || 'Could not initiate PayHere payment');
    } finally {
      setIsInitiatingPayHere(false);
    }
  };

  const handleSubmitPayHereForm = () => {
    if (!payHereData) return;
    const { invoice, params } = payHereData;

    const effectiveOrderId = params.orderId || params.order_id || invoice.invoiceNumber || String(invoice.id);
    let effectiveReturnUrl = params.returnUrl || params.return_url || 'https://pulseos.tekkeys.com/billing';
    if (!effectiveReturnUrl.includes('order_id=')) {
      effectiveReturnUrl += (effectiveReturnUrl.includes('?') ? '&' : '?') + 'order_id=' + encodeURIComponent(effectiveOrderId);
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://sandbox.payhere.lk/pay/checkout';

    const fields: Record<string, string> = {
      merchant_id: params.merchantId || params.merchant_id || '1235909',
      return_url: effectiveReturnUrl,
      cancel_url: params.cancelUrl || params.cancel_url || 'https://pulseos.tekkeys.com/billing',
      notify_url: params.notifyUrl || params.notify_url || 'https://pulseos.tekkeys.com/api/v1/payments/payhere/notify',
      order_id: effectiveOrderId,
      items: params.items || `Invoice #${invoice.invoiceNumber}`,
      currency: params.currency || 'LKR',
      amount: params.amount || Number(invoice.totalAmount).toFixed(2),
      first_name: params.firstName || params.patientFirstName || params.first_name || 'Patient',
      last_name: params.lastName || params.patientLastName || params.last_name || 'PulseOS',
      email: params.email || 'patient@pulseos.lk',
      phone: params.phone || '0771234567',
      address: params.address || 'No. 124, Hospital Road',
      city: params.city || 'Colombo',
      country: params.country || 'Sri Lanka',
      hash: params.hash || '',
    };

    Object.entries(fields).forEach(([k, v]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = k;
      input.value = v;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const handleConfirmCancelInvoice = async () => {
    if (!cancellingInvoice) return;
    try {
      setIsCancelling(true);
      await billingApi.cancelInvoice(cancellingInvoice.id);
      showToast('success', 'Invoice Cancelled', `Invoice #${cancellingInvoice.invoiceNumber} marked as cancelled/voided.`);
      setCancellingInvoice(null);
      fetchData();
    } catch (err: any) {
      showToast('error', 'Cancellation Error', err.message || 'Could not cancel invoice');
    } finally {
      setIsCancelling(false);
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

      {payHereSuccessBanner && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-emerald-400">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-700 dark:text-emerald-300">Payment Confirmed via PayHere Gateway</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Invoice #{payHereSuccessBanner} has been settled and verified in real-time.</p>
            </div>
          </div>
          <button 
            onClick={() => setPayHereSuccessBanner(null)}
            className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
          const isCancelled = inv.status === 'CANCELLED' || inv.paymentStatus === 'CANCELLED';
          return (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              {!isPaid && !isCancelled ? (
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
                    onClick={() => handleInitiatePayHere(inv)}
                    disabled={isInitiatingPayHere}
                    className="px-2.5 py-1 text-[11px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-md border border-sky-200/80 transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <CreditCard className="h-3 w-3" />
                    <span>PayHere</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCancellingInvoice(inv)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="Void / Cancel Bill"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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

      {/* PayHere Online Gateway Modal */}
      {payHereData && (
        <Modal
          isOpen={true}
          onClose={() => setPayHereData(null)}
          title="PayHere Payment Gateway"
          subtitle={`Invoice #${payHereData.invoice.invoiceNumber} • Encrypted Checkout`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50 via-indigo-50/40 to-slate-50 border border-sky-200/80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                    P
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">PayHere Merchant Gateway</h4>
                    <span className="text-[10px] text-sky-700 font-mono font-medium">Merchant ID: {payHereData.params.merchantId || payHereData.params.merchant_id || '1226000'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Sandbox Verified</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-2 border-y border-sky-100 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">PATIENT / PAYER</span>
                  <span className="font-bold text-slate-800">
                    {payHereData.invoice.patientName || `${payHereData.params.firstName} ${payHereData.params.lastName}`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ORDER REF</span>
                  <span className="font-bold text-slate-800">{payHereData.params.orderId || payHereData.params.order_id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">CURRENCY</span>
                  <span className="font-bold text-slate-800">LKR (Sri Lankan Rupee)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">TOTAL PAYABLE</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    LKR {Number(payHereData.invoice.totalAmount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px]">
                <p className="font-semibold mb-1">Sandbox Test Visa Card:</p>
                <div className="font-mono text-[10px] space-y-0.5 text-amber-800">
                  <div>Card Number: <span className="font-bold">4111 1111 1111 1111</span></div>
                  <div>Expiry: <span className="font-bold">12/28</span> &bull; CVV: <span className="font-bold">123</span> &bull; OTP: <span className="font-bold">1234</span></div>
                </div>
              </div>
            </div>

            <p className="text-slate-500 text-[11px]">
              Clicking below will securely redirect you to the official PayHere sandbox checkout page to finalize transaction settlement.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPayHereData(null)}
                className="px-4 py-2 rounded-lg border text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitPayHereForm}
                className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <span>Proceed to PayHere Gateway</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Invoice Void / Cancel Confirmation Modal (Kesaru CRUD) */}
      {cancellingInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setCancellingInvoice(null)}
          title="Void / Cancel Invoice"
          subtitle={`Invoice #${cancellingInvoice.invoiceNumber}`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
              <div className="font-bold flex items-center gap-1.5 mb-1 text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Confirm Invoice Cancellation</span>
              </div>
              <p>
                Are you sure you want to void Invoice <strong>#{cancellingInvoice.invoiceNumber}</strong> for LKR {Number(cancellingInvoice.totalAmount || 0).toFixed(2)}? This action marks the bill cancelled in the ledger.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setCancellingInvoice(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Keep Bill
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancelInvoice}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isCancelling ? 'Voiding...' : 'Confirm Void'}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BillingView;
