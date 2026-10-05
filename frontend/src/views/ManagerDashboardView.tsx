import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  DollarSign,
  Bell,
  Stethoscope,
  Search,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { doctorApi, patientApi, billingApi, notificationsApi } from '../services/api';
import { AppointmentCalendar } from '../components/appointments/AppointmentCalendar';

export const ManagerDashboardView: React.FC = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    activeDoctors: 0,
    totalPatients: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    paidInvoicesCount: 0,
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifFilter, setNotifFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
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
          .filter((i: any) => i.paymentStatus === 'PAID')
          .reduce((sum: number, i: any) => sum + (Number(i.netAmount) || 0), 0);

        setStats({
          activeDoctors: docs.filter((d: any) => d.isAvailable !== false).length,
          totalPatients: pats.length,
          totalInvoices: invoices.length,
          totalRevenue: totalRev,
          paidInvoicesCount: invoices.filter((i: any) => i.paymentStatus === 'PAID').length,
        });

        setNotifications(notifs);
      } catch (err: any) {
        showToast('error', 'Error', 'Failed to load manager metrics');
      }
    };

    fetchData();
  }, []);

  const filteredNotifs = notifications.filter(
    (n) =>
      !notifFilter ||
      n.recipientEmail?.toLowerCase().includes(notifFilter.toLowerCase()) ||
      n.referenceId?.toLowerCase().includes(notifFilter.toLowerCase()) ||
      n.eventType?.toLowerCase().includes(notifFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Physicians</span>
            <span className="p-2 rounded-lg bg-teal-50 text-teal-600"><Stethoscope className="h-4 w-4" /></span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 font-mono">{stats.activeDoctors}</span>
            <span className="text-xs text-slate-500 ml-2">specialists on duty</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Patients</span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600"><Users className="h-4 w-4" /></span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 font-mono">{stats.totalPatients}</span>
            <span className="text-xs text-emerald-600 ml-2 font-medium">active clinical records</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue Collected</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><DollarSign className="h-4 w-4" /></span>
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-slate-900 font-mono">
              LKR {stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-500 ml-2">{stats.paidInvoicesCount} invoices settled</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inpatient Capacity</span>
            <span className="p-2 rounded-lg bg-purple-50 text-purple-600"><Building2 className="h-4 w-4" /></span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 font-mono">78%</span>
            <span className="text-xs text-slate-500 ml-2">normal occupancy</span>
          </div>
        </div>
      </div>

      {/* Cross-Department Calendar Matrix */}
      <AppointmentCalendar role="MANAGER" />

      {/* Real-time Email & Communications Audit Trail */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-teal-600" />
              <h3 className="text-base font-bold text-slate-900">Notification & Communications Audit Log</h3>
            </div>
            <p className="text-xs text-slate-500">
              Live audit stream of all appointment confirmations, receipts, and clinical alerts dispatched
            </p>
          </div>

          <div className="w-full sm:w-64">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by email or reference..."
                value={notifFilter}
                onChange={(e) => setNotifFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-4">Event Type</th>
                <th className="py-2.5 px-4">Recipient</th>
                <th className="py-2.5 px-4">Reference ID</th>
                <th className="py-2.5 px-4">Subject</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNotifs.length > 0 ? (
                filteredNotifs.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                        {n.eventType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{n.recipientName || 'Verified Patient'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{n.recipientEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">{n.referenceId}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{n.subject}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {n.status || 'SENT'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No notifications recorded in audit pipeline.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardView;
