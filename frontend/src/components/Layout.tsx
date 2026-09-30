import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { AlertTriangle, Server, ShieldCheck, Activity } from 'lucide-react';
import { api } from '../services/api';

export const Layout: React.FC = () => {
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    api.checkHealth()
      .then((data) => setBackendHealthy(data.status === 'healthy'))
      .catch(() => setBackendHealthy(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Institutional Academic Disclaimer Banner */}
      <div className="bg-amber-500 text-white text-[11px] font-bold py-1 px-4 text-center tracking-wide flex items-center justify-center gap-2 shadow-xs">
        <AlertTriangle size={14} className="shrink-0" />
        <span>
          ACADEMIC & SOFTWARE PROTOTYPE ONLY — Strictly Synthetic/Demo Data — Do NOT Use for Real-World Medical Decisions
        </span>
      </div>

      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-hospital-600" />
            <span className="font-semibold text-slate-700">Hospital Pharmacy Substitution Decision Support System</span>
            <span className="text-slate-300">|</span>
            <span>Deterministic 15-Step Rule Engine v1.0.0</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${backendHealthy ? 'bg-emerald-500 animate-pulse' : backendHealthy === false ? 'bg-rose-500' : 'bg-slate-300'}`}></span>
              <span>Backend API: {backendHealthy ? 'Connected' : backendHealthy === false ? 'Disconnected' : 'Checking...'}</span>
            </div>
            <span className="text-slate-300">|</span>
            <span>Local SQLite Ledger</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
