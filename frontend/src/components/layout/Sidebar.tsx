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
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useRole, TEAM_MEMBERS } from '../../context/RoleContext';
import { ModuleId, UserRole } from '../../types';

interface NavItem {
  id: ModuleId;
  label: string;
  icon: React.ElementType;
  primaryRole: UserRole;
  studentId: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'patients', label: 'Patient Management', icon: Users, primaryRole: 'RECEPTIONIST', studentId: 'IT25103819' },
  { id: 'doctors', label: 'Doctor Rosters', icon: Stethoscope, primaryRole: 'DOCTOR', studentId: 'IT25103999' },
  { id: 'appointments', label: 'Appointments', icon: CalendarCheck, primaryRole: 'RECEPTIONIST', studentId: 'IT25101620' },
  { id: 'pharmacy', label: 'Pharmacy & Stock', icon: Pill, primaryRole: 'PHARMACIST', studentId: 'IT25100826' },
  { id: 'billing', label: 'Billing & PayHere', icon: Receipt, primaryRole: 'CASHIER_ADMIN', studentId: 'IT25103992' },
  { id: 'laboratory', label: 'Diagnostic Lab', icon: FlaskConical, primaryRole: 'LAB_TECHNICIAN', studentId: 'IT25103363' },
];

export const Sidebar: React.FC = () => {
  const { currentRole, setRole, activeModule, setActiveModule } = useRole();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative h-[calc(100vh-4rem)] border-r border-slate-200/80 bg-white transition-all duration-200 ease-out flex flex-col justify-between shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top: Role Switcher & Nav Items */}
      <div className="p-3 space-y-4">
        {/* Role Switcher Section */}
        <div className="space-y-1.5">
          {!collapsed && (
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-clinical-ink-muted">
                Active Hospital Role
              </span>
              <span className="text-[10px] font-mono text-clinical-teal-600 bg-clinical-teal-50 px-1.5 py-0.5 rounded border border-clinical-teal-100">
                5 Roles
              </span>
            </div>
          )}

          <div className="bg-slate-50 p-1 rounded-apple-xl border border-slate-200/80">
            {collapsed ? (
              <div className="flex justify-center p-1.5" title={`Current: ${TEAM_MEMBERS[currentRole].role}`}>
                <UserCheck className="h-5 w-5 text-clinical-teal-600" />
              </div>
            ) : (
              <select
                value={currentRole}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-clinical-ink focus:outline-none focus:ring-2 focus:ring-clinical-teal-500 shadow-sm cursor-pointer"
              >
                {Object.entries(TEAM_MEMBERS).map(([roleKey, profile]) => (
                  <option key={roleKey} value={roleKey}>
                    {profile.role.replace('_', ' ')}: {profile.name.split(' ')[0]} ({profile.studentId})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* 6 Core Modules Navigation */}
        <nav className="space-y-1">
          {!collapsed && (
            <div className="px-1 pt-1 pb-0.5 text-[11px] font-bold uppercase tracking-wider text-clinical-ink-muted">
              Hospital Modules (6)
            </div>
          )}

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            const isAssigned = item.primaryRole === currentRole;

            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                title={collapsed ? `${item.label} (${item.studentId})` : undefined}
                className={`apple-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-apple-xl text-xs font-semibold transition-colors duration-150 ${
                  isActive
                    ? 'bg-clinical-teal-600 text-white shadow-sm shadow-clinical-teal-600/25'
                    : 'text-clinical-ink-secondary hover:bg-slate-100/80 hover:text-clinical-ink'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between text-left">
                    <span className="truncate">{item.label}</span>
                    {isAssigned && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white font-bold'
                            : 'bg-clinical-teal-50 text-clinical-teal-700 border border-clinical-teal-200'
                        }`}
                      >
                        MY ROLE
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Team Watermark & Collapse Toggle */}
      <div className="p-3 border-t border-slate-200/80 space-y-2">
        {!collapsed && (
          <div className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 text-[10px] text-clinical-ink-muted">
            <div className="flex items-center gap-1 font-semibold text-clinical-ink">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>SLIIT SE2030 Batch 02</span>
            </div>
            <p className="text-[9px] font-mono text-slate-400 mt-0.5">Group 60 • PulseOS Final</p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="apple-btn w-full flex items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
};
