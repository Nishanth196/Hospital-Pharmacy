# Decision Rules Engine Specification

| Rule ID | Rule Name | Condition | Action | Risk Level |
|---------|-----------|-----------|--------|------------|
| **R001** | Allergy Conflict | Alternative active ingredient matches patient allergen | `BLOCK` | HIGH |
| **R002** | Unapproved Alternative | Alternative not in approved substitution table | `BLOCK` / `ESCALATE` | MEDIUM |
| **R003** | Stock Check | Stock quantity <= 0 | `UNAVAILABLE` | N/A |
| **R004** | Patient Constraint | Renal/hepatic/pregnancy constraint violated | `BLOCK` | HIGH |
| **R005** | Prescriber Rule | Drug requires prescriber approval for target urgency | `ESCALATE` | MEDIUM |
| **R006** | Clinical Ambiguity | Therapeutic equivalence cannot be established | `ESCALATE` | MEDIUM |
| **R007** | All Checks Passed | All clinical, stock, and prescriber checks pass | `RECOMMEND` | LOW |
