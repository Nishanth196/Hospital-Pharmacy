# Patient Journeys Specification

## Patient Journey 1: Routine Outpatient (Routine Urgency)
- **Patient**: PAT1001 (Age 21, Male, No organ constraints)
- **Prescription**: RX-10001 (Amoxicillin 500mg Oral Capsule, Urgency: ROUTINE)
- **Flow**:
  1. Pharmacist opens prescription RX-10001 in queue.
  2. Runs 8-point substitution checklist.
  3. System evaluates alternatives:
     - Alternative A (Ampicillin): Out of stock (`UNAVAILABLE`).
     - Alternative B (Cefalexin): Passed all checks (`RECOMMEND`).
  4. System highlights Cefalexin as recommended option.
  5. Pharmacist clicks "Why?" to inspect rule evidence.
  6. Pharmacist confirms substitution (`APPROVED`).
  7. Audit log records action.

## Patient Journey 2: Emergency OT / Ward Case (Emergency Urgency)
- **Patient**: PAT1002 (Age 22, Female, Known Ampicillin Allergy)
- **Prescription**: RX-10002 (Morphine 10mg/ml IV Injection, Urgency: EMERGENCY)
- **Flow**:
  1. Emergency prescription enters queue with high-priority red warning indicator.
  2. System runs evaluation on Morphine -> Fentanyl substitute.
  3. Prescriber Rule R005 triggers: High-alert narcotic requiring prescriber approval.
  4. Decision state: `ESCALATE` (Level 4 Emergency Escalation).
  5. Pharmacist escalates to attending prescriber.
  6. Prescriber signs off on substitution.
  7. Decision confirmed and recorded in immutable audit log.
