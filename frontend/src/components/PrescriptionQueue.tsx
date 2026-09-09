import React, { useState, useEffect } from 'react';
import { fetchPrescriptions } from '../api';
import { Prescription } from '../types';
import { Search, Filter, Play, CheckCircle2, ShieldAlert, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';

interface PrescriptionQueueProps {
  onSelectPrescription: (id: number) => void;
}

export const PrescriptionQueue: React.FC<PrescriptionQueueProps> = ({ onSelectPrescription }) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPrescriptions()
      .then(setPrescriptions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = prescriptions.filter((p) => {
    const matchesSearch =
      p.prescription_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.prescriber_name && p.prescriber_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesUrgency = urgencyFilter === 'ALL' || p.urgency === urgencyFilter;

    return matchesSearch && matchesUrgency;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            Hospital Prescription Queue
          </h2>
          <p className="text-xs text-slate-400">
            Active ward, OR, and outpatient prescriptions ready for clinical substitution check.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search code, medicine, doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Urgency Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-teal-400" />
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Urgencies</option>
              <option value="ROUTINE" className="bg-slate-900">Routine</option>
              <option value="URGENT" className="bg-slate-900">Urgent</option>
              <option value="EMERGENCY" className="bg-slate-900">Emergency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-teal-400" />
            Loading prescriptions...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">Prescription Code</th>
                  <th className="px-4 py-3">Requested Medicine</th>
                  <th className="px-4 py-3">Dose & Route</th>
                  <th className="px-4 py-3">Urgency</th>
                  <th className="px-4 py-3">Prescriber</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {filtered.map((p) => {
                  const isEmergency = p.urgency === 'EMERGENCY';
                  const isUrgent = p.urgency === 'URGENT';

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-700/40 transition cursor-pointer ${
                        isEmergency ? 'bg-rose-950/20' : isUrgent ? 'bg-amber-950/10' : ''
                      }`}
                      onClick={() => onSelectPrescription(p.id)}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-200">
                        {p.prescription_code}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-100">
                        {p.medicine_name}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {p.dose} • {p.route} ({p.frequency})
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${
                            isEmergency
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : isUrgent
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          {isEmergency && <ShieldAlert className="w-3 h-3 text-rose-400" />}
                          {isUrgent && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                          {p.urgency}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{p.prescriber_name || 'Staff Doctor'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPrescription(p.id);
                          }}
                          className="bg-teal-600/20 hover:bg-teal-600/40 text-teal-300 border border-teal-500/30 px-3 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 transition"
                        >
                          Evaluate <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
