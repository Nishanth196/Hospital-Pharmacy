import React, { useState, useEffect } from 'react';
import { fetchPrescription, fetchPatient, evaluateSubstitution } from '../api';
import { Prescription, Patient, EvaluationResult, AlternativeResult } from '../types';
import { DecisionExplanationModal } from './DecisionExplanationModal';
import { HumanReviewModal } from './HumanReviewModal';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, RefreshCw, HelpCircle, UserCheck, ArrowRight, Activity, AlertOctagon } from 'lucide-react';

interface SubstitutionChecklistProps {
  prescriptionId: number;
  currentUserRole: string;
  onBackToQueue: () => void;
}

export const SubstitutionChecklist: React.FC<SubstitutionChecklistProps> = ({
  prescriptionId,
  currentUserRole,
  onBackToQueue,
}) => {
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [evaluating, setEvaluating] = useState<boolean>(false);

  const [selectedAltForWhy, setSelectedAltForWhy] = useState<AlternativeResult | null>(null);
  const [showHumanReviewModal, setShowHumanReviewModal] = useState<boolean>(false);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const presc = await fetchPrescription(prescriptionId);
      setPrescription(presc);
      const pat = await fetchPatient(presc.patient_id);
      setPatient(pat);
      // Auto run initial evaluation
      const res = await evaluateSubstitution(presc.id);
      setEvaluation(res);
    } catch (err) {
      console.error('Failed to load prescription or evaluation details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [prescriptionId]);

  const handleRunEvaluation = async () => {
    if (!prescription) return;
    setEvaluating(true);
    try {
      const res = await evaluateSubstitution(prescription.id);
      setEvaluation(res);
    } catch (e) {
      console.error('Failed to evaluate substitution', e);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading || !prescription || !patient) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-teal-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading Clinical Case & Patient Profile...</span>
        </div>
      </div>
    );
  }

  // Derive 8 checklist check statuses from evaluation result
  const alternatives = evaluation?.alternatives || [];
  const recommended = evaluation?.recommended;

  const checkApprovedAlt = alternatives.length > 0 ? 'PASS' : 'FAIL';
  const checkAllergy = alternatives.some((a) => a.triggered_rules.includes('R001')) ? 'FAIL' : 'PASS';
  const checkClinical = alternatives.some((a) => a.triggered_rules.includes('R006')) ? 'WARNING' : 'PASS';
  const checkPatientConstraint = alternatives.some((a) => a.triggered_rules.includes('R004')) ? 'FAIL' : 'PASS';
  const checkStock = alternatives.some((a) => a.triggered_rules.includes('R003')) ? 'WARNING' : 'PASS';
  const checkPrescriber = alternatives.some((a) => a.triggered_rules.includes('R005')) ? 'WARNING' : 'PASS';
  const checkUrgency = prescription.urgency === 'EMERGENCY' ? 'WARNING' : 'PASS';
  const checkHumanConf = 'PASS'; // Human review always required by protocol

  const checklistItems = [
    { id: 1, name: '1. Approved Alternative Check', status: checkApprovedAlt, note: alternatives.length > 0 ? `${alternatives.length} substitute relationships checked` : 'No approved alternatives found' },
    { id: 2, name: '2. Patient Allergy Conflict Check', status: checkAllergy, note: checkAllergy === 'FAIL' ? 'Allergy conflict identified in candidate active ingredient' : 'No allergen match found' },
    { id: 3, name: '3. Clinical Compatibility Equivalence', status: checkClinical, note: checkClinical === 'WARNING' ? 'Therapeutic group mismatch flagged for escalation' : 'Clinical equivalence established' },
    { id: 4, name: '4. Patient Constraint Verification', status: checkPatientConstraint, note: checkPatientConstraint === 'FAIL' ? 'Renal/hepatic/pregnancy constraint violated' : 'All organ constraints satisfied' },
    { id: 5, name: '5. Stock & Inventory Availability', status: checkStock, note: checkStock === 'WARNING' ? 'One or more alternatives currently out of stock' : 'Stock available' },
    { id: 6, name: '6. Prescriber Rules & Protocols', status: checkPrescriber, note: checkPrescriber === 'WARNING' ? 'Prescriber approval required for target drug/urgency' : 'Prescriber protocol met' },
    { id: 7, name: '7. Urgency Tier Workflow Check', status: checkUrgency, note: `Tier: ${prescription.urgency}` },
    { id: 8, name: '8. Human Confirmation Mandate', status: checkHumanConf, note: 'Licensed pharmacist sign-off required' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASS':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> PASS</span>;
      case 'FAIL':
        return <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1"><XCircle className="w-3.5 h-3.5 text-rose-400" /> FAIL</span>;
      case 'WARNING':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> WARNING</span>;
      default:
        return <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-[11px] font-bold">N/A</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header / Navigation Back */}
      <div className="flex justify-between items-center bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
        <div>
          <span className="text-xs text-teal-400 font-mono">Case Reference: {prescription.prescription_code}</span>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            Medication Substitution Decision Checklist
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToQueue}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            ← Back to Queue
          </button>
          <button
            onClick={handleRunEvaluation}
            disabled={evaluating}
            className="bg-teal-600 hover:bg-teal-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-teal-600/20 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
            Evaluate Substitution
          </button>
        </div>
      </div>

      {/* Patient & Prescription Context Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Patient Profile */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-2.5">
          <div className="flex justify-between items-center border-b border-slate-700/80 pb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-teal-400" /> Patient Profile
            </span>
            <span className="text-xs font-mono font-semibold text-teal-300">{patient.patient_code}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400">Demographics:</span>
              <p className="font-semibold text-slate-200">{patient.age} yrs • {patient.gender}</p>
            </div>
            <div>
              <span className="text-slate-400">Recorded Allergies:</span>
              <p className="font-semibold text-rose-300">{patient.allergies || 'None recorded'}</p>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400">Known Conditions:</span>
              <p className="font-medium text-slate-300">{patient.conditions || 'None'}</p>
            </div>
          </div>

          {/* Clinical Constraints Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {patient.renal_constraint && (
              <span className="bg-rose-950/60 border border-rose-500/40 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded">
                Renal Constraint
              </span>
            )}
            {patient.hepatic_constraint && (
              <span className="bg-rose-950/60 border border-rose-500/40 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded">
                Hepatic Constraint
              </span>
            )}
            {patient.pregnancy_constraint && (
              <span className="bg-rose-950/60 border border-rose-500/40 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded">
                Pregnancy Constraint
              </span>
            )}
            {!patient.renal_constraint && !patient.hepatic_constraint && !patient.pregnancy_constraint && (
              <span className="bg-slate-700/50 text-slate-400 text-[10px] px-2 py-0.5 rounded">
                No organ constraints
              </span>
            )}
          </div>
        </div>

        {/* Prescription Context */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-2.5">
          <div className="flex justify-between items-center border-b border-slate-700/80 pb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-400" /> Prescribed Medicine Context
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                prescription.urgency === 'EMERGENCY'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : prescription.urgency === 'URGENT'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              Urgency: {prescription.urgency}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="col-span-2">
              <span className="text-slate-400">Requested Medicine:</span>
              <p className="font-bold text-slate-100 text-sm">{prescription.medicine_name}</p>
            </div>
            <div>
              <span className="text-slate-400">Dose & Route:</span>
              <p className="font-medium text-slate-200">{prescription.dose} • {prescription.route}</p>
            </div>
            <div>
              <span className="text-slate-400">Prescriber:</span>
              <p className="font-medium text-slate-200">{prescription.prescriber_name || 'Staff'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Screen 5: The 8-Point Substitution Checklist Grid */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          Clinical & Operational Decision Checklist (8 Protocols)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {checklistItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/80 border border-slate-700/80 p-3 rounded-lg flex flex-col justify-between space-y-2"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-200">{item.name}</span>
                {getStatusBadge(item.status)}
              </div>
              <p className="text-[11px] text-slate-400">{item.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Screen 6: Approved Alternatives Comparison Cards */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-400" />
            Approved Substitution Candidates ({alternatives.length} Evaluated)
          </h3>
          {recommended && (
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold">
              ✓ Recommended Option Identified
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {alternatives.map((alt, idx) => {
            const isRec = alt.decision === 'RECOMMEND';
            const isBlocked = alt.decision === 'BLOCK';
            const isEsc = alt.decision === 'ESCALATE';
            const isUnavail = alt.decision === 'UNAVAILABLE';

            return (
              <div
                key={idx}
                className={`bg-slate-800/70 rounded-xl p-4 border flex flex-col justify-between space-y-3 shadow-lg relative ${
                  isRec
                    ? 'border-emerald-500/60 bg-emerald-950/10 ring-1 ring-emerald-500/30'
                    : isBlocked
                    ? 'border-rose-500/40 bg-rose-950/10'
                    : isEsc
                    ? 'border-amber-500/40 bg-amber-950/10'
                    : 'border-slate-700/60'
                }`}
              >
                {/* Badge Header */}
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-mono text-slate-400">Candidate #{idx + 1}</span>
                  {isRec && (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                      ✅ VALID OPTION
                    </span>
                  )}
                  {isBlocked && (
                    <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                      🚫 BLOCKED
                    </span>
                  )}
                  {isEsc && (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                      ⚠️ ESCALATION
                    </span>
                  )}
                  {isUnavail && (
                    <span className="bg-slate-700 text-slate-300 border border-slate-600 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                      ⚠ UNAVAILABLE
                    </span>
                  )}
                </div>

                {/* Candidate Medicine Name */}
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{alt.alternative}</h4>
                  <div className="mt-1.5 space-y-1 text-xs">
                    {alt.reasons.map((r, rIdx) => (
                      <p key={rIdx} className="text-slate-300 flex items-start gap-1.5">
                        <span className="text-teal-400 font-bold">•</span> {r}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedAltForWhy(alt)}
                    className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 transition"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Why? (Rationale)
                  </button>

                  <span className="text-[10px] font-mono text-slate-400">
                    Risk: <span className={isBlocked ? 'text-rose-400' : isEsc ? 'text-amber-400' : 'text-emerald-400'}>{alt.risk_level || 'LOW'}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Human Review Bottom Action Bar */}
      <div className="bg-slate-800/90 border border-teal-500/30 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">Human-in-the-Loop Verification Required</h4>
            <p className="text-xs text-slate-400">
              Logged in as <span className="text-teal-300 font-semibold">{currentUserRole}</span>. Select action to record decision in audit log.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowHumanReviewModal(true)}
          className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-teal-600/20 transition"
        >
          Perform Human Review & Action <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Why Explanation Modal */}
      {selectedAltForWhy && (
        <DecisionExplanationModal
          alternative={selectedAltForWhy}
          requestedMedicine={prescription.medicine_name}
          onClose={() => setSelectedAltForWhy(null)}
        />
      )}

      {/* Human Review Action Modal */}
      {showHumanReviewModal && evaluation && (
        <HumanReviewModal
          evaluation={evaluation}
          decisionId={evaluation.decision_id}
          currentUserRole={currentUserRole}
          onClose={() => setShowHumanReviewModal(false)}
          onSuccess={() => {
            loadDetails();
          }}
        />
      )}
    </div>
  );
};
