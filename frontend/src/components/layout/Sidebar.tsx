import React, { useState } from 'react';
import {
  Users,
  Stethoscope,
  CalendarCheck,
  Pill,
  Receipt,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
} from 'lucide-react';
import { useRole, CLINICAL_STAFF } from '../../context/RoleContext';
import { ModuleId, UserRole } from '../../types';

interface NavGroup {
  heading: string;
  items: {
    id: ModuleId;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    heading: 'Clinical Encounters',
    items: [
      { id: 'patients', label: 'Patient Registry', icon: Users },
      { id: 'doctors', label: 'Physician Rosters', icon: Stethoscope },
      { id: 'appointments', label: 'Consultations', icon: CalendarCheck },
    ],
  },
  {
    heading: 'Diagnostics & Therapy',
    items: [
      { id: 'pharmacy', label: 'Central Dispensary', icon: Pill },
      { id: 'laboratory', label: 'Diagnostic Pathology', icon: FlaskConical },
    ],
  },
  {
    heading: 'Administration',
    items: [
      { id: 'billing', label: 'Billing & Cashier', icon: Receipt },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { currentRole, setRole, activeModule, setActiveModule } = useRole();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative h-[calc(100vh-4rem)] border-r border-slate-200/80 bg-white transition-all duration-200 ease-out flex flex-col justify-between shrink-0 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Section: Workstation Switcher & Module Navigation */}
      <div className="p-3 space-y-4 overflow-y-auto custom-scrollbar">
        {/* Workstation Profile Selector */}
        <div className="space-y-1.5">
          {!collapsed && (
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Clinical Station
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                Online
              </span>
            </div>
          )}

          <div className="bg-slate-50 p-1.5 rounded-apple-xl border border-slate-200/80">
            {collapsed ? (
              <div
                className="flex justify-center p-1.5"
                title={`Current Station: ${CLINICAL_STAFF[currentRole].roleTitle}`}
              >
                <Shield className="h-5 w-5 text-clinical-teal-600" />
              </div>
            ) : (
              <select
                value={currentRole}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-clinical-ink focus:outline-none focus:ring-2 focus:ring-clinical-teal-500 shadow-2xs cursor-pointer"
              >
                {Object.entries(CLINICAL_STAFF).map(([roleKey, profile]) => (
                  <option key={roleKey} value={roleKey}>
                    {profile.roleTitle}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Grouped Navigation */}
        <nav className="space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.heading} className="space-y-1">
              {!collapsed && (
                <div className="px-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {group.heading}
                </div>
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`apple-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-apple-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-clinical-teal-600 text-white shadow-sm shadow-clinical-teal-600/25 font-bold'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <Icon
                      className={`h-4.5 w-4.5 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-500'
                      }`}
                    />
                    {!collapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Section: Operational Status & Collapse Toggle */}
      <div className="p-3 border-t border-slate-200/80 space-y-2">
        {!collapsed && (
          <div className="px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200/70 text-[10px] text-slate-500 space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Activity className="h-3 w-3 text-clinical-teal-600" />
              <span>PulseOS HIS Core</span>
            </div>
            <p className="text-[9px] text-slate-400 font-mono">
              Inpatient & OPD Sync Active
            </p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="apple-btn w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
