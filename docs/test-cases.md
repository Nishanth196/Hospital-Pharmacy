# Test Cases & Validation Scenarios

| Test Case | Scenario Description | Expected Outcome | Triggered Rule |
|-----------|----------------------|------------------|----------------|
| **TC-A** | Valid substitution with available stock | `RECOMMEND` | R007 |
| **TC-B** | Candidate active ingredient matches patient allergy | `BLOCK` | R001 |
| **TC-C** | Approved alternative has zero stock | `UNAVAILABLE` | R003 |
| **TC-D** | Patient has renal / hepatic / pregnancy constraint | `BLOCK` | R004 |
| **TC-E** | High-alert narcotic requiring prescriber sign-off | `ESCALATE` | R005 |
| **TC-F** | Therapeutic group mismatch / unmapped equivalence | `ESCALATE` | R006 |
| **TC-G** | Urgent outpatient case | Priority escalation badge | R005 / R007 |
| **TC-H** | Emergency OT / ward case | Level 4 Emergency Escalation | R005 |
| **TC-I** | Multiple alternatives (Alt A blocked, Alt B out of stock, Alt C valid) | Show all three; highlight Alt C | R001, R003, R007 |
| **TC-J** | No approved alternative available | `UNAVAILABLE` / `ESCALATE` | R002 |
