import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useRef, useEffect } from 'react';
import {
  Users,
  Stethoscope,
  CalendarCheck,
  Pill,
  Receipt,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Shield,
  Activity,
  Lock,
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
    heading: 'Dedicated Portals',
    items: [
      { id: 'doctor', label: 'Doctor Station', icon: Stethoscope },
      { id: 'pharmacist', label: 'Pharmacist Station', icon: Pill },
      { id: 'manager', label: 'Manager Oversight', icon: Activity },
    ],
  },
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

const ROLE_ALLOWED_MODULES: Record<UserRole, ModuleId[]> = {
  DOCTOR: ['doctor', 'appointments', 'patients'],
  RECEPTIONIST: ['patients', 'appointments', 'doctors', 'billing', 'manager'],
  PHARMACIST: ['pharmacist', 'pharmacy', 'patients'],
  LAB_TECHNICIAN: ['laboratory', 'patients'],
  CASHIER_ADMIN: ['manager', 'doctor', 'pharmacist', 'patients', 'doctors', 'appointments', 'pharmacy', 'laboratory', 'billing'],
};

const ROLE_PRIMARY_MODULE: Record<UserRole, ModuleId> = {
  DOCTOR: 'doctor',
  RECEPTIONIST: 'patients',
  PHARMACIST: 'pharmacist',
  LAB_TECHNICIAN: 'laboratory',
  CASHIER_ADMIN: 'manager',
};

export const Sidebar: React.FC = () => {
  const { currentRole, setRole, setActiveModule } = useRole();
  const [collapsed, setCollapsed] = useState(false);
  const [isStationMenuOpen, setIsStationMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsStationMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    const allowed = ROLE_ALLOWED_MODULES[newRole] || [];
    const currentModule = location.pathname.split('/')[2] as ModuleId;
    if (!allowed.includes(currentModule)) {
      const target = ROLE_PRIMARY_MODULE[newRole] || 'patients';
      setActiveModule(target);
      navigate(`/dashboard/${target}`);
    }
  };

  const handleNavigation = (id: ModuleId) => {
    setActiveModule(id);
    navigate(`/dashboard/${id}`);
  };

  const allowedModules = ROLE_ALLOWED_MODULES[currentRole] || [];
  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => allowedModules.includes(item.id)),
  })).filter((group) => group.items.length > 0);

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

          <div className="relative" ref={dropdownRef}>
            {collapsed ? (
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                className="w-full flex justify-center p-2 rounded-apple-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition-colors"
                title={`Current Station: ${CLINICAL_STAFF[currentRole].roleTitle}`}
              >
                <Shield className="h-5 w-5 text-clinical-teal-600" />
              </button>
            ) : currentRole === 'CASHIER_ADMIN' ? (
              <div>
                <button
                  type="button"
                  onClick={() => setIsStationMenuOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between p-2 rounded-apple-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 text-left transition-all shadow-2xs group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-clinical-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Shield className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-clinical-ink truncate leading-tight">
                        {CLINICAL_STAFF[currentRole].roleTitle}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {CLINICAL_STAFF[currentRole].department}
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-transform ${
                      isStationMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Custom Apple-grade Station Dropdown for Cashier Admin */}
                {isStationMenuOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-apple-xl border border-slate-200 shadow-apple-modal py-1.5 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Admin Station Switcher
                    </div>
                    <div className="space-y-0.5 px-1 max-h-56 overflow-y-auto custom-scrollbar">
                      {Object.entries(CLINICAL_STAFF).map(([roleKey, profile]) => {
                        const isSelected = currentRole === roleKey;
                        return (
                          <button
                            key={roleKey}
                            type="button"
                            onClick={() => {
                              handleRoleChange(roleKey as UserRole);
                              setIsStationMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                              isSelected
                                ? 'bg-clinical-teal-50 text-clinical-teal-900 font-bold border border-clinical-teal-200/60'
                                : 'text-slate-700 hover:bg-slate-50 font-medium'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="truncate text-xs leading-tight">{profile.roleTitle}</div>
                              <div className="text-[10px] text-slate-400 truncate">{profile.department}</div>
                            </div>
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 text-clinical-teal-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Non-Admin Locked Station Badge (Strict RBAC Boundary) */
              <div className="w-full flex items-center justify-between p-2 rounded-apple-xl bg-slate-50 border border-slate-200/80 text-left shadow-2xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-clinical-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Shield className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-clinical-ink truncate leading-tight">
                      {CLINICAL_STAFF[currentRole].roleTitle}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {CLINICAL_STAFF[currentRole].department}
                    </div>
                  </div>
                </div>
                <div
                  className="flex items-center gap-1 text-[10px] text-slate-400 font-medium shrink-0 bg-slate-200/60 px-1.5 py-0.5 rounded"
                  title="Station locked to authenticated role. Sign out to switch users."
                >
                  <Lock className="h-3 w-3 text-slate-500" />
                  <span>Fixed</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Grouped Navigation */}
        <nav className="space-y-4">
          {visibleGroups.map((group) => (
            <div key={group.heading} className="space-y-1">
              {!collapsed && (
                <div className="px-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {group.heading}
                </div>
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.includes(item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
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
          className={`apple-btn w-full flex items-center rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all ${
            collapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
                <span>Collapse Sidebar</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                Sidebar
              </span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
