import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  User,
  Pill,
  Building,
  AlertOctagon,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { RuleTimeline } from '../components/RuleTimeline';
import { api } from '../services/api';
import { PrescriptionPayload, DecisionOutput, AlternativeMedicine } from '../types';

export const CheckSubstitutionPage: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<DecisionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<PrescriptionPayload>({
    prescription_id: 'RX-DEMO-01',
    patient_id: 'PAT-1003',
    medicine_id: 'MED-001',
    requested_medicine: 'Amoxicillin 500mg Oral',
    dosage: '500mg',
    route: 'Oral',
    frequency: 'TID',
    ward: 'General Ward A',
    urgency: 'ROUTINE',
    prescriber_id: 'DOC-301',
    prescriber_name: 'Dr. Angela Foster',
    dispense_as_written: false,
    requested_alternative_id: 'ALT-001',
    requested_alternative_name: 'Ampicillin 500mg Oral',
    clinical_notes: 'Standard respiratory infection prescription',
    patient_information: {
      patient_id: 'PAT-1003',
      full_name: 'John Williams',
      age: 45,
      gender: 'Male',
      ward: 'General Ward A',
      egfr: 95.0,
      weight_kg: 76.0,
      pregnancy_status: false,
      allergies: ['sulfa'],
      conditions: [],
    },
  });

  const [rawAllergies, setRawAllergies] = useState<string>('sulfa');

  useEffect(() => {
    loadReferenceData();
  }, []);

  const loadReferenceData = async () => {
    setLoading(true);
    try {
      const [pats, rxs, alts] = await Promise.all([
        api.getPatients(),
        api.getPrescriptions(),
        api.getAlternatives(),
      ]);
      setPatients(pats);
      setPrescriptions(rxs);
      setAlternatives(alts);
    } catch (err) {
      console.error('Failed to load reference inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patId: string) => {
    const selected = patients.find((p) => p.patient_id === patId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        patient_id: selected.patient_id,
        ward: selected.ward || prev.ward,
        patient_information: {
          patient_id: selected.patient_id,
          full_name: selected.full_name,
          age: selected.age,
          gender: selected.gender,
          ward: selected.ward,
          egfr: selected.egfr,
          weight_kg: selected.weight_kg,
          pregnancy_status: selected.pregnancy_status,
          allergies: prev.patient_information?.allergies || [],
          conditions: selected.conditions || [],
        },
      }));
    }
  };

  const handlePrescriptionSelect = (rxId: string) => {
    const selected = prescriptions.find((r) => r.prescription_id === rxId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        prescription_id: selected.prescription_id,
        patient_id: selected.patient_id,
        medicine_id: selected.medicine_id,
        requested_medicine: selected.requested_medicine,
        dosage: selected.dosage,
        route: selected.route,
        frequency: selected.frequency,
        ward: selected.ward,
        urgency: selected.urgency,
        prescriber_id: selected.prescriber_id,
        prescriber_name: selected.prescriber_name,
        dispense_as_written: selected.dispense_as_written,
        clinical_notes: selected.clinical_notes || '',
      }));
      handlePatientSelect(selected.patient_id);
    }
  };

  const handleAlternativeSelect = (altId: string) => {
    const selected = alternatives.find((a) => a.alternative_id === altId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        requested_alternative_id: selected.alternative_id,
        requested_alternative_name: selected.medicine_name,
      }));
    }
  };

  // Quick Preset Scenarios
  const loadPreset = (presetName: string) => {
    setResult(null);
    setError(null);
    if (presetName === 'safe') {
      setFormData({
        prescription_id: 'RX-SAFE-01',
        patient_id: 'PAT-1003',
        medicine_id: 'MED-001',
        requested_medicine: 'Amoxicillin 500mg Oral',
        dosage: '500mg',
        route: 'Oral',
        frequency: 'TID',
        ward: 'General Ward A',
        urgency: 'ROUTINE',
        prescriber_id: 'DOC-301',
        prescriber_name: 'Dr. Angela Foster',
        dispense_as_written: false,
        requested_alternative_id: 'ALT-001',
        requested_alternative_name: 'Ampicillin 500mg Oral',
        clinical_notes: 'Safe routine inpatient substitution',
        patient_information: {
          patient_id: 'PAT-1003',
          full_name: 'John Williams',
          age: 45,
          gender: 'Male',
          ward: 'General Ward A',
          egfr: 95.0,
          weight_kg: 76.0,
          pregnancy_status: false,
          allergies: ['sulfa'],
          conditions: [],
        },
      });
      setRawAllergies('sulfa');
    } else if (presetName === 'allergy') {
      setFormData({
        prescription_id: 'RX-ALLERGY-01',
        patient_id: 'PAT-1002',
        medicine_id: 'MED-001',
        requested_medicine: 'Amoxicillin 500mg Oral',
        dosage: '500mg',
        route: 'Oral',
        frequency: 'TID',
        ward: 'General Ward A',
        urgency: 'ROUTINE',
        prescriber_id: 'DOC-306',
        prescriber_name: 'Dr. Nathan Cole',
        dispense_as_written: false,
        requested_alternative_id: 'ALT-001',
        requested_alternative_name: 'Ampicillin 500mg Oral',
        clinical_notes: 'Patient with penicillin anaphylaxis history',
        patient_information: {
          patient_id: 'PAT-1002',
          full_name: 'Mary Johnson',
          age: 38,
          gender: 'Female',
          ward: 'General Ward A',
          egfr: 88.0,
          weight_kg: 64.0,
          pregnancy_status: false,
          allergies: ['penicillin'],
          conditions: [],
        },
      });
      setRawAllergies('penicillin');
    } else if (presetName === 'high-impact') {
      setFormData({
        prescription_id: 'RX-HI-01',
        patient_id: 'PAT-1009',
        medicine_id: 'MED-006',
        requested_medicine: 'Tacrolimus 1mg Oral',
        dosage: '1mg',
        route: 'Oral',
        frequency: 'BID',
        ward: 'Oncology Ward',
        urgency: 'ROUTINE',
        prescriber_id: 'DOC-312',
        prescriber_name: 'Dr. Simon Pegg',
        dispense_as_written: false,
        requested_alternative_id: 'ALT-007',
        requested_alternative_name: 'Tacrolimus Generic 1mg',
        clinical_notes: 'Immunosuppressive narrow therapeutic index medication',
        patient_information: {
          patient_id: 'PAT-1009',
          full_name: 'Elizabeth Davis',
          age: 52,
          gender: 'Female',
          ward: 'Oncology Ward',
          egfr: 70.0,
          weight_kg: 60.0,
          pregnancy_status: false,
          allergies: [],
          conditions: ['Kidney Transplant Recipient'],
        },
      });
      setRawAllergies('');
    } else if (presetName === 'oos') {
      setFormData({
        prescription_id: 'RX-OOS-01',
        patient_id: 'PAT-1005',
        medicine_id: 'MED-002',
        requested_medicine: 'Ciprofloxacin 500mg Oral',
        dosage: '500mg',
        route: 'Oral',
        frequency: 'BID',
        ward: 'General Ward A',
        urgency: 'ROUTINE',
        prescriber_id: 'DOC-310',
        prescriber_name: 'Dr. Emily Watson',
        dispense_as_written: false,
        requested_alternative_id: 'ALT-018',
        requested_alternative_name: 'Moxifloxacin (Out of Stock Alternative)',
        clinical_notes: 'Stock is completely depleted',
        patient_information: {
          patient_id: 'PAT-1005',
          full_name: 'Robert Jones',
          age: 63,
          gender: 'Male',
          ward: 'General Ward A',
          egfr: 75.0,
          weight_kg: 78.0,
          pregnancy_status: false,
          allergies: [],
          conditions: [],
        },
      });
      setRawAllergies('');
    } else if (presetName === 'daw') {
      setFormData({
        prescription_id: 'RX-DAW-01',
        patient_id: 'PAT-1007',
        medicine_id: 'MED-003',
        requested_medicine: 'Warfarin 5mg Oral',
        dosage: '5mg',
        route: 'Oral',
        frequency: 'Daily',
        ward: 'Cardiology Ward',
        urgency: 'ROUTINE',
        prescriber_id: 'DOC-201',
        prescriber_name: 'Dr. Robert Vance',
        dispense_as_written: true,
        requested_alternative_id: 'ALT-004',
        requested_alternative_name: 'Warfarin Sodium (Generic) 5mg',
        clinical_notes: 'Dispense As Written order by specialist',
        patient_information: {
          patient_id: 'PAT-1007',
          full_name: 'Michael Miller',
          age: 68,
          gender: 'Male',
          ward: 'Cardiology Ward',
          egfr: 65.0,
          weight_kg: 82.0,
          pregnancy_status: false,
          allergies: [],
          conditions: ['Atrial Fibrillation'],
        },
      });
      setRawAllergies('');
    } else if (presetName === 'missing') {
      setFormData({
        prescription_id: 'RX-MISSING-01',
        patient_id: 'PAT-MISSING',
        medicine_id: 'MED-004',
        requested_medicine: 'Metformin 850mg Oral',
        dosage: '850mg',
        route: 'Oral',
        frequency: 'BID',
        ward: 'Outpatient Clinic',
        urgency: 'ROUTINE',
        prescriber_id: 'DOC-314',
        prescriber_name: 'Dr. Henry Cavill',
        dispense_as_written: false,
        requested_alternative_id: 'ALT-005',
        requested_alternative_name: 'Metformin ER 500mg Oral',
        clinical_notes: 'Missing baseline renal function and age',
        patient_information: {
          patient_id: 'PAT-MISSING',
          full_name: 'Unverified Outpatient',
          age: null,
          gender: 'Unknown',
          ward: 'Outpatient Clinic',
          egfr: null,
          weight_kg: null,
          pregnancy_status: false,
          allergies: [],
          conditions: [],
        },
      });
      setRawAllergies('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvaluating(true);
    setError(null);
    setResult(null);

    // Parse allergies list
    const allergiesList = rawAllergies
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload: PrescriptionPayload = {
      ...formData,
      patient_information: {
        ...formData.patient_information,
        allergies: allergiesList,
      },
    };

    try {
      const evaluation = await api.checkSubstitution(payload);
      setResult(evaluation);
    } catch (err: any) {
      setError(err.message || 'Error occurred while checking substitution');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Zap size={24} className="text-hospital-600" />
            Check Medication Substitution
          </h1>
          <p className="text-xs text-slate-500">
            Submit a proposed interchange to evaluate through the deterministic 15-step safety pipeline.
          </p>
        </div>

        {/* Quick Demo Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Presets:
          </span>
          <button
            type="button"
            onClick={() => loadPreset('safe')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            Safe Case
          </button>
          <button
            type="button"
            onClick={() => loadPreset('allergy')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
          >
            Allergy Conflict
          </button>
          <button
            type="button"
            onClick={() => loadPreset('high-impact')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
          >
            High Impact
          </button>
          <button
            type="button"
            onClick={() => loadPreset('oos')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            Stock Out
          </button>
          <button
            type="button"
            onClick={() => loadPreset('daw')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 transition-colors"
          >
            DAW Policy
          </button>
          <button
            type="button"
            onClick={() => loadPreset('missing')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
          >
            Missing Info
          </button>
        </div>
      </div>

      {/* Main Grid: Form and Live Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quick Load Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Load Saved Prescription
                </label>
                <select
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-hospital-500"
                  onChange={(e) => handlePrescriptionSelect(e.target.value)}
                  value={formData.prescription_id}
                >
                  <option value="">-- Choose Existing Rx --</option>
                  {prescriptions.map((r) => (
                    <option key={r.prescription_id} value={r.prescription_id}>
                      {r.prescription_id}: {r.requested_medicine} ({r.ward})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Load Patient Profile
                </label>
                <select
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-hospital-500"
                  onChange={(e) => handlePatientSelect(e.target.value)}
                  value={formData.patient_id}
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.patient_id} value={p.patient_id}>
                      {p.patient_id}: {p.full_name} ({p.ward})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Core Identification */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Prescription ID *</label>
                <input
                  type="text"
                  required
                  value={formData.prescription_id}
                  onChange={(e) => setFormData({ ...formData, prescription_id: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Patient ID *</label>
                <input
                  type="text"
                  required
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Prescriber ID *</label>
                <input
                  type="text"
                  required
                  value={formData.prescriber_id}
                  onChange={(e) => setFormData({ ...formData, prescriber_id: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>
            </div>

            {/* Medicine and Alternative Interchange */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <Pill size={14} className="text-hospital-600" />
                  Prescribed Medicine *
                </label>
                <input
                  type="text"
                  required
                  value={formData.requested_medicine}
                  onChange={(e) => setFormData({ ...formData, requested_medicine: e.target.value })}
                  placeholder="e.g. Amoxicillin 500mg Oral"
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <Sparkles size={14} className="text-emerald-600" />
                  Proposed Alternative *
                </label>
                <input
                  type="text"
                  required
                  value={formData.requested_alternative_name || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requested_alternative_name: e.target.value,
                    })
                  }
                  placeholder="e.g. Ampicillin 500mg Oral"
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 font-semibold"
                />
              </div>
            </div>

            {/* Dosage, Route, Frequency */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dosage *</label>
                <input
                  type="text"
                  required
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Route *</label>
                <input
                  type="text"
                  required
                  value={formData.route}
                  onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Frequency *</label>
                <input
                  type="text"
                  required
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                />
              </div>
            </div>

            {/* Ward, Urgency, Dispense As Written */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ward *</label>
                <input
                  type="text"
                  required
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Urgency</label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                >
                  <option value="ROUTINE">ROUTINE</option>
                  <option value="URGENT">URGENT</option>
                  <option value="STAT">STAT / EMERGENCY</option>
                </select>
              </div>
              <div className="pt-4">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.dispense_as_written || false}
                    onChange={(e) => setFormData({ ...formData, dispense_as_written: e.target.checked })}
                    className="rounded border-slate-300 text-hospital-600 focus:ring-hospital-500 w-4 h-4"
                  />
                  <span>Dispense As Written (DAW)</span>
                </label>
              </div>
            </div>

            {/* Patient Clinical Characteristics */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User size={14} className="text-slate-500" />
                Patient Clinical Attributes
              </h4>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Age</label>
                  <input
                    type="number"
                    value={formData.patient_information?.age ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        patient_information: {
                          ...formData.patient_information,
                          age: e.target.value ? parseInt(e.target.value) : null,
                        },
                      })
                    }
                    placeholder="e.g. 52"
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">eGFR (mL/min)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.patient_information?.egfr ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        patient_information: {
                          ...formData.patient_information,
                          egfr: e.target.value ? parseFloat(e.target.value) : null,
                        },
                      })
                    }
                    placeholder="e.g. 85.0"
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.patient_information?.weight_kg ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        patient_information: {
                          ...formData.patient_information,
                          weight_kg: e.target.value ? parseFloat(e.target.value) : null,
                        },
                      })
                    }
                    placeholder="e.g. 70"
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Known Allergies (comma-separated active ingredients or drug classes)
                </label>
                <input
                  type="text"
                  value={rawAllergies}
                  onChange={(e) => setRawAllergies(e.target.value)}
                  placeholder="e.g. penicillin, sulfa, morphine"
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 font-mono"
                />
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertOctagon size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => loadPreset('safe')}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
              >
                <RotateCcw size={14} />
                <span>Reset to Default</span>
              </button>

              <button
                type="submit"
                disabled={evaluating}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                <Zap size={16} />
                <span>{evaluating ? 'Evaluating Deterministic Rules...' : 'Check Substitution'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Diagnostic Decision Output (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {!result && !evaluating && (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400">
              <FileQuestion size={36} className="mx-auto mb-2 text-slate-300" />
              <h3 className="text-sm font-bold text-slate-700">Awaiting Evaluation</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Fill in the substitution details or select a preset scenario, then click "Check Substitution".
              </p>
            </div>
          )}

          {evaluating && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 animate-pulse">
              <Zap size={32} className="mx-auto text-hospital-600 mb-2 animate-bounce" />
              <h4 className="text-sm font-bold text-slate-800">Executing 15-Step Rule Pipeline</h4>
              <p className="text-xs text-slate-500 mt-1">Cross-referencing formulary, allergies, and organ clearance...</p>
            </div>
          )}

          {result && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              {/* Decision Header Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Evaluation Verdict</span>
                  <div className="mt-1">
                    <StatusBadge status={result.decision} size="lg" />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Risk Level</span>
                  <div className="mt-1">
                    <StatusBadge status={result.risk_level} size="md" showIcon={false} />
                  </div>
                </div>
              </div>

              {/* Rationale & Reasons */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Clinical Rationale</h4>
                <ul className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {result.reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-hospital-600 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Human In The Loop Requirement Notice */}
              <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                result.human_confirmation_required
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                {result.human_confirmation_required ? (
                  <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold">
                    {result.human_confirmation_required
                      ? 'Human Confirmation Required'
                      : 'Automated Clearance Approved'}
                  </span>
                  <p className="text-[11px] mt-0.5 opacity-90">
                    {result.human_confirmation_required
                      ? 'This substitution cannot be silently dispensed. A clinical pharmacist must sign off or perform an override.'
                      : 'Substitution complies with institutional guidelines; no manual override required.'}
                  </p>
                </div>
              </div>

              {/* Evaluated Rules Breakdown */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Rules Evaluated ({result.rules_checked.length})
                  </h4>
                  <span className="text-[11px] font-medium text-slate-500">Latency: {result.latency_ms}ms</span>
                </div>
                <RuleTimeline rulesChecked={result.rules_checked} />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate(`/result/${result.decision_id}`)}
                  className="w-full text-center py-2 px-3 text-xs font-bold text-hospital-700 bg-hospital-50 hover:bg-hospital-100 border border-hospital-200 rounded-xl transition-colors"
                >
                  View Full Audit Diagnostic
                </button>

                {result.human_confirmation_required && (
                  <button
                    type="button"
                    onClick={() => navigate(`/human-review?id=${result.decision_id}`)}
                    className="w-full text-center py-2 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                  >
                    Open Review Queue
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
