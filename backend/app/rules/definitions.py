"""Rule definitions and constants for the Hospital Pharmacy Substitution System."""

RULE_001_ID = "RULE-001"
RULE_001_NAME = "Alternative Medicine Formulary Approval"

RULE_002_ID = "RULE-002"
RULE_002_NAME = "Patient Allergy Conflict Check"

RULE_003_ID = "RULE-003"
RULE_003_NAME = "Medicine Stock Availability Verification"

RULE_004_ID = "RULE-004"
RULE_004_NAME = "Prescriber Restriction Enforcement"

RULE_005_ID = "RULE-005"
RULE_005_NAME = "High-Impact Medication Safeguard"

RULE_006_ID = "RULE-006"
RULE_006_NAME = "Clinical & Patient Information Completeness"

RULE_007_ID = "RULE-007"
RULE_007_NAME = "Patient Specific Clinical Constraints & Conflicts"

RULE_008_ID = "RULE-008"
RULE_008_NAME = "Alternative Availability & Viability Assessment"

RULE_009_ID = "RULE-009"
RULE_009_NAME = "Safe Substitution Clearance"

HIGH_IMPACT_ACTIVE_INGREDIENTS = {
    "warfarin",
    "tacrolimus",
    "digoxin",
    "lithium",
    "theophylline",
    "phenytoin",
    "cyclosporine",
    "carbamazepine",
    "methotrexate",
    "fentanyl",
}

RENALLY_CLEARED_DRUGS = {
    "metformin",
    "vancomycin",
    "gentamicin",
    "digoxin",
    "enoxaparin",
    "ciprofloxacin",
    "gabapentin",
}

ALLERGY_CROSS_REACTIVITIES = {
    "penicillin": ["amoxicillin", "ampicillin", "piperacillin", "ticarcillin", "cephalexin", "ceftriaxone"],
    "sulfa": ["sulfamethoxazole", "trimethoprim-sulfamethoxazole", "sulfasalazine"],
    "nsaid": ["ibuprofen", "naproxen", "ketorolac", "diclofenac", "aspirin"],
    "opioid": ["morphine", "codeine", "oxycodone", "hydromorphone", "fentanyl"],
}
