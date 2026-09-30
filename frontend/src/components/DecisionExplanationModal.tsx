import React from 'react';
import { AlternativeResult } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, XCircle, Info, FileText, CheckCircle, HelpCircle } from 'lucide-react';

interface DecisionExplanationModalProps {
  alternative: AlternativeResult | null;
  requestedMedicine: string;
  onClose: () => void;
}

export const DecisionExplanationModal: React.FC<DecisionExplanationModalProps> = ({
  alternative,
  requestedMedicine,
  onClose,
}) => {
  if (!alternative) return null;

  const getDecisionBadge = (d: string) => {
    switch (d) {
      case 'RECOMMEND':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-400" /> RECOMMENDED VALID OPTION</span>;
      case 'BLOCK':
        return <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1"><ShieldAlert className="w-4 h-4 text-rose-400" /> BLOCKED UNSAFE</span>;
      case 'ESCALATE':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1"><AlertTriangle className="w-4 h-4 text-amber-400" /> ESCALATION REQUIRED</span>;
      case 'UNAVAILABLE':
        return <span className="bg-slate-700 text-slate-300 border border-slate-600 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1"><XCircle className="w-4 h-4 text-slate-400" /> OUT OF STOCK</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-5">
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-teal-400" />
              Decision Rationale & Rules Evidence
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Transparent clinical decision breakdown for target substitute.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-sm font-bold">
            ✕
          </button>
        </div>

        {/* Alternative details header */}
        <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-mono">Substitute Candidate</p>
            <p className="text-sm font-bold text-slate-100">{alternative.alternative}</p>
            <p className="text-xs text-slate-400 mt-0.5">Original requested: <span className="text-slate-300">{requestedMedicine}</span></p>
          </div>
          <div>{getDecisionBadge(alternative.decision)}</div>
        </div>

        {/* Triggered Rules */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Triggered Rules Engine Codes</h4>
          <div className="flex flex-wrap gap-2">
            {alternative.triggered_rules.map((rule) => (
              <span key={rule} className="bg-teal-950/60 border border-teal-500/40 text-teal-300 font-mono text-xs px-2.5 py-1 rounded">
                Rule {rule}
              </span>
            ))}
          </div>
        </div>

        {/* Evidence Checklist */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Clinical & Synthetic Evidence</h4>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
            {alternative.reasons.map((r, idx) => (
              <div key={idx} className="flex items-start gap-2">
                {alternative.decision === 'BLOCK' ? (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                ) : alternative.decision === 'ESCALATE' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <span className="text-slate-200">{r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Human Review Requirement */}
        <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-lg text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-amber-200">
            <p className="font-semibold">Human Confirmation Mandate</p>
            <p className="text-amber-300/80 mt-0.5">
              This decision support tool does not dispense autonomously. All recommendations must be confirmed by a licensed pharmacist.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700 transition"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
