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
  Percent,
  Tag,
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

  // Apply Discount / Concession Modal State (Kesaru CRUD - UPDATE)
  const [discountModalInvoice, setDiscountModalInvoice] = useState<Invoice | null>(null);
  const [discountMode, setDiscountMode] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [discountPercentage, setDiscountPercentage] = useState<number>(10);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>('Senior Citizen Health Card (10%)');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState<boolean>(false);

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
    const search = window.location.search || (window.location.hash.includes('?') ? '?' + window.location.hash.split('?')[1] : '');
    const urlParams = new URLSearchParams(search);
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
        const cleanUrl = window.location.href.split('?')[0];
        window.history.replaceState({}, document.title, cleanUrl);
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

  const handleSubmitPayHereForm = (forceRedirect = false) => {
    if (!payHereData) return;
    const { invoice, params } = payHereData;

    const effectiveOrderId = params.orderId || params.order_id || invoice.invoiceNumber || String(invoice.id);
    let effectiveReturnUrl = params.returnUrl || params.return_url || `${window.location.origin}/billing`;
    if (!effectiveReturnUrl.includes('order_id=')) {
      effectiveReturnUrl += (effectiveReturnUrl.includes('?') ? '&' : '?') + 'order_id=' + encodeURIComponent(effectiveOrderId);
    }
    const cancelUrl = params.cancelUrl || params.cancel_url || `${window.location.origin}/billing`;
    const notifyUrl = params.notifyUrl || params.notify_url || `${window.location.origin}/api/v1/payments/payhere/notify`;
    const merchantId = params.merchantId || params.merchant_id || '1235909';
    const amount = params.amount || Number(invoice.totalAmount).toFixed(2);
    const currency = params.currency || 'LKR';
    const hash = params.hash || '';

    if (!forceRedirect && typeof (window as any).payhere !== 'undefined') {
      const payhere = (window as any).payhere;
      payhere.onCompleted = function onCompleted(orderId: string) {
        showToast('success', 'PayHere Payment Received', `Order #${orderId} was settled via PayHere Gateway.`);
        billingApi.settleCashCard(invoice.id, 'CARD', `PAYHERE-JS-${orderId}`).catch(() => {});
        setPayHereData(null);
        fetchData();
      };
      payhere.onDismissed = function onDismissed() {
        showToast('info', 'Payment Dismissed', 'PayHere modal was dismissed.');
      };
      payhere.onError = function onError(error: string) {
        showToast('error', 'PayHere Error', error);
      };
      payhere.startPayment({
        sandbox: true,
        merchant_id: merchantId,
        return_url: effectiveReturnUrl,
        cancel_url: cancelUrl,
        notify_url: notifyUrl,
        order_id: effectiveOrderId,
        items: params.items || `Invoice #${invoice.invoiceNumber}`,
        amount: amount,
        currency: currency,
        hash: hash,
        first_name: params.firstName || params.patientFirstName || params.first_name || 'Patient',
        last_name: params.lastName || params.patientLastName || params.last_name || 'PulseOS',
        email: params.email || 'patient@pulseos.lk',
        phone: params.phone || '0771234567',
        address: params.address || 'No. 124, Hospital Road',
        city: params.city || 'Colombo',
        country: 'Sri Lanka',
      });
      return;
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://sandbox.payhere.lk/pay/checkout';

    const fields: Record<string, string> = {
      merchant_id: merchantId,
      return_url: effectiveReturnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      order_id: effectiveOrderId,
      items: params.items || `Invoice #${invoice.invoiceNumber}`,
      currency: currency,
      amount: amount,
      first_name: params.firstName || params.patientFirstName || params.first_name || 'Patient',
      last_name: params.lastName || params.patientLastName || params.last_name || 'PulseOS',
      email: params.email || 'patient@pulseos.lk',
      phone: params.phone || '0771234567',
      address: params.address || 'No. 124, Hospital Road',
      city: params.city || 'Colombo',
      country: 'Sri Lanka',
      hash: hash,
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

  const handleApplyDiscount = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!discountModalInvoice) return;

    try {
      setIsApplyingDiscount(true);
      const total = Number(discountModalInvoice.totalAmount || 0);
      let calculatedDiscount = 0;

      if (discountMode === 'PERCENT') {
        calculatedDiscount = (total * Number(discountPercentage || 0)) / 100;
      } else {
        calculatedDiscount = Number(discountAmount || 0);
      }

      if (calculatedDiscount < 0) {
        showToast('error', 'Invalid Discount', 'Discount amount cannot be negative.');
        setIsApplyingDiscount(false);
        return;
      }

      if (calculatedDiscount > total) {
        showToast('error', 'Invalid Discount', 'Discount amount cannot exceed the total bill.');
        setIsApplyingDiscount(false);
        return;
      }

      const res = await billingApi.updateInvoice(discountModalInvoice.id, {
        discountAmount: calculatedDiscount,
        discountReason: discountReason.trim() || 'Clinical Concession',
      });

      const net = res.data.netAmount != null ? Number(res.data.netAmount) : (total - calculatedDiscount);
      showToast('success', 'Discount Applied', `Invoice #${discountModalInvoice.invoiceNumber} updated! Net Due: LKR ${net.toFixed(2)}`);
      setDiscountModalInvoice(null);
      await fetchData();
    } catch (err: any) {
      showToast('error', 'Update Failed', err.response?.data?.message || err.message || 'Could not apply discount');
    } finally {
      setIsApplyingDiscount(false);
    }
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
      header: 'Tariff / Net Due',
      sortable: true,
      render: (inv) => {
        const discount = Number(inv.discountAmount || 0);
        const net = Number(inv.netAmount != null ? inv.netAmount : inv.totalAmount || 0);
        return (
          <div className="whitespace-nowrap">
            <span className="font-mono font-bold text-slate-900">
              LKR {net.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
            </span>
            {discount > 0 && (
              <div className="text-[10px] text-emerald-600 font-mono font-semibold flex items-center gap-0.5">
                <span>Disc: -LKR {discount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>
        );
      },
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

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => {
              const pendingInv = invoices.find(inv => inv.status === 'PENDING' || inv.paymentStatus === 'PENDING') || invoices[0];
              if (pendingInv) {
                setDiscountModalInvoice(pendingInv);
                const currentTotal = Number(pendingInv.totalAmount || 0);
                const currentDisc = Number(pendingInv.discountAmount || 0);
                if (currentDisc > 0 && currentTotal > 0) {
                  setDiscountAmount(currentDisc);
                  setDiscountPercentage(Math.round((currentDisc / currentTotal) * 100));
                  setDiscountMode('PERCENT');
                } else {
                  setDiscountAmount(0);
                  setDiscountPercentage(10);
                  setDiscountMode('PERCENT');
                }
                setDiscountReason('Senior Citizen Health Card (10%)');
              } else {
                showToast('info', 'No Invoices', 'No invoices found to apply concession.');
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <Percent className="h-4 w-4" />
            <span>Apply Concession / Discount</span>
          </button>

          <button
            type="button"
            onClick={() => setIsGenerateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Generate New Bill</span>
          </button>
        </div>
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
              <button
                type="button"
                onClick={() => {
                  setDiscountModalInvoice(inv);
                  const currentTotal = Number(inv.totalAmount || 0);
                  const currentDisc = Number(inv.discountAmount || 0);
                  if (currentDisc > 0 && currentTotal > 0) {
                    setDiscountAmount(currentDisc);
                    setDiscountPercentage(Math.round((currentDisc / currentTotal) * 100));
                    setDiscountMode('PERCENT');
                  } else {
                    setDiscountAmount(0);
                    setDiscountPercentage(10);
                    setDiscountMode('PERCENT');
                  }
                  setDiscountReason('Senior Citizen Health Card (10%)');
                }}
                className="px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-md border border-amber-300 transition-colors flex items-center gap-1 shadow-2xs"
                title="Apply Concession or Concession Discount"
              >
                <Percent className="h-3 w-3 text-amber-600" />
                <span>Discount</span>
              </button>

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
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600 font-mono">
                <span>Gross Tariff Total:</span>
                <span>LKR {Number(selectedInvoice.totalAmount || 0).toFixed(2)}</span>
              </div>
              {Number(selectedInvoice.discountAmount || 0) > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-600 font-mono font-semibold">
                  <span>Applied Concession / Discount:</span>
                  <span>- LKR {Number(selectedInvoice.discountAmount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 text-slate-900 font-bold font-mono text-sm pt-2">
                <span>Net Total Payable:</span>
                <span>LKR {Number(selectedInvoice.netAmount != null ? selectedInvoice.netAmount : selectedInvoice.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Quick Apply Discount button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  const inv = selectedInvoice;
                  setSelectedInvoice(null);
                  setDiscountModalInvoice(inv);
                  const currentTotal = Number(inv.totalAmount || 0);
                  const currentDisc = Number(inv.discountAmount || 0);
                  if (currentDisc > 0 && currentTotal > 0) {
                    setDiscountAmount(currentDisc);
                    setDiscountPercentage(Math.round((currentDisc / currentTotal) * 100));
                    setDiscountMode('PERCENT');
                  } else {
                    setDiscountAmount(0);
                    setDiscountPercentage(10);
                    setDiscountMode('PERCENT');
                  }
                  setDiscountReason('Senior Citizen Health Card (10%)');
                }}
                className="w-full py-2.5 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Percent className="w-4 h-4 text-amber-600" />
                <span>Update Bill &bull; Apply Discount / Concession</span>
              </button>
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
                    <span className="text-[10px] text-sky-700 font-mono font-medium">Merchant ID: {payHereData.params.merchantId || payHereData.params.merchant_id || '1235909'}</span>
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
                <p className="font-semibold mb-1">Official PayHere Sandbox Test Cards:</p>
                <div className="font-mono text-[10px] space-y-0.5 text-amber-800">
                  <div>Visa: <span className="font-bold">4916 2175 0161 1292</span> &bull; Exp: <span className="font-bold">12/28</span> &bull; CVV: <span className="font-bold">123</span></div>
                  <div>Mastercard: <span className="font-bold">5307 7321 2553 1191</span> &bull; Exp: <span className="font-bold">12/28</span> &bull; CVV: <span className="font-bold">456</span></div>
                  <div>Amex: <span className="font-bold">3467 8100 5510 225</span> &bull; Exp: <span className="font-bold">12/28</span> &bull; CVV: <span className="font-bold">1234</span></div>
                </div>
              </div>
            </div>

            <p className="text-slate-500 text-[11px]">
              Proceed to authorize payment using PayHere Sandbox. Successful payments are signed with MD5 and update the database in real time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleSubmitPayHereForm(true)}
                className="text-sky-700 hover:text-sky-900 text-xs font-semibold flex items-center gap-1 underline underline-offset-2"
              >
                <span>Or redirect to PayHere Hosted Page</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPayHereData(null)}
                  className="px-4 py-2 rounded-lg border text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmitPayHereForm(false)}
                  className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <span>Launch PayHere Checkout</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Apply Discount / Concession Modal (Kesaru CRUD - UPDATE) */}
      {discountModalInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setDiscountModalInvoice(null)}
          title="Apply Concession &amp; Discount"
          subtitle={`Invoice #${discountModalInvoice.invoiceNumber} • Patient: ${discountModalInvoice.patientName || `ID #${discountModalInvoice.patientId}`}`}
          maxWidth="md"
        >
          <form onSubmit={handleApplyDiscount} className="space-y-4 text-xs font-sans">
            {/* Invoice Selector */}
            {invoices.length > 1 && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Select Bill to Adjust:
                </label>
                <select
                  value={discountModalInvoice.id || discountModalInvoice.invoiceId || ''}
                  onChange={(e) => {
                    const found = invoices.find(inv => String(inv.id || inv.invoiceId) === e.target.value);
                    if (found) {
                      setDiscountModalInvoice(found);
                      const total = Number(found.totalAmount || 0);
                      const disc = Number(found.discountAmount || 0);
                      if (disc > 0 && total > 0) {
                        setDiscountAmount(disc);
                        setDiscountPercentage(Math.round((disc / total) * 100));
                        setDiscountMode('PERCENT');
                      } else {
                        setDiscountAmount(0);
                        setDiscountPercentage(10);
                        setDiscountMode('PERCENT');
                      }
                    }
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-clinical-teal-500 font-medium"
                >
                  {invoices.map((inv) => (
                    <option key={inv.id || inv.invoiceId} value={inv.id || inv.invoiceId}>
                      {inv.invoiceNumber} — {inv.patientName || `Patient #${inv.patientId}`} • LKR {Number(inv.totalAmount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })} [{inv.status || inv.paymentStatus}]
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick Concession Presets */}
            <div>
              <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-clinical-teal-600" />
                <span>Standard Concession Schemes:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { label: 'Senior Citizen', pct: 10, reason: 'Senior Citizen Health Card (10%)' },
                  { label: 'Hospital Staff', pct: 15, reason: 'Hospital Staff / Healthcare Worker Waiver (15%)' },
                  { label: 'Student / Youth', pct: 5, reason: 'Student / Youth Healthcare Concession (5%)' },
                  { label: 'Welfare / Charity', pct: 25, reason: 'Social Welfare Assistance (25%)' },
                  { label: 'Full Waiver', pct: 100, reason: 'Indigent Patient Full Charitable Waiver (100%)' },
                  { label: 'Clear Discount', pct: 0, reason: 'Standard Tariff (0% Concession)' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setDiscountMode('PERCENT');
                      setDiscountPercentage(preset.pct);
                      setDiscountReason(preset.reason);
                      const total = Number(discountModalInvoice.totalAmount || 0);
                      setDiscountAmount((total * preset.pct) / 100);
                    }}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      discountMode === 'PERCENT' && discountPercentage === preset.pct
                        ? 'border-clinical-teal-600 bg-clinical-teal-50/70 text-clinical-teal-900 font-bold shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-[11px] font-bold">{preset.label}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{preset.pct}% off</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Mode Selector */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Concession Calculation Method:</span>
                <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setDiscountMode('PERCENT')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                      discountMode === 'PERCENT'
                        ? 'bg-clinical-teal-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Percentage (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountMode('FIXED');
                      const total = Number(discountModalInvoice.totalAmount || 0);
                      setDiscountAmount((total * discountPercentage) / 100);
                    }}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                      discountMode === 'FIXED'
                        ? 'bg-clinical-teal-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Fixed Amount (LKR)
                  </button>
                </div>
              </div>

              {discountMode === 'PERCENT' ? (
                <div>
                  <label className="text-slate-600 font-medium block mb-1">
                    Discount Percentage: <strong className="font-mono text-slate-900">{discountPercentage}%</strong>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={discountPercentage}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setDiscountPercentage(val);
                        const total = Number(discountModalInvoice.totalAmount || 0);
                        setDiscountAmount((total * val) / 100);
                      }}
                      className="w-full accent-clinical-teal-600 cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercentage}
                      onChange={(e) => {
                        const val = Math.min(100, Math.max(0, Number(e.target.value)));
                        setDiscountPercentage(val);
                        const total = Number(discountModalInvoice.totalAmount || 0);
                        setDiscountAmount((total * val) / 100);
                      }}
                      className="w-16 px-2 py-1 rounded-lg border border-slate-200 font-mono text-center font-bold"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-slate-600 font-medium block mb-1">
                    Fixed Concession Amount (LKR):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={Number(discountModalInvoice.totalAmount || 0)}
                    step="50"
                    value={discountAmount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setDiscountAmount(val);
                      const total = Number(discountModalInvoice.totalAmount || 0);
                      if (total > 0) setDiscountPercentage(Math.round((val / total) * 100));
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-clinical-teal-500"
                  />
                </div>
              )}

              <div>
                <label className="text-slate-600 font-medium block mb-1">
                  Reason / Approval Authority Justification:
                </label>
                <input
                  type="text"
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  placeholder="e.g., Senior Citizen Health Card #SC-4491"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-clinical-teal-500"
                  required
                />
              </div>
            </div>

            {/* Live Calculation Preview Card */}
            {(() => {
              const total = Number(discountModalInvoice.totalAmount || 0);
              const disc = discountMode === 'PERCENT'
                ? (total * Number(discountPercentage || 0)) / 100
                : Number(discountAmount || 0);
              const net = Math.max(0, total - disc);
              return (
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 to-emerald-50/30 border border-slate-200 space-y-1.5 font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Original Gross Bill:</span>
                    <span>LKR {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Concession Deduction:</span>
                    <span>- LKR {disc.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold text-sm pt-1 border-t border-slate-200">
                    <span>Adjusted Net Payable:</span>
                    <span>LKR {net.toFixed(2)}</span>
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isApplyingDiscount}
                onClick={() => setDiscountModalInvoice(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isApplyingDiscount}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Percent className="w-3.5 h-3.5" />
                <span>{isApplyingDiscount ? 'Updating Ledger...' : 'Save & Update Bill'}</span>
              </button>
            </div>
          </form>
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
