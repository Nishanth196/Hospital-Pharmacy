import React, { useState } from 'react';
import { RuleEvaluation } from '../types';
import { StatusBadge } from './StatusBadge';
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronRight, ShieldAlert, FileText } from 'lucide-react';

interface RuleTimelineProps {
  rulesChecked: RuleEvaluation[];
}

export const RuleTimeline: React.FC<RuleTimelineProps> = ({ rulesChecked }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-3">
      {rulesChecked.map((rule, idx) => {
        const isFail = rule.status === 'FAIL';
        const isWarning = rule.status === 'WARNING';
        const isPass = rule.status === 'PASS';
        const isExpanded = expandedIndex === idx;

        let borderClass = 'border-slate-200 hover:border-slate-300';
        let bgClass = 'bg-white';
        let Icon = CheckCircle2;
        let iconColor = 'text-emerald-500';

        if (isFail) {
          borderClass = 'border-rose-200 bg-rose-50/30';
          Icon = XCircle;
          iconColor = 'text-rose-500';
        } else if (isWarning) {
          borderClass = 'border-amber-200 bg-amber-50/20';
          Icon = AlertTriangle;
          iconColor = 'text-amber-500';
        }

        return (
          <div
            key={`${rule.rule_id}-${idx}`}
            className={`border rounded-xl transition-all ${borderClass} ${bgClass} overflow-hidden shadow-xs`}
          >
            <div
              onClick={() => toggleExpand(idx)}
              className="p-4 flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-full ${isFail ? 'bg-rose-100' : isWarning ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                  <Icon size={18} className={iconColor} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {rule.rule_id}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-800">{rule.rule_name}</h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">{rule.explanation}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={rule.status} size="sm" />
                <StatusBadge status={rule.severity} size="sm" showIcon={false} />
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 p-1"
                  aria-label="Toggle details"
                >
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-2 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
                      <FileText size={14} className="text-hospital-600" />
                      <span>Clinical Rationale & Explanation</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{rule.explanation}</p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
                      <ShieldAlert size={14} className="text-amber-600" />
                      <span>Evaluated Clinical Evidence</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-mono text-[11px] bg-slate-50 p-2 rounded border border-slate-100">
                      {rule.evidence || 'No additional evidence recorded.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
