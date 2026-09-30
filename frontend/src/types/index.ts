export type DecisionType = 'APPROVED' | 'BLOCKED' | 'ESCALATED' | 'REVIEW_REQUIRED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RuleStatus = 'PASS' | 'FAIL' | 'WARNING' | 'NOT_APPLICABLE';
export type RuleSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RuleEvaluation {
  rule_id: string;
  rule_name: string;
  status: RuleStatus;
  severity: RuleSeverity;
  explanation: string;
  evidence: string;
}

export interface AlternativeMedicine {
  alternative_id: string;
  medicine_name: string;
  active_ingredient: string;
  strength: string;
  dosage_form: string;
  approved: boolean;
  high_impact: boolean;
  tier: number;
  notes?: string;
}

export interface PatientInformation {
  patient_id?: string;
  full_name?: string;
  age?: number | null;
  gender?: string;
  ward?: string;
  egfr?: number | null;
  weight_kg?: number | null;
  pregnancy_status?: boolean;
  allergies?: string[];
  conditions?: string[];
}

export interface PrescriptionPayload {
  prescription_id: string;
  patient_id: string;
  medicine_id: string;
  requested_medicine: string;
  dosage: string;
  route: string;
  frequency: string;
  ward: string;
  urgency: string;
  prescriber_id: string;
  prescriber_name?: string;
  dispense_as_written?: boolean;
  patient_information?: PatientInformation | null;
  requested_alternative_id?: string;
  requested_alternative_name?: string;
  clinical_notes?: string;
}

export interface DecisionOutput {
  decision_id: string;
  prescription_id: string;
  patient_id: string;
  requested_medicine: string;
  alternative_id?: string | null;
  alternative_name?: string | null;
  decision: DecisionType;
  risk_level: RiskLevel;
  reasons: string[];
  rules_checked: RuleEvaluation[];
  failed_rules: RuleEvaluation[];
  valid_alternatives: AlternativeMedicine[];
  human_confirmation_required: boolean;
  escalation_required: boolean;
  timestamp: string;
  latency_ms?: number;
  rules_count?: number;
  status?: string;
  confirmed_by?: string;
  override_reason?: string;
  previous_decision?: string;
  final_decision?: string;
}

export interface AuditEvent {
  event_id: string;
  timestamp: string;
  user_id: string;
  user_role: string;
  prescription_id: string;
  patient_id: string;
  alternative_id?: string;
  decision_id: string;
  action: string;
  decision: string;
  rule_ids: string[];
  rationale: string;
  override_requested: boolean;
  override_reason?: string;
  previous_decision?: string;
  final_decision?: string;
  metadata?: Record<string, any>;
}

export interface MetricsData {
  total_decisions: number;
  approved: number;
  blocked: number;
  escalated: number;
  review_required: number;
  average_latency_ms: number;
  average_rules_per_decision: number;
  escalation_rate: number;
  false_positive_escalation_rate: number;
  override_rate: number;
  human_reviews_count: number;
  overrides_count: number;
  decision_distribution: Record<string, number>;
  rule_outcomes: Record<string, number>;
}

export interface TestCaseFixture {
  test_id: string;
  name: string;
  category: string;
  description: string;
  payload: PrescriptionPayload;
  expected_decision: string;
  expected_failed_rules: string[];
  human_review_expected: boolean;
}

export interface EvaluationResult {
  total_cases: number;
  correct_decisions: number;
  incorrect_decisions: number;
  accuracy: number;
  approved: number;
  blocked: number;
  escalated: number;
  review_required: number;
  human_review_count: number;
  false_positive_escalation_rate: number;
  false_negative_approval_rate: number;
  case_results?: Array<{
    test_id: string;
    name: string;
    category: string;
    expected_decision: string;
    actual_decision: string;
    is_correct: boolean;
    risk_level: string;
    failed_rules: string[];
    human_confirmation_required: boolean;
    latency_ms: number;
    reasons: string[];
  }>;
}
