import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  Filter,
  Search,
  RotateCcw,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Download,
  KeyRound,
  UserCheck,
  Zap,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { AuditEvent } from '../types';

export const AuditLogsPage: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Filters
  const [userIdFilter, setUserIdFilter] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [prescriptionFilter, setPrescriptionFilter] = useState('');

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs({
        userId: userIdFilter || undefined,
        decision: decisionFilter || undefined,
        action: actionFilter || undefined,
        prescriptionId: prescriptionFilter || undefined,
      });
      setEvents(data);
    } catch (err) {
      console.error('Failed to load audit events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setUserIdFilter('');
    setDecisionFilter('');
    setActionFilter('');
    setPrescriptionFilter('');
    setTimeout(() => loadAuditLogs(), 50);
  };

  const toggleExpand = (id: string) => {
    setExpandedEventId(expandedEventId === id ? null : id);
  };

  const exportToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `pharmacy_audit_ledger_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'DECISION_CREATED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">CREATED</span>;
      case 'HUMAN_CONFIRMED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">CONFIRMED</span>;
      case 'OVERRIDE_APPROVED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">OVERRIDE</span>;
      case 'DECISION_ESCALATED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">ESCALATED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">{action}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet size={24} className="text-hospital-600" />
            Persistent Audit Trail Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Immutable SQLite transaction record tracking all algorithmic decisions, pharmacist reviews, and clinical overrides.
          </p>
        </div>

        <button
          onClick={exportToJson}
          disabled={events.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition-colors"
        >
          <Download size={15} />
          <span>Export Ledger JSON</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-3">
          <Filter size={15} className="text-hospital-600" />
          <span>Filter Audit Records</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Clinician ID</label>
            <input
              type="text"
              placeholder="e.g. PHARM-101"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Decision Outcome</label>
            <select
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white"
            >
              <option value="">All Decisions</option>
              <option value="APPROVED">APPROVED</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="ESCALATED">ESCALATED</option>
              <option value="REVIEW_REQUIRED">REVIEW_REQUIRED</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Audit Action</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white"
            >
              <option value="">All Actions</option>
              <option value="DECISION_CREATED">DECISION_CREATED</option>
              <option value="HUMAN_CONFIRMED">HUMAN_CONFIRMED</option>
              <option value="OVERRIDE_APPROVED">OVERRIDE_APPROVED</option>
              <option value="DECISION_ESCALATED">DECISION_ESCALATED</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Prescription ID</label>
            <input
              type="text"
              placeholder="e.g. RX-1001"
              value={prescriptionFilter}
              onChange={(e) => setPrescriptionFilter(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 font-mono"
            />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
          >
            <RotateCcw size={13} />
            <span>Reset Filters</span>
          </button>

          <button
            type="button"
            onClick={loadAuditLogs}
            className="px-4 py-1.5 bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Audit Events Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Chronological Audit Entries ({events.length})
          </span>
          <span className="text-[11px] text-slate-400">Sorted by Timestamp (Ascending)</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading audit ledger...</div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No matching audit events found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {events.map((evt) => {
              const isExpanded = expandedEventId === evt.event_id;
              return (
                <div key={evt.event_id} className="p-4 hover:bg-slate-50/70 transition-colors">
                  <div
                    onClick={() => toggleExpand(evt.event_id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <button className="text-slate-400 hover:text-slate-600 mt-0.5 sm:mt-0">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-800">{evt.event_id}</span>
                          {getActionBadge(evt.action)}
                          <StatusBadge status={evt.decision} size="sm" />
                          {evt.override_requested && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                              OVERRIDE
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>User: <strong className="text-slate-700">{evt.user_id}</strong> ({evt.user_role})</span>
                          <span>•</span>
                          <span>Rx: <strong className="text-slate-700 font-mono">{evt.prescription_id}</strong></span>
                          <span>•</span>
                          <span>Pt: <strong className="text-slate-700 font-mono">{evt.patient_id}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right sm:self-center font-mono text-[11px] text-slate-400">
                      {evt.timestamp ? new Date(evt.timestamp).toLocaleString() : 'N/A'}
                    </div>
                  </div>

                  {/* Expanded JSON Inspector & Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 pl-7 space-y-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">Audit Rationale Note:</span>
                        <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                          {evt.rationale}
                        </p>
                      </div>

                      {evt.override_reason && (
                        <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-lg text-rose-900">
                          <span className="font-bold block mb-1">Clinical Override Justification:</span>
                          <p>{evt.override_reason}</p>
                          <p className="text-[11px] text-rose-600 mt-1">
                            Previous Decision: {evt.previous_decision} → Final Decision: {evt.final_decision}
                          </p>
                        </div>
                      )}

                      <div>
                        <span className="font-bold text-slate-700 block mb-1">Raw Event Metadata:</span>
                        <pre className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
                          {JSON.stringify(evt.metadata || {}, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
