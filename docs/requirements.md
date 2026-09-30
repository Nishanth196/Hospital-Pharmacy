# Requirements Specification

## 1. Problem Statement
Hospital pharmacies serving inpatient wards, operating rooms (OR), and outpatient clinics require a consistent, evidence-based mechanism to evaluate clinical, patient, and operational constraints prior to medication substitutions. Unintended drug substitutions can lead to severe adverse drug reactions (ADRs), allergy triggers, contraindications, or treatment failures.

## 2. Intended Users & Roles
- **Staff Pharmacist**: Evaluates prescription queue, runs substitution decision checklist, confirms valid recommendations.
- **Senior / Clinical Pharmacist**: Reviews escalated cases, handles complex clinical ambiguity, performs authorized decision overrides with mandatory justification.
- **Prescriber / Physician**: Reviews level-3/4 escalations requiring medical sign-off for restricted drugs.
- **System Administrator**: Monitors system metrics, rule engine performance, and audit compliance.

## 3. Functional Requirements
- **FR-1**: Execute a transparent 7-rule checklist evaluating allergy, approved alternatives, stock, patient constraints, prescriber restrictions, clinical ambiguity, and urgency.
- **FR-2**: Provide clear classification for decisions: `BLOCK`, `RECOMMEND`, `ESCALATE`, `UNAVAILABLE`.
- **FR-3**: Display rule engine evidence and rationale ("Why?") behind every decision.
- **FR-4**: Mandate human confirmation for all recommendations, high-risk cases, and overrides.
- **FR-5**: Capture non-empty override reasons and record all actions in an immutable audit log.
- **FR-6**: Support multi-tier clinical escalation (Levels 1–4) for urgent or ambiguous cases.
- **FR-7**: Support routine, urgent, and emergency patient journeys with priority visualization.

## 4. Non-Functional Requirements
- **NFR-1 (Safety)**: Unsafe false negative rate must be 0.0%.
- **NFR-2 (Performance)**: Decision engine evaluation time < 200 ms.
- **NFR-3 (Usability)**: Professional, medical-grade UI with unambiguous status colors.
- **NFR-4 (Traceability)**: 100% audit trail completion rate.

## 5. Safety Disclaimer
"Prototype for clinical decision support. Not intended for autonomous prescribing or dispensing."
