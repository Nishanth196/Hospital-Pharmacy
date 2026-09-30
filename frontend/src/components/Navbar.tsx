import React from 'react';
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
      </div>
    </header>
  );
};
