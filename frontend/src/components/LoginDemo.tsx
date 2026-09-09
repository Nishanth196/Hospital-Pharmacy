import React from 'react';
import { UserCheck, ShieldCheck, Activity, ArrowRight, Lock } from 'lucide-react';

interface LoginDemoProps {
  onLogin: (role: string) => void;
}

export const LoginDemo: React.FC<LoginDemoProps> = ({ onLogin }) => {
  const roles = [
    {
      id: 'Pharmacist',
      title: 'Staff Pharmacist',
      desc: 'Evaluate prescriptions, perform routine substitution checks, and confirm valid alternatives.',
      badge: 'Level 1 Access',
    },
    {
      id: 'Senior Pharmacist',
      title: 'Senior / Clinical Pharmacist',
      desc: 'Review escalated cases, approve complex substitutions, and perform mandatory override sign-offs.',
      badge: 'Level 2 Access',
    },
    {
      id: 'Prescriber',
      title: 'Prescriber / Attending Physician',
      desc: 'Approve restricted drug substitutions and review emergency OT/ward escalation requests.',
      badge: 'Level 3 Access',
    },
    {
      id: 'Administrator',
      title: 'Pharmacy System Administrator',
      desc: 'Full administrative view of metrics, decision rules, audit trails, and validation results.',
      badge: 'Admin Access',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      {/* Background Glow */}
      <div className="absolute w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-xl w-full space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 mx-auto">
            <Activity className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Hospital Pharmacy Substitution Decision System</h1>
          <p className="text-xs text-teal-400 font-mono">SIH 2026 PROTOTYPE — DEMO ACCESS ENVIRONMENT</p>
        </div>

        {/* Disclaimer Card */}
        <div className="bg-amber-950/20 border border-amber-500/30 p-3.5 rounded-xl text-xs text-amber-200 text-center flex items-center gap-2 justify-center">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Prototype for clinical decision support. Not intended for autonomous prescribing or dispensing.</span>
        </div>

        {/* Role Cards Grid */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-400 text-center uppercase tracking-wider">Select a Demo Role to Access System</p>

          <div className="grid grid-cols-1 gap-3">
            {roles.map((r) => (
              <div
                key={r.id}
                onClick={() => onLogin(r.id)}
                className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/50 p-4 rounded-xl cursor-pointer transition group flex justify-between items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-100">{r.title}</span>
                    <span className="bg-slate-800 text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700">
                      {r.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-md">{r.desc}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-teal-500/20 flex items-center justify-center text-slate-400 group-hover:text-teal-400 transition">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-slate-500 text-center">
          * Uses synthetic deterministic patient & pharmacy data (Seed 42).
        </p>
      </div>
    </div>
  );
};
