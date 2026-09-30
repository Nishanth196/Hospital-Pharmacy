import React, { useState, useEffect } from 'react';
import { fetchAuditLogs } from '../api';
import { AuditLog } from '../types';
import { Clock, Search, ShieldCheck, Lock, RefreshCw, FileText } from 'lucide-react';

export const AuditHistory: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error('Failed to load audit logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.performed_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.reason && l.reason.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-400" />
            Immutable Audit Trail & History
          </h2>
          <p className="text-xs text-slate-400">
            Complete traceability log recording every pharmacist confirmation, escalation, and override.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search user, action, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 w-64"
            />
          </div>
          <button
            onClick={loadLogs}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-teal-400" /> Loading audit history...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No audit records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Decision ID</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Performed By</th>
                  <th className="px-4 py-3">Clinical Justification / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 font-mono">
                {filtered.map((log) => {
                  const isOverride = log.action === 'OVERRIDE';
                  const isApprove = log.action === 'APPROVED';

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-700/40 transition ${
                        isOverride ? 'bg-purple-950/20' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-slate-400 text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-teal-300 font-bold">DEC-{log.decision_id}</td>
                      <td className="px-4 py-3 font-sans font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] border ${
                            isOverride
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : isApprove
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-sans text-slate-200">{log.performed_by}</td>
                      <td className="px-4 py-3 font-sans text-slate-300 max-w-md truncate">
                        {log.reason || 'No detailed note provided.'}
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
