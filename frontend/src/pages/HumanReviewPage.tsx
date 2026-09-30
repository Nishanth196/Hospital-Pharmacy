import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  FileText,
  ShieldCheck,
  Search,
  KeyRound,
  ArrowRight,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { RuleTimeline } from '../components/RuleTimeline';
import { api, getCurrentUser } from '../services/api';
import { DecisionOutput } from '../types';

export const HumanReviewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetId = searchParams.get('id');

  const [pendingList, setPendingList] = useState<DecisionOutput[]>([]);
  const [selectedCase, setSelectedCase] = useState<DecisionOutput | null>(null);
  const [confirmationNotes, setConfirmationNotes] = useState<string>('Pharmacist verified serum drug concentration history and patient tolerance.');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const currentUser = getCurrentUser();

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    setLoading(true);
    try {
      const data = await api.getPendingDecisions();
      setPendingList(data);
      if (targetId) {
        const found = data.find((d) => d.decision_id === targetId);
        if (found) setSelectedCase(found);
      } else if (data.length > 0) {
        setSelectedCase(data[0]);
      }
    } catch (err) {
      console.error('Failed to load pending decisions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedCase) return;
    setSubmitting(true);
    setMessage(null);
    try {
      await api.confirmDecision(selectedCase.decision_id, confirmationNotes);
      setMessage(`Decision ${selectedCase.decision_id} successfully confirmed! Audit event persisted.`);
      // Refresh list
      loadPending();
    } catch (err: any) {
      setMessage(`Error: ${err.message || 'Confirmation failed'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Clock size={24} className="text-hospital-600" />
            Human-in-the-Loop Review Queue
          </h1>
          <p className="text-xs text-slate-500">
            Cases flagged for mandatory pharmacist verification, narrow therapeutic index safety, or clinical review.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Active Queue:</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-hospital-100 text-hospital-800 border border-hospital-200">
            {pendingList.length} Pending
          </span>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List of Pending Cases (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Awaiting Confirmation</h3>
            <span className="text-[11px] text-slate-400">Select to inspect</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {pendingList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
                <span>No pending cases requiring review right now.</span>
              </div>
            ) : (
              pendingList.map((item) => {
                const isSelected = selectedCase?.decision_id === item.decision_id;
                return (
                  <div
                    key={item.decision_id}
                    onClick={() => {
                      setSelectedCase(item);
                      setMessage(null);
                    }}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-hospital-50/60 border-l-4 border-hospital-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-slate-800">{item.decision_id}</span>
                      <StatusBadge status={item.decision} size="sm" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{item.requested_medicine}</h4>
                    <p className="text-[11px] text-slate-500">
                      Alt: {item.alternative_name || item.alternative_id || 'Generic'}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Pt: {item.patient_id}</span>
                      <StatusBadge status={item.risk_level} size="sm" showIcon={false} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Case Clinical Inspector & Sign-off (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          {!selectedCase ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Select a case from the queue to review clinical evidence.
            </div>
          ) : (
            <>
              {/* Case Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    {selectedCase.decision_id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedCase.requested_medicine}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Proposed Alternative: <strong className="text-slate-700">{selectedCase.alternative_name || 'Generic'}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={selectedCase.decision} size="md" />
                  <div className="mt-1">
                    <StatusBadge status={selectedCase.risk_level} size="sm" showIcon={false} />
                  </div>
                </div>
              </div>

              {/* Patient & Prescription Context */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold">Prescription ID</span>
                  <span className="font-mono font-bold text-slate-800">{selectedCase.prescription_id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Patient ID</span>
                  <span className="font-mono font-bold text-slate-800">{selectedCase.patient_id}</span>
                </div>
              </div>

              {/* Clinical Justification & Reasons */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  System Diagnostic Rationale
                </h4>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                  {selectedCase.reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-hospital-600 font-bold">•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evaluated Rules Preview */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Evaluated Rules ({selectedCase.rules_checked.length})
                </h4>
                <RuleTimeline rulesChecked={selectedCase.rules_checked} />
              </div>

              {/* Confirmation Sign-off Console */}
              <div className="bg-hospital-50/50 p-4 rounded-xl border border-hospital-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-hospital-900">
                  <UserCheck size={16} className="text-hospital-600" />
                  <span>Clinical Pharmacist Verification & Sign-off</span>
                </div>

                <div className="text-xs text-slate-600 flex items-center justify-between">
                  <span>Sign-off Clinician: <strong>{currentUser.name}</strong> ({currentUser.role})</span>
                  <span className="font-mono text-[11px] text-slate-500">{currentUser.userId}</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Clinical Confirmation Note *
                  </label>
                  <textarea
                    rows={2}
                    value={confirmationNotes}
                    onChange={(e) => setConfirmationNotes(e.target.value)}
                    placeholder="Enter review notes and verification rationale..."
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-hospital-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <Link
                    to={`/override?id=${selectedCase.decision_id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors"
                  >
                    <KeyRound size={14} />
                    <span>Request Override</span>
                  </Link>

                  <button
                    onClick={handleConfirm}
                    disabled={submitting || !confirmationNotes.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                  >
                    <ShieldCheck size={16} />
                    <span>{submitting ? 'Signing...' : 'Confirm Decision & Dispense'}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
