import React, { useState, useEffect } from 'react';
import { fetchEscalations } from '../api';
import { EscalationCase } from '../types';
import { AlertTriangle, ShieldAlert, Clock, UserCheck, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

interface EscalationCenterProps {
  onSelectPrescription: (id: number) => void;
}

export const EscalationCenter: React.FC<EscalationCenterProps> = ({ onSelectPrescription }) => {
  const [escalations, setEscalations] = useState<EscalationCase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchEscalations();
      setEscalations(res);
    } catch (e) {
      console.error('Failed to fetch escalations', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getEscalationBadge = (level: number) => {
    switch (level) {
      case 4:
        return <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded text-[11px] font-bold">LEVEL 4 — Urgent / Emergency</span>;
      case 3:
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[11px] font-bold">LEVEL 3 — Prescriber Review</span>;
      case 2:
        return <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded text-[11px] font-bold">LEVEL 2 — Senior Pharmacist</span>;
      default:
        return <span className="bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded text-[11px] font-bold">LEVEL 1 — Staff Pharmacist</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Clinical Escalation Center
          </h2>
          <p className="text-xs text-slate-400">
            Cases flagged for prescriber approval, clinical ambiguity, or high urgency.
          </p>
        </div>
        <button
          onClick={loadData}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-teal-400" /> Loading escalations...
          </div>
        ) : escalations.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No pending escalations found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">Prescription Code</th>
                  <th className="px-4 py-3">Urgency</th>
                  <th className="px-4 py-3">Escalation Tier</th>
                  <th className="px-4 py-3">Reason / Trigger</th>
                  <th className="px-4 py-3">Assigned Reviewer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {escalations.map((c) => (
                  <tr key={c.decision_id} className="hover:bg-slate-700/40 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-200">
                      {c.prescription_code}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.urgency === 'EMERGENCY' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {c.urgency}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getEscalationBadge(c.escalation_level)}</td>
                    <td className="px-4 py-3 text-slate-300 font-medium">{c.reasons || 'Prescriber approval required'}</td>
                    <td className="px-4 py-3 text-slate-400">{c.reviewer}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onSelectPrescription(c.prescription_id)}
                        className="bg-teal-600/20 hover:bg-teal-600/40 text-teal-300 border border-teal-500/30 px-3 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 transition"
                      >
                        Review <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
