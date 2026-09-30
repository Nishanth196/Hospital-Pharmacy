export interface Patient {
  id: number;
  patient_code: string;
  age: number;
  gender: string;
  allergies?: string;
  conditions?: string;
  renal_constraint: boolean;
  hepatic_constraint: boolean;
  pregnancy_constraint: boolean;
  other_constraints?: string;
}

export interface Medicine {
  id: number;
  medicine_code: string;
  medicine_name: string;
  active_ingredient?: string;
  strength?: string;
  dosage_form?: string;
  route?: string;
  therapeutic_group?: string;
}

export interface Prescription {
  id: number;
  prescription_code: string;
  patient_id: number;
  medicine_id: number;
  medicine_name: string;
  dose?: string;
  route?: string;
  frequency?: string;
  urgency: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  prescriber_name?: string;
  created_at?: string;
}

export interface AlternativeResult {
  alternative: string;
  decision: 'BLOCK' | 'RECOMMEND' | 'ESCALATE' | 'UNAVAILABLE';
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH';
  reasons: string[];
  triggered_rules: string[];
  human_confirmation_required: boolean;
  escalation_required: boolean;
}

export interface EvaluationResult {
  prescription_id: number;
  requested_medicine: string;
  alternatives: AlternativeResult[];
  recommended?: AlternativeResult;
  decision_id?: number;
}

export interface SubstitutionDecision {
  id: number;
  prescription_id: number;
  requested_medicine?: string;
  alternative_medicine?: string;
  system_decision: string;
  risk_level?: string;
  reasons?: string;
  triggered_rules?: string;
  human_confirmation_required: boolean;
  reviewer?: string;
  human_decision?: string;
  override: boolean;
  override_reason?: string;
  escalation_level?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AuditLog {
  id: number;
  decision_id: number;
  action: string;
  performed_by: string;
  reason?: string;
  timestamp: string;
}

export interface EscalationCase {
  decision_id: number;
  prescription_id: number;
  prescription_code: string;
  urgency: string;
  requested_medicine: string;
  alternative_medicine?: string;
  system_decision: string;
  escalation_level: number;
  reasons?: string;
  status: string;
  reviewer: string;
  created_at: string;
}
