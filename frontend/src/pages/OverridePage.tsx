import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  KeyRound,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  FileText,
  UserCheck,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { api, getCurrentUser } from '../services/api';
import { DecisionOutput } from '../types';

export const OverridePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const idFromUrl = searchParams.get('id') || '';

  const [decisionIdInput, setDecisionIdInput] = useState<string>(idFromUrl);
  const [decision, setDecision] = useState<DecisionOutput | null>(null);
  const [overrideReason, setOverrideReason] = useState<string>('Pharmacist confirmed after manual review with attending physician; patient tolerance verified.');
  const [finalDecision, setFinalDecision] = useState<string>('APPROVED');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (idFromUrl) {
      loadDecision(idFromUrl);
    }
  }, [idFromUrl]);

  const loadDecision = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setStatusMessage(null);
    try {
      const dec = await api.getDecisionById(id.trim());
      setDecision(dec);
    } catch (err: any) {
      setDecision(null);
      setStatusMessage({ type: 'error', text: `Failed to find decision ${id}: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision) return;

    if (!overrideReason || overrideReason.trim().length < 5) {
      setStatusMessage({ type: 'error', text: 'A mandatory, detailed clinical justification is required for all overrides.' });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await api.overrideDecision(decision.decision_id, overrideReason, finalDecision);
      setStatusMessage({
        type: 'success',
        text: `Override approved! Decision ${decision.decision_id} updated to ${finalDecision}. Immutable audit event logged.`,
      });
      // reload decision
      loadDecision(decision.decision_id);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to submit clinical override' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <KeyRound size={24} className="text-hospital-600" />
            Clinical Override Console
          </h1>
          <p className="text-xs text-slate-500">
            Institutional authorization portal to override algorithmic substitution blocks or review holds.
          </p>
        </div>
      </div>

      {/* Mandatory Safeguard Warning */}
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
        <ShieldAlert size={22} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900">
          <h4 className="font-bold">Strict Audit Notice: Silent Overrides Are Prohibited</h4>
          <p className="mt-1 leading-relaxed opacity-90">
            Every clinical override is permanently recorded in the append-only SQLite audit ledger with your practitioner ID, role timestamp, previous decision, and mandatory clinical justification note.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Decision Selector Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full">
            <label className="block text-xs font-bold text-slate-700 mb-1">Enter Target Decision ID</label>
            <input
              type="text"
              value={decisionIdInput}
              onChange={(e) => setDecisionIdInput(e.target.value)}
              placeholder="e.g. DEC-1001 or copy from Dashboard"
              className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2.5"
            />
          </div>
          <button
            type="button"
            onClick={() => loadDecision(decisionIdInput)}
            disabled={loading || !decisionIdInput.trim()}
            className="sm:mt-5 w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Fetching...' : 'Load Case'}
          </button>
        </div>

        {/* Loaded Decision Diagnostic Preview */}
        {decision && (
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono text-slate-400 font-bold">{decision.decision_id}</span>
                <h3 className="text-sm font-bold text-slate-900">{decision.requested_medicine}</h3>
                <p className="text-xs text-slate-500">
                  Patient: {decision.patient_id} | Prescription: {decision.prescription_id}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Algorithmic Verdict</span>
                  <StatusBadge status={decision.decision} size="sm" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Current State</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {decision.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Override Form */}
            <form onSubmit={handleOverrideSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Override Decision *</label>
                  <select
                    value={finalDecision}
                    onChange={(e) => setFinalDecision(e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-lg p-2.5 bg-white"
                  >
                    <option value="APPROVED">APPROVED (Authorize Dispense)</option>
                    <option value="BLOCKED">BLOCKED (Administrative Revocation)</option>
                    <option value="ESCALATED">ESCALATED (Elevate to Pharmacy Chief)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Authorizing Pharmacist</label>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{currentUser.name}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{currentUser.role}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mandatory Clinical Justification * (min 5 characters)
                </label>
                <textarea
                  required
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Detail the clinical assessment, prescriber consultation notes, lab review, or tolerability confirmation..."
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-hospital-500 font-sans"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <ArrowLeft size={14} />
                  <span>Cancel</span>
                </button>

                <button
                  type="submit"
                  disabled={submitting || !overrideReason.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  <Lock size={15} />
                  <span>{submitting ? 'Authenticating & Overriding...' : 'Authorize Clinical Override'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
