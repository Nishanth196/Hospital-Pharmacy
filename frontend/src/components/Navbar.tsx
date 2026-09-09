import React from 'react';
import { Activity, ShieldAlert, Play, UserCheck, ChevronRight, FileText, CheckCircle2, BarChart3, Clock, AlertTriangle } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUserRole: string;
  setCurrentUserRole: (role: string) => void;
  onRunRoutineJourney: () => void;
  onRunEmergencyJourney: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUserRole,
  setCurrentUserRole,
  onRunRoutineJourney,
  onRunEmergencyJourney,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'queue', label: 'Prescription Queue', icon: FileText },
    { id: 'escalations', label: 'Escalation Center', icon: AlertTriangle },
    { id: 'audit', label: 'Audit History', icon: Clock },
    { id: 'validation', label: 'Validation & Baseline', icon: CheckCircle2 },
  ];

  const roles = ['Pharmacist', 'Senior Pharmacist', 'Prescriber', 'Administrator'];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      {/* Top Demo Banner */}
      <div className="bg-gradient-to-r from-teal-900/80 via-slate-900 to-indigo-900/80 px-4 py-1.5 text-xs flex justify-between items-center border-b border-teal-500/20">
        <div className="flex items-center gap-2 text-teal-300 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
          <span>SIH 2026 PROTOTYPE — Clinical Decision Support System</span>
          <span className="text-slate-400 hidden md:inline">| Not intended for autonomous prescribing or dispensing.</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-mono text-[11px]">DEMO MODE</span>
          <button
            onClick={onRunRoutineJourney}
            className="bg-teal-600/30 hover:bg-teal-600/50 text-teal-200 border border-teal-500/40 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition"
          >
            <Play className="w-3 h-3 text-teal-400" /> Run Routine Journey
          </button>
          <button
            onClick={onRunEmergencyJourney}
            className="bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition"
          >
            <ShieldAlert className="w-3 h-3 text-amber-400" /> Run Emergency Journey
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 leading-tight">PharmaCheck DS</h1>
            <p className="text-xs text-slate-400 font-medium">Hospital Pharmacy Substitution Engine</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  active
                    ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-teal-400' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* User Role Switcher */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
          <UserCheck className="w-4 h-4 text-teal-400" />
          <span className="text-slate-400">Role:</span>
          <select
            value={currentUserRole}
            onChange={(e) => setCurrentUserRole(e.target.value)}
            className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
          >
            {roles.map((r) => (
              <option key={r} value={r} className="bg-slate-900 text-slate-200">
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
