import {
  PrescriptionPayload,
  DecisionOutput,
  AuditEvent,
  MetricsData,
  TestCaseFixture,
  EvaluationResult,
} from '../types';

const API_BASE = '/api';

export const getCurrentUser = () => {
  const saved = localStorage.getItem('hospital_pharmacy_user');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
  }
  return {
    userId: 'PHARM-101',
    name: 'Dr. Sarah Lin, PharmD',
    role: 'Clinical Pharmacist',
    department: 'Central Inpatient Pharmacy',
  };
};

const getHeaders = () => {
  const user = getCurrentUser();
  return {
    'Content-Type': 'application/json',
    'X-User-Id': user.userId,
    'X-User-Role': user.role,
  };
};

export const api = {
  // Health
  checkHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Substitution Check
  checkSubstitution: async (payload: PrescriptionPayload): Promise<DecisionOutput> => {
    const res = await fetch(`${API_BASE}/substitution/check`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Evaluation request failed' }));
      throw new Error(err.detail || 'Failed to check substitution');
    }
    return res.json();
  },

  // Inventory & Records
  getPrescriptions: async () => {
    const res = await fetch(`${API_BASE}/prescriptions?limit=50`);
    return res.json();
  },

  getPatients: async () => {
    const res = await fetch(`${API_BASE}/patients?limit=50`);
    return res.json();
  },

  getMedicines: async () => {
    const res = await fetch(`${API_BASE}/medicines?limit=50`);
    return res.json();
  },

  getAlternatives: async (medicineId?: string) => {
    const url = medicineId ? `${API_BASE}/alternatives?medicine_id=${medicineId}` : `${API_BASE}/alternatives`;
    const res = await fetch(url);
    return res.json();
  },

  getStock: async () => {
    const res = await fetch(`${API_BASE}/stock?limit=50`);
    return res.json();
  },

  // Metrics
  getMetrics: async (): Promise<MetricsData> => {
    const res = await fetch(`${API_BASE}/metrics`);
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
  },

  // Audit Logs
  getAuditLogs: async (filters?: {
    userId?: string;
    decision?: string;
    action?: string;
    prescriptionId?: string;
    decisionId?: string;
  }): Promise<AuditEvent[]> => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('user_id', filters.userId);
    if (filters?.decision) params.append('decision', filters.decision);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.prescriptionId) params.append('prescription_id', filters.prescriptionId);
    if (filters?.decisionId) params.append('decision_id', filters.decisionId);

    const res = await fetch(`${API_BASE}/audit?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  getAuditByDecision: async (decisionId: string): Promise<AuditEvent[]> => {
    const res = await fetch(`${API_BASE}/audit/${decisionId}`);
    return res.json();
  },

  // Decisions & Human In The Loop
  getPendingDecisions: async (): Promise<DecisionOutput[]> => {
    const res = await fetch(`${API_BASE}/decisions/pending`);
    return res.json();
  },

  getDecisionById: async (decisionId: string): Promise<DecisionOutput> => {
    const res = await fetch(`${API_BASE}/decisions/${decisionId}`);
    if (!res.ok) throw new Error(`Decision ${decisionId} not found`);
    return res.json();
  },

  confirmDecision: async (decisionId: string, notes?: string) => {
    const user = getCurrentUser();
    const res = await fetch(`${API_BASE}/decisions/${decisionId}/confirm`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        user_id: user.userId,
        user_role: user.role,
        confirmation_notes: notes || 'Clinically confirmed by pharmacist following standard review protocol.',
      }),
    });
    if (!res.ok) throw new Error('Failed to confirm decision');
    return res.json();
  },

  overrideDecision: async (decisionId: string, reason: string, finalDecision: string = 'APPROVED') => {
    const user = getCurrentUser();
    const res = await fetch(`${API_BASE}/decisions/${decisionId}/override`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        user_id: user.userId,
        user_role: user.role,
        override_reason: reason,
        final_decision: finalDecision,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Override rejected' }));
      throw new Error(err.detail || 'Failed to submit override');
    }
    return res.json();
  },

  // Test Cases & Evaluation
  getTestCases: async (): Promise<TestCaseFixture[]> => {
    const res = await fetch(`${API_BASE}/test-cases`);
    return res.json();
  },

  runEvaluation: async (): Promise<EvaluationResult> => {
    const res = await fetch(`${API_BASE}/evaluate`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to execute evaluation suite');
    return res.json();
  },
};
