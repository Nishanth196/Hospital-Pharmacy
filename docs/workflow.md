# Clinical & Operational Workflow

## 1. Decision Paths

```
Prescription Entry 
   ├──> Run 7-Check Rule Engine
   │      ├── Allergy / Organ Constraint Violation? ──> BLOCK (Red) ──> Pharmacist Reject or Override (With Mandatory Justification)
   │      ├── Prescriber Restriction / Ambiguity? ───> ESCALATE (Amber) ──> Level 1-4 Escalation Queue
   │      └── All Safety Checks Passed? ────────────> RECOMMEND (Green) ──> Human Pharmacist Confirmation ──> Complete
```

## 2. Human Review Points
1. **Valid Recommendation Confirmation**: Pharmacist verifies and approves substitute.
2. **Escalation Review**: Senior Pharmacist / Prescriber accepts or adjusts recommendation.
3. **Block Override**: Senior Pharmacist provides documented clinical justification before overriding a BLOCK.
