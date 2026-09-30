import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  FileText,
  UserCheck,
  Calendar,
  Layers,
  History,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { RuleTimeline } from '../components/RuleTimeline';
import { api } from '../services/api';
import { DecisionOutput, AuditEvent } from '../types';

export const DecisionResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [decision, setDecision] = useState<DecisionOutput | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadDecision(id);
    }
  }, [id]);

  const loadDecision = async (decId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [dec, audits] = await Promise.all([
        api.getDecisionById(decId),
        api.getAuditByDecision(decId),
      ]);
      setDecision(dec);
      setAuditEvents(audits);
    } catch (err: any) {
      setError(err.message || 'Failed to load decision details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500">
        <Clock size={32} className="mx-auto text-hospital-600 animate-spin mb-3" />
        <p className="text-xs font-semibold">Loading Decision Diagnostic Record...</p>
      </div>
    );
  }

  if (error || !decision) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto">
        <AlertTriangle size={36} className="mx-auto text-rose-500 mb-3" />
        <h3 className="text-sm font-bold text-slate-800">Decision Record Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">{error || 'Could not retrieve decision details.'}</p>
        <button
          onClick={() => navigate('/check')}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-hospital-600 text-white text-xs font-bold rounded-xl"
        >
          <ArrowLeft size={14} />
          <span>Back to Check Substitution</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button and title */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Return</span>
        </button>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Decision ID: {decision.decision_id}</span>
        </div>
      </div>

      {/* Main Diagnostic Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Substitution Decision Verdict
            </span>
            <div className="flex items-center gap-3 mt-1.5">
              <StatusBadge status={decision.decision} size="lg" />
              <StatusBadge status={decision.risk_level} size="md" showIcon={false} />
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                decision.status === 'CONFIRMED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : decision.status === 'OVERRIDDEN'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                Status: {decision.status}
              </span>
            </div>
          </div>

          <div className="text-right sm:border-l sm:pl-6 border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Turnaround Latency</span>
            <p className="text-lg font-black text-slate-800 font-mono mt-0.5">{decision.latency_ms} ms</p>
            <p className="text-[11px] text-slate-400">15-Step Pipeline</p>
          </div>
        </div>

        {/* Prescription Context Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block font-semibold">Prescription ID</span>
            <span className="font-mono font-bold text-slate-800">{decision.prescription_id}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">Patient ID</span>
            <span className="font-mono font-bold text-slate-800">{decision.patient_id}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">Prescribed Drug</span>
            <span className="font-bold text-slate-800">{decision.requested_medicine}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">Evaluated Alternative</span>
            <span className="font-bold text-slate-800">
              {decision.alternative_name || decision.alternative_id || 'Institutional Formulary Generic'}
            </span>
          </div>
        </div>

        {/* Clinical Rationale Explanation */}
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText size={16} className="text-hospital-600" />
            Decision Justification & Clinical Rationale
          </h3>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            {decision.reasons.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                <span className="text-hospital-600 font-bold">•</span>
                <span className="leading-relaxed">{r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Human Confirmation Requirement Explanation */}
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
          decision.human_confirmation_required
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          {decision.human_confirmation_required ? (
            <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <h4 className="font-bold">
              {decision.human_confirmation_required
                ? 'Human Confirmation Status: Mandatory Review Active'
                : 'Human Confirmation Status: Not Required'}
            </h4>
            <p className="mt-1 leading-relaxed opacity-90">
              {decision.decision === 'BLOCKED'
                ? 'Substitution is strictly blocked due to formulary or allergy safety contraindications. Cannot be dispensed without formal clinical override.'
                : decision.human_confirmation_required
                ? 'Case has been flagged with clinical constraints, high-impact status, or stock issues. A clinical pharmacist must sign off before dispensing.'
                : 'All formulary approval, allergy cross-reactivity, and stock checks passed. Dispense cleared.'}
            </p>
          </div>
        </div>

        {/* Evaluated Rules Breakdown */}
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Layers size={16} className="text-hospital-600" />
            Rule Evaluation Checklist ({decision.rules_checked.length} Rules Executed)
          </h3>
          <RuleTimeline rulesChecked={decision.rules_checked} />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <Link
            to="/check"
            className="text-xs font-bold text-hospital-600 hover:text-hospital-700"
          >
            ← Check Another Substitution
          </Link>

          <div className="flex items-center gap-3">
            {decision.status === 'PENDING_REVIEW' && (
              <>
                <Link
                  to={`/override?id=${decision.decision_id}`}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors"
                >
                  Clinical Override
                </Link>
                <Link
                  to={`/human-review?id=${decision.decision_id}`}
                  className="px-4 py-2 bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Confirm / Resolve Case
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Persistent Audit Events Trail for This Decision */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <History size={16} className="text-hospital-600" />
          Immutable Audit Log Trail ({auditEvents.length} Events)
        </h3>

        {auditEvents.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No persistent audit records found for this decision.</p>
        ) : (
          <div className="space-y-3 font-mono text-xs">
            {auditEvents.map((evt) => (
              <div key={evt.event_id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>{evt.event_id}</span>
                  <span>{evt.timestamp}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-hospital-700">{evt.action}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-800 font-semibold">{evt.user_id} ({evt.user_role})</span>
                </div>
                <p className="text-slate-600 font-sans text-xs mt-1">{evt.rationale}</p>
                {evt.override_reason && (
                  <div className="mt-2 p-2 bg-purple-50 text-purple-900 rounded border border-purple-200 text-xs font-sans">
                    <strong>Override Reason:</strong> {evt.override_reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
