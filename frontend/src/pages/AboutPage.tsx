import React from 'react';
import {
  Info,
  AlertTriangle,
  ShieldCheck,
  Cpu,
  Database,
  FileCode2,
  CheckCircle2,
  BookOpen,
  GitBranch,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Info size={24} className="text-hospital-600" />
          About & System Limitations
        </h1>
        <p className="text-xs text-slate-500">
          Architecture documentation, clinical boundaries, and software prototype specifications.
        </p>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm uppercase tracking-wider">
          <AlertTriangle size={20} className="text-amber-600" />
          <span>Academic & Software Prototype Disclaimer</span>
        </div>
        <p className="text-xs text-amber-900 leading-relaxed font-semibold">
          "This prototype is for academic and software demonstration purposes only and is not a clinical decision-making system."
        </p>
        <p className="text-xs text-amber-800 leading-relaxed">
          The system operates exclusively on synthetic demo data (patients, prescriptions, and formulary tables). It has not been clinically validated in real-world healthcare environments and should never be used as a substitute for licensed medical judgment, professional clinical pharmacy consultation, or official hospital formulary committees.
        </p>
      </div>

      {/* Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="p-2.5 rounded-lg bg-hospital-50 text-hospital-600 w-fit">
            <Cpu size={20} />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Deterministic Rule Engine</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Eliminates non-deterministic LLM hallucinations in critical medical decisions. Every evaluation follows an explicit 15-step pipeline with 9 rules.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 w-fit">
            <Database size={20} />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Immutable Audit Ledger</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Append-only SQLite persistence for every recommendation, human confirmation, escalation, and override. Silent overrides are strictly forbidden.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 w-fit">
            <ShieldCheck size={20} />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Human-in-the-Loop</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Mandatory clinical sign-off for narrow therapeutic index drugs, conflicting organ constraints, or off-formulary stock interventions.
          </p>
        </div>
      </div>

      {/* Deterministic Rules Reference */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <BookOpen size={18} className="text-hospital-600" />
          Formal Rule Engine Hierarchy (RULE-001 to RULE-009)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <strong className="font-mono text-slate-800">RULE-001</strong>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">BLOCKED</span>
            </div>
            <p className="text-slate-600">Alternative medicine is not approved on the hospital formulary.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <strong className="font-mono text-slate-800">RULE-002</strong>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">BLOCKED</span>
            </div>
            <p className="text-slate-600">Alternative conflicts with documented patient allergy or cross-reactivity class.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <strong className="font-mono text-slate-800">RULE-003</strong>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">ESCALATED</span>
            </div>
            <p className="text-slate-600">Alternative medicine is out of stock across hospital depots.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <strong className="font-mono text-slate-800">RULE-004</strong>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">ESCALATED</span>
            </div>
            <p className="text-slate-600">Prescriber restriction or 'Dispense As Written' prevents automatic interchange.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <strong className="font-mono text-slate-800">RULE-005</strong>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">REVIEW_REQUIRED</span>
            </div>
            <p className="text-slate-600">High-impact / narrow therapeutic index drug requires clinical pharmacist review.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <strong className="font-mono text-slate-800">RULE-006</strong>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">ESCALATED</span>
            </div>
            <p className="text-slate-600">Important clinical or patient information (e.g. eGFR, age) is missing.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <strong className="font-mono text-slate-800">RULE-007</strong>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">REVIEW_REQUIRED</span>
            </div>
            <p className="text-slate-600">Multiple conflicting constraints (e.g. renal impairment & Beers criteria).</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <strong className="font-mono text-slate-800">RULE-008</strong>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">ESCALATED</span>
            </div>
            <p className="text-slate-600">No valid, safe, or viable alternative remains available on the formulary.</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 md:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <strong className="font-mono text-slate-800">RULE-009</strong>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">APPROVED</span>
            </div>
            <p className="text-slate-600">Valid approved alternative + no clinical conflicts + verified stock available.</p>
          </div>
        </div>
      </div>

      {/* System Boundaries & Known Limitations */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Boundaries & Known Technical Limitations</h3>
        <ul className="space-y-2 text-xs text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-hospital-600 font-bold">•</span>
            <span><strong>Scope of Knowledge:</strong> The allergy cross-reactivity matrix in this prototype is simplified for demonstration (Penicillins, Sulfas, NSAIDs, Opioids). In production, this must integrate with clinical ontologies such as RxNorm and SNOMED-CT.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-hospital-600 font-bold">•</span>
            <span><strong>EHR Integration:</strong> The system currently uses an internal SQLite database rather than external HL7 FHIR interfaces.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-hospital-600 font-bold">•</span>
            <span><strong>Pharmacokinetics:</strong> Renal clearance checks utilize threshold cutoffs (eGFR &lt; 30 and &lt; 50 mL/min) rather than continuous Cockcroft-Gault / CKD-EPI pharmacokinetic dosing curves.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-hospital-600 font-bold">•</span>
            <span><strong>Human Oversight:</strong> The system is designed strictly to assist, never replace, the final dispensing approval of licensed pharmacists.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
