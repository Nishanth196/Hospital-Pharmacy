import React from 'react';
<<<<<<< HEAD
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Pill,
  LayoutDashboard,
  CheckCircle,
  Clock,
  KeyRound,
  FileSpreadsheet,
  BarChart3,
  TestTube2,
  Info,
  UserCheck,
  LogOut,
} from 'lucide-react';
import { getCurrentUser } from '../services/api';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    localStorage.removeItem('hospital_pharmacy_user');
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/check', label: 'Check Substitution', icon: CheckCircle },
    { to: '/human-review', label: 'Human Review', icon: Clock },
    { to: '/override', label: 'Override', icon: KeyRound },
    { to: '/audit', label: 'Audit Logs', icon: FileSpreadsheet },
    { to: '/metrics', label: 'Metrics', icon: BarChart3 },
    { to: '/test-cases', label: 'Synthetic Tests', icon: TestTube2 },
    { to: '/about', label: 'About & Limitations', icon: Info },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-hospital-600 rounded-lg text-white shadow-sm">
              <Pill size={22} className="rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  PHARMA<span className="text-hospital-600">SUB</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-hospital-100 text-hospital-800 px-1.5 py-0.5 rounded">
                  Clinical DSS
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Hospital Pharmacy Substitution Engine</p>
            </div>
          </div>

          {/* User Profile & Role Selector */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-right">
              <div>
                <p className="text-xs font-bold text-slate-800">{user.name}</p>
                <div className="flex items-center justify-end gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <p className="text-[10px] font-medium text-slate-500">{user.role}</p>
                </div>
              </div>
              <div className="p-2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                <UserCheck size={16} />
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Switch user or logout"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-100 text-xs font-semibold scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-hospital-50 text-hospital-700 font-bold border border-hospital-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
=======
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
          <span>Clinical Decision Support System</span>
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
>>>>>>> 06d7a50b1e9874e1f3c047ce23b8ed89374ee878
      </div>
    </header>
  );
};
