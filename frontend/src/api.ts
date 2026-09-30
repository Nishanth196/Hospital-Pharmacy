import { Patient, Prescription, Medicine, EvaluationResult, SubstitutionDecision, AuditLog, EscalationCase } from './types';

const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchPatients(): Promise<Patient[]> {
  const res = await fetch(`${API_BASE}/patients`);
  return res.json();
}

export async function fetchPrescriptions(): Promise<Prescription[]> {
  const res = await fetch(`${API_BASE}/prescriptions`);
  return res.json();
}

export async function fetchPrescription(id: number): Promise<Prescription> {
  const res = await fetch(`${API_BASE}/prescriptions/${id}`);
  return res.json();
}

export async function fetchPatient(id: number): Promise<Patient> {
  const res = await fetch(`${API_BASE}/patients/${id}`);
  return res.json();
}

export async function evaluateSubstitution(prescriptionId: number): Promise<EvaluationResult> {
  const res = await fetch(`${API_BASE}/substitution/evaluate?prescription_id=${prescriptionId}`, {
    method: 'POST',
  });
  return res.json();
}

export async function fetchDecisions(): Promise<SubstitutionDecision[]> {
  const res = await fetch(`${API_BASE}/decisions`);
  return res.json();
}

export async function approveDecision(decisionId: number, reviewer: string = 'Pharmacist') {
  const res = await fetch(`${API_BASE}/decisions/${decisionId}/approve?reviewer=${encodeURIComponent(reviewer)}`, {
    method: 'POST',
  });
  return res.json();
}

export async function rejectDecision(decisionId: number, reviewer: string = 'Pharmacist', reason: string = 'Rejected by pharmacist') {
  const res = await fetch(`${API_BASE}/decisions/${decisionId}/reject?reviewer=${encodeURIComponent(reviewer)}&reason=${encodeURIComponent(reason)}`, {
    method: 'POST',
  });
  return res.json();
}

export async function escalateDecision(decisionId: number, level: number = 2, reviewer: string = 'Pharmacist', reason: string = 'Escalated for higher review') {
  const res = await fetch(`${API_BASE}/decisions/${decisionId}/escalate?level=${level}&reviewer=${encodeURIComponent(reviewer)}&reason=${encodeURIComponent(reason)}`, {
    method: 'POST',
  });
  return res.json();
}

export async function overrideDecision(decisionId: number, overrideReason: string, reviewer: string = 'Senior Pharmacist') {
  const res = await fetch(`${API_BASE}/decisions/${decisionId}/override?reviewer=${encodeURIComponent(reviewer)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ override_reason: overrideReason }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Override failed');
  }
  return res.json();
}

export async function fetchEscalations(): Promise<EscalationCase[]> {
  const res = await fetch(`${API_BASE}/escalations`);
  return res.json();
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const res = await fetch(`${API_BASE}/audit/`);
  return res.json();
}

export async function fetchMetrics() {
  const res = await fetch(`${API_BASE}/metrics/`);
  return res.json();
}

export async function fetchValidationData() {
  const res = await fetch(`${API_BASE}/validation/`);
  return res.json();
}
