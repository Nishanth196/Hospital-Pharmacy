import React, { useState } from 'react';
import { approveDecision, rejectDecision, escalateDecision, overrideDecision } from '../api';
import { EvaluationResult, SubstitutionDecision } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, XCircle, ArrowUpRight, Lock } from 'lucide-react';

interface HumanReviewModalProps {
  evaluation: EvaluationResult;
  decisionId?: number;
  currentUserRole: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const HumanReviewModal: React.FC<HumanReviewModalProps> = ({
  evaluation,
  decisionId,
  currentUserRole,
  onClose,
  onSuccess,
}) => {
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'ESCALATE' | 'OVERRIDE' | null>(null);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [escalationReason, setEscalationReason] = useState<string>('Escalated for senior pharmacist or prescriber consultation.');
  const [rejectReason, setRejectReason] = useState<string>('Pharmacist deemed substitution clinically unsuitable.');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const recommended = evaluation.recommended || evaluation.alternatives[0];

  const handleAction = async () => {
    if (!decisionId) {
      setError("No decision ID recorded yet. Please run substitution evaluation first.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      if (actionType === 'APPROVE') {
        await approveDecision(decisionId, currentUserRole);
      } else if (actionType === 'REJECT') {
        await rejectDecision(decisionId, currentUserRole, rejectReason);
      } else if (actionType === 'ESCALATE') {
        await escalateDecision(decisionId, 2, currentUserRole, escalationReason);
      } else if (actionType === 'OVERRIDE') {
        if (!overrideReason || !overrideReason.trim()) {
          setError('Override requires documented justification. Override reason cannot be empty.');
          setSubmitting(false);
          return;
        }
        await overrideDecision(decisionId, overrideReason, currentUserRole);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Lock className="w-5 h-5 text-teal-400" />
              Human-in-the-Loop Clinical Verification
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Confirm, escalate, or override the system substitution decision.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-sm font-bold">
            ✕
          </button>
        </div>

        {/* Summary Card */}
        <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/80 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Requested Medicine:</span>
            <span className="font-semibold text-slate-200">{evaluation.requested_medicine}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Proposed Alternative:</span>
            <span className="font-semibold text-teal-300">{recommended?.alternative || 'None'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">System Recommendation:</span>
            <span className="font-bold text-slate-100">{recommended?.decision || 'UNAVAILABLE'}</span>
          </div>
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-500/50 p-3 rounded-lg text-xs text-rose-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Selection Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setActionType('APPROVE')}
            className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              actionType === 'APPROVE'
                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" /> Approve Substitution
          </button>

          <button
            onClick={() => setActionType('REJECT')}
            className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              actionType === 'REJECT'
                ? 'bg-rose-600/30 border-rose-500 text-rose-200'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <XCircle className="w-4 h-4 text-rose-400" /> Reject Substitution
          </button>

          <button
            onClick={() => setActionType('ESCALATE')}
            className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              actionType === 'ESCALATE'
                ? 'bg-amber-600/30 border-amber-500 text-amber-200'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Escalate Case
          </button>

          <button
            onClick={() => setActionType('OVERRIDE')}
            className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              actionType === 'OVERRIDE'
                ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-purple-400" /> Override System Block
          </button>
        </div>

        {/* Contextual Input Fields */}
        {actionType === 'OVERRIDE' && (
          <div className="space-y-1.5 bg-purple-950/20 border border-purple-500/30 p-3 rounded-lg">
            <label className="text-xs font-bold text-purple-300 block">
              Mandatory Override Justification <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="State clinical rationale (e.g. Verified trial tolerance, prescriber direct order)..."
              rows={3}
              className="w-full bg-slate-950 border border-purple-500/40 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-purple-400"
            />
            <p className="text-[11px] text-purple-400/80">
              * Override actions are permanently recorded in the immutable audit log.
            </p>
          </div>
        )}

        {actionType === 'ESCALATE' && (
          <div className="space-y-1.5 bg-amber-950/20 border border-amber-500/30 p-3 rounded-lg">
            <label className="text-xs font-bold text-amber-300 block">Escalation Reason</label>
            <input
              type="text"
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              className="w-full bg-slate-950 border border-amber-500/40 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>
        )}

        {actionType === 'REJECT' && (
          <div className="space-y-1.5 bg-rose-950/20 border border-rose-500/30 p-3 rounded-lg">
            <label className="text-xs font-bold text-rose-300 block">Rejection Reason</label>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-slate-950 border border-rose-500/40 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-rose-400"
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700 transition"
          >
            Cancel
          </button>

          <button
            disabled={!actionType || submitting}
            onClick={handleAction}
            className={`text-xs font-bold px-5 py-2 rounded-lg transition ${
              !actionType || submitting
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-600/20'
            }`}
          >
            {submitting ? 'Recording Action...' : 'Submit Verification'}
          </button>
        </div>
      </div>
    </div>
  );
};
