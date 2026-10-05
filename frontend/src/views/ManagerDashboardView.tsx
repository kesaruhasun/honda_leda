import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  DollarSign,
  Stethoscope,
  BedDouble,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataTable, Column } from '../components/common/DataTable';
import { useToast } from '../context/ToastContext';
import { doctorApi, patientApi, billingApi, notificationsApi } from '../services/api';
import { AppointmentCalendar } from '../components/appointments/AppointmentCalendar';

interface WardUnit {
  id: string;
  name: string;
  category: string;
  totalBeds: number;
  occupiedBeds: number;
  cleaningBeds: number;
  criticalBeds: number;
}

const HOSPITAL_WARDS: WardUnit[] = [
  { id: 'WARD-ICU', name: 'Intensive Care Unit (ICU)', category: 'Critical Care', totalBeds: 12, occupiedBeds: 10, cleaningBeds: 1, criticalBeds: 4 },
  { id: 'WARD-SURG', name: 'Acute Surgical Pavilion', category: 'Inpatient Surgery', totalBeds: 24, occupiedBeds: 19, cleaningBeds: 2, criticalBeds: 2 },
  { id: 'WARD-CARD', name: 'Cardiology & Telemetry Unit', category: 'Specialized Inpatient', totalBeds: 18, occupiedBeds: 14, cleaningBeds: 1, criticalBeds: 3 },
  { id: 'WARD-PED', name: 'Pediatrics & Neonatal Care', category: 'Maternal & Child', totalBeds: 16, occupiedBeds: 11, cleaningBeds: 2, criticalBeds: 0 },
  { id: 'WARD-EMRG', name: 'Trauma Resuscitation Bays', category: 'Acute Emergency', totalBeds: 8, occupiedBeds: 5, cleaningBeds: 1, criticalBeds: 2 },
];

export const ManagerDashboardView: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeDoctors: 0,
    totalPatients: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    paidInvoicesCount: 0,
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedWard, setSelectedWard] = useState<WardUnit>(HOSPITAL_WARDS[0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [docsRes, patsRes, invRes, notifRes] = await Promise.all([
          doctorApi.getAll().catch(() => ({ data: [] })),
          patientApi.getAll().catch(() => ({ data: [] })),
          billingApi.getInvoices().catch(() => ({ data: [] })),
          notificationsApi.getAll().catch(() => ({ data: [] })),
        ]);

        const docs = docsRes.data || [];
        const pats = patsRes.data || [];
        const invoices = invRes.data || [];
        const notifs = notifRes.data || [];

        const totalRev = invoices
          .filter((i: any) => i.status === 'PAID' || i.paymentStatus === 'PAID')
          .reduce((sum: number, i: any) => sum + (Number(i.totalAmount) || 0), 0);

        setStats({
          activeDoctors: docs.filter((d: any) => d.isAvailable !== false).length,
          totalPatients: pats.length,
          totalInvoices: invoices.length,
          totalRevenue: totalRev,
          paidInvoicesCount: invoices.filter((i: any) => i.status === 'PAID' || i.paymentStatus === 'PAID').length,
        });

        setNotifications(notifs);
      } catch (err: any) {
        showToast('error', 'Error', 'Failed to load manager metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalBedsCount = HOSPITAL_WARDS.reduce((sum, w) => sum + w.totalBeds, 0);
  const totalOccupiedCount = HOSPITAL_WARDS.reduce((sum, w) => sum + w.occupiedBeds, 0);
  const overallOccupancyRate = Math.round((totalOccupiedCount / totalBedsCount) * 100);

  const notifColumns: Column<any>[] = [
    {
      key: 'eventType',
      header: 'Event Type',
      sortable: true,
      render: (n) => <StatusBadge status={n.eventType || 'NOTIFICATION'} />,
    },
    {
      key: 'recipientName',
      header: 'Recipient',
      mobileTitle: true,
      sortable: true,
      render: (n) => (
        <div>
          <div className="font-bold text-slate-900 truncate">{n.recipientName || 'Verified Patient'}</div>
          <div className="text-[10px] text-slate-400 font-mono">{n.recipientEmail || 'patient@pulseos.lk'}</div>
        </div>
      ),
    },
    {
      key: 'referenceId',
      header: 'Ref ID',
      sortable: true,
      render: (n) => <span className="font-mono font-bold text-slate-700">{n.referenceId || 'N/A'}</span>,
    },
    {
      key: 'subject',
      header: 'Subject Notice',
      render: (n) => <span className="text-slate-600 truncate max-w-xs block" title={n.subject}>{n.subject}</span>,
    },
    {
      key: 'status',
      header: 'Dispatch Status',
      sortable: true,
      render: (n) => <StatusBadge status={n.status || 'SENT'} dot />,
    },
  ];

  return (
    <div className="space-y-6 font-sans min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
              Hospital Operations &amp; Executive Cockpit
            </h1>
            <StatusBadge status="ACTIVE" dot>Executive Ops Active</StatusBadge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestalt clinical capacity overview, ward bed allocation, cross-department scheduling, and audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shrink-0">
          <span className="text-emerald-700 font-bold">● Overall Census: {overallOccupancyRate}%</span>
          <span className="text-slate-400">({totalOccupiedCount}/{totalBedsCount} Beds)</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        <StatCard
          title="Active Medical Staff"
          value={stats.activeDoctors}
          subtitle="Consultants currently on duty"
          icon={Stethoscope}
          variant="teal"
          loading={loading}
          trend={{ value: '100% Specialist', isPositive: true }}
        />
        <StatCard
          title="Inpatient Census"
          value={`${overallOccupancyRate}%`}
          subtitle={`${totalBedsCount - totalOccupiedCount} open beds available`}
          icon={Building2}
          variant="purple"
          loading={loading}
          trend={{ value: 'Optimal Capacity', isPositive: true }}
        />
        <StatCard
          title="Reconciled Revenue"
          value={`LKR ${stats.totalRevenue.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`}
          subtitle={`${stats.paidInvoicesCount} invoices settled`}
          icon={DollarSign}
          variant="emerald"
          loading={loading}
          trend={{ value: 'Audited', isPositive: true }}
        />
        <StatCard
          title="Electronic Charts"
          value={stats.totalPatients}
          subtitle="Active patient EMR charts"
          icon={Users}
          variant="sky"
          loading={loading}
          trend={{ value: 'EHR Synced', isPositive: true }}
        />
      </div>

      {/* Operations Telemetry Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 p-4 rounded-2xl bg-slate-900 text-white font-mono text-xs">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Door-to-Doctor Velocity</span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-teal-400 tabular-nums">18 Mins</span>
            <span className="text-[10px] text-emerald-400 font-sans">-12% vs target</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Laboratory Turnaround</span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-indigo-400 tabular-nums">42 Mins</span>
            <span className="text-[10px] text-emerald-400 font-sans">98% on-time</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Pharmacy Fulfillment</span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-emerald-400 tabular-nums">6.5 Mins</span>
            <span className="text-[10px] text-emerald-400 font-sans">Zero errors</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Bed Turnover Velocity</span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-purple-400 tabular-nums">24 Mins</span>
            <span className="text-[10px] text-slate-400 font-sans">Terminal sanitize</span>
          </div>
        </div>
      </div>

      {/* Ward Bed Census Matrix */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs p-5 sm:p-6 space-y-5 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-purple-600" />
              <h2 className="text-base font-bold text-slate-900">Hospital Inpatient Bed Census &amp; Ward Matrix</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live ward occupancy, terminal sanitization status, and patient bed allocation
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-blue-500" />
              <span className="text-slate-600">Occupied</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-emerald-500" />
              <span className="text-slate-600">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-amber-400" />
              <span className="text-slate-600">Sanitizing</span>
            </div>
          </div>
        </div>

        {/* Ward Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 min-w-0">
          {HOSPITAL_WARDS.map((ward) => {
            const isSelected = selectedWard.id === ward.id;
            const occupancy = Math.round((ward.occupiedBeds / ward.totalBeds) * 100);

            return (
              <div
                key={ward.id}
                onClick={() => setSelectedWard(ward)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/50 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-xs text-slate-900 truncate">{ward.name}</h4>
                  <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100/70 px-1.5 py-0.5 rounded shrink-0">
                    {occupancy}%
                  </span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${occupancy}%` }} />
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>{ward.occupiedBeds} In Use</span>
                  <span className="text-emerald-700 font-bold">{ward.totalBeds - ward.occupiedBeds} Open</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Ward Visual Bed Grid */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Department Detail Roster
              </span>
              <h3 className="text-sm font-bold text-slate-900">{selectedWard.name}</h3>
            </div>
            <span className="text-xs font-mono text-slate-600 hidden sm:inline">
              Capacity: <strong>{selectedWard.totalBeds} Critical Beds</strong> &bull; Category: {selectedWard.category}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {Array.from({ length: selectedWard.totalBeds }).map((_, index) => {
              const bedNum = index + 1;
              const isOccupied = bedNum <= selectedWard.occupiedBeds;
              const isCleaning = !isOccupied && bedNum === selectedWard.occupiedBeds + selectedWard.cleaningBeds;

              return (
                <div
                  key={bedNum}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    isOccupied
                      ? 'bg-blue-50 border-blue-200 text-blue-900'
                      : isCleaning
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-white border-emerald-200 text-emerald-900'
                  }`}
                >
                  <span className="block font-mono text-xs font-bold">
                    Bed {bedNum < 10 ? `0${bedNum}` : bedNum}
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-wider block mt-0.5">
                    {isOccupied ? 'Occupied' : isCleaning ? 'Sanitizing' : 'Available'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cross-Department Calendar */}
      <AppointmentCalendar role="MANAGER" />

      {/* Notifications Audit Log Table */}
      <DataTable<any>
        data={notifications}
        columns={notifColumns}
        keyExtractor={(n) => n.id || Math.random()}
        loading={loading}
        title="Notification & Communications Audit Log"
        subtitle="Live audit stream of all appointment confirmations, receipts, and clinical alerts dispatched"
        searchPlaceholder="Filter by email, reference ID, subject..."
        searchFilter={(n, q) =>
          (n.recipientEmail ? n.recipientEmail.toLowerCase().includes(q) : false) ||
          (n.referenceId ? n.referenceId.toLowerCase().includes(q) : false) ||
          (n.eventType ? n.eventType.toLowerCase().includes(q) : false) ||
          (n.subject ? n.subject.toLowerCase().includes(q) : false)
        }
      />
    </div>
  );
};

export default ManagerDashboardView;
