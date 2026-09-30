import sys
import json
import random
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.database.connection import engine, Base, SessionLocal
from backend.app.models.entities import (
    Patient,
    Prescription,
    Medicine,
    AlternativeMedicineRecord,
    StockRecord,
    AllergyRecord,
    PrescriberRule,
)

SEED = 42
random.seed(SEED)

DATA_SYNTHETIC_DIR = Path(__file__).resolve().parent.parent / "data" / "synthetic"
DATA_SYNTHETIC_DIR.mkdir(parents=True, exist_ok=True)


def generate_synthetic_dataset():
    # -------------------------------------------------------------
    # 1. 20 Synthetic Medicines
    # -------------------------------------------------------------
    medicines_data = [
        {"medicine_id": "MED-001", "name": "Amoxicillin 500mg Oral", "active_ingredient": "amoxicillin", "strength": "500mg", "dosage_form": "Capsule", "high_impact": False, "formulary_status": "FORMULARY"},
        {"medicine_id": "MED-002", "name": "Ciprofloxacin 500mg Oral", "active_ingredient": "ciprofloxacin", "strength": "500mg", "dosage_form": "Tablet", "high_impact": False, "formulary_status": "FORMULARY"},
        {"medicine_id": "MED-003", "name": "Warfarin 5mg Oral", "active_ingredient": "warfarin", "strength": "5mg", "dosage_form": "Tablet", "high_impact": True, "formulary_status": "RESTRICTED"},
        {"medicine_id": "MED-004", "name": "Metformin 850mg Oral", "active_ingredient": "metformin", "strength": "850mg", "dosage_form": "Tablet", "high_impact": False, "formulary_status": "FORMULARY"},
        {"medicine_id": "MED-005", "name": "Digoxin 0.25mg Oral", "active_ingredient": "digoxin", "strength": "0.25mg", "dosage_form": "Tablet", "high_impact": True, "formulary_status": "RESTRICTED"},
        {"medicine_id": "MED-006", "name": "Tacrolimus 1mg Oral", "active_ingredient": "tacrolimus", "strength": "1mg", "dosage_form": "Capsule", "high_impact": True, "formulary_status": "RESTRICTED"},
        {"medicine_id": "MED-007", "name": "Lisinopril 10mg Oral", "active_ingredient": "lisinopril", "strength": "10mg", "dosage_form": "Tablet", "high_impact": False, "formulary_status": "FORMULARY"},
        {"medicine_id": "MED-008", "name": "Atorvastatin 20mg Oral", "active_ingredient": "atorvastatin", "strength": "20mg", "dosage_form": "Tablet", "high_impact": False, "formulary_status": "FORMULARY"},
        {"medicine_id": "MED-009", "name": "Furosemide 40mg IV", "active_ingredient": "furosemide", "strength": "40mg", "dosage_form": "Injection", "high_impact": False, "formulary_status": "FORMULARY"},
        {"medicine_id": "MED-010", "name": "Morphine 10mg/mL IV", "active_ingredient": "morphine", "strength": "10mg/mL", "dosage_form": "Injection", "high_impact": True, "formulary_status": "RESTRICTED"},
        {"medicine_id": "MED-011", "name": "Ondansetron 4mg IV", "active_ingredient": "ondansetron", "strength": "4mg", "dosage_form": "Injection", "high_impact": False, "formulary_status": "FORMULARY"},
        {"medicine_id": "MED-012", "name": "Pantoprazole 40mg IV", "active_ingredient": "pantoprazole", "strength": "40mg", "dosage_form": "Injection", "high_impact": False, "formulary_status": "FORMULARY"},
        {"medicine_id": "MED-013", "name": "Vancomycin 1g IV", "active_ingredient": "vancomycin", "strength": "1g", "dosage_form": "Injection", "high_impact": True, "formulary_status": "RESTRICTED"},
        {"medicine_id": "MED-014", "name": "Enoxaparin 40mg SC", "active_ingredient": "enoxaparin", "strength": "40mg", "dosage_form": "Syringe", "high_impact": False, "formulary_status": "FORMULARY"},
        {"medicine_id": "MED-015", "name": "Ibuprofen 400mg Oral", "active_ingredient": "ibuprofen", "strength": "400mg", "dosage_form": "Tablet", "high_impact": False, "formulary_status": "FORMULARY"},
        {"medicine_id": "MED-016", "name": "Lithium Carbonate 300mg Oral", "active_ingredient": "lithium", "strength": "300mg", "dosage_form": "Tablet", "high_impact": True, "formulary_status": "RESTRICTED"},
        {"medicine_id": "MED-017", "name": "Phenytoin 100mg Oral", "active_ingredient": "phenytoin", "strength": "100mg", "dosage_form": "Capsule", "high_impact": True, "formulary_status": "RESTRICTED"},
        {"medicine_id": "MED-018", "name": "Levothyroxine 50mcg Oral", "active_ingredient": "levothyroxine", "strength": "50mcg", "dosage_form": "Tablet", "high_impact": False, "formulary_status": "FORMULARY"},
        {"medicine_id": "MED-019", "name": "Ceftriaxone 1g IV", "active_ingredient": "ceftriaxone", "strength": "1g", "dosage_form": "Injection", "high_impact": False, "formulary_status": "FORMULARY"},
        {"medicine_id": "MED-020", "name": "Trimethoprim-Sulfamethoxazole Oral", "active_ingredient": "trimethoprim-sulfamethoxazole", "strength": "800/160mg", "dosage_form": "Tablet", "high_impact": False, "formulary_status": "FORMULARY"},
    ]

    # -------------------------------------------------------------
    # 2. 20 Approved and Evaluated Alternatives
    # -------------------------------------------------------------
    alternatives_data = [
        {"alternative_id": "ALT-001", "original_medicine_id": "MED-001", "medicine_name": "Ampicillin 500mg Oral", "active_ingredient": "ampicillin", "strength": "500mg", "dosage_form": "Capsule", "approved": True, "high_impact": False, "tier": 1, "notes": "Standard aminopenicillin equivalent"},
        {"alternative_id": "ALT-002", "original_medicine_id": "MED-001", "medicine_name": "Cephalexin 500mg Oral", "active_ingredient": "cephalexin", "strength": "500mg", "dosage_form": "Capsule", "approved": True, "high_impact": False, "tier": 2, "notes": "First gen cephalosporin alternative"},
        {"alternative_id": "ALT-003", "original_medicine_id": "MED-002", "medicine_name": "Levofloxacin 500mg Oral", "active_ingredient": "levofloxacin", "strength": "500mg", "dosage_form": "Tablet", "approved": True, "high_impact": False, "tier": 1, "notes": "Respiratory fluoroquinolone formulary substitution"},
        {"alternative_id": "ALT-004", "original_medicine_id": "MED-003", "medicine_name": "Warfarin Sodium (Generic) 5mg", "active_ingredient": "warfarin", "strength": "5mg", "dosage_form": "Tablet", "approved": True, "high_impact": True, "tier": 1, "notes": "Narrow therapeutic index; INR follow-up required"},
        {"alternative_id": "ALT-005", "original_medicine_id": "MED-004", "medicine_name": "Metformin ER 500mg Oral", "active_ingredient": "metformin", "strength": "500mg", "dosage_form": "Tablet ER", "approved": True, "high_impact": False, "tier": 1, "notes": "Extended release bioequivalent"},
        {"alternative_id": "ALT-006", "original_medicine_id": "MED-005", "medicine_name": "Digoxin (Generic Tier-1) 0.25mg", "active_ingredient": "digoxin", "strength": "0.25mg", "dosage_form": "Tablet", "approved": True, "high_impact": True, "tier": 1, "notes": "Mandatory serum digoxin check"},
        {"alternative_id": "ALT-007", "original_medicine_id": "MED-006", "medicine_name": "Tacrolimus Generic 1mg", "active_ingredient": "tacrolimus", "strength": "1mg", "dosage_form": "Capsule", "approved": True, "high_impact": True, "tier": 1, "notes": "Immunosuppressant - trough level tracking mandatory"},
        {"alternative_id": "ALT-008", "original_medicine_id": "MED-007", "medicine_name": "Enalapril 10mg Oral", "active_ingredient": "enalapril", "strength": "10mg", "dosage_form": "Tablet", "approved": True, "high_impact": False, "tier": 1, "notes": "Formulary ACE inhibitor interchange"},
        {"alternative_id": "ALT-009", "original_medicine_id": "MED-008", "medicine_name": "Rosuvastatin 10mg Oral", "active_ingredient": "rosuvastatin", "strength": "10mg", "dosage_form": "Tablet", "approved": True, "high_impact": False, "tier": 1, "notes": "High potency statin substitution"},
        {"alternative_id": "ALT-010", "original_medicine_id": "MED-009", "medicine_name": "Torsemide 20mg IV", "active_ingredient": "torsemide", "strength": "20mg", "dosage_form": "Injection", "approved": True, "high_impact": False, "tier": 1, "notes": "Loop diuretic equivalent"},
        {"alternative_id": "ALT-011", "original_medicine_id": "MED-010", "medicine_name": "Hydromorphone 2mg IV", "active_ingredient": "hydromorphone", "strength": "2mg", "dosage_form": "Injection", "approved": True, "high_impact": True, "tier": 1, "notes": "Opioid equianalgesic switch"},
        {"alternative_id": "ALT-012", "original_medicine_id": "MED-011", "medicine_name": "Granisetron 1mg IV", "active_ingredient": "granisetron", "strength": "1mg", "dosage_form": "Injection", "approved": True, "high_impact": False, "tier": 1, "notes": "5-HT3 antagonist interchange"},
        {"alternative_id": "ALT-013", "original_medicine_id": "MED-012", "medicine_name": "Esomeprazole 40mg IV", "active_ingredient": "esomeprazole", "strength": "40mg", "dosage_form": "Injection", "approved": True, "high_impact": False, "tier": 1, "notes": "PPI equivalent"},
        {"alternative_id": "ALT-014", "original_medicine_id": "MED-013", "medicine_name": "Daptomycin 500mg IV", "active_ingredient": "daptomycin", "strength": "500mg", "dosage_form": "Injection", "approved": True, "high_impact": True, "tier": 2, "notes": "Restricted ID approval required"},
        {"alternative_id": "ALT-015", "original_medicine_id": "MED-014", "medicine_name": "Heparin Sodium 5000 units SC", "active_ingredient": "heparin", "strength": "5000 units", "dosage_form": "Injection", "approved": True, "high_impact": True, "tier": 1, "notes": "Unfractionated heparin alternative"},
        {"alternative_id": "ALT-016", "original_medicine_id": "MED-015", "medicine_name": "Naproxen 500mg Oral", "active_ingredient": "naproxen", "strength": "500mg", "dosage_form": "Tablet", "approved": True, "high_impact": False, "tier": 1, "notes": "NSAID class substitution"},
        {"alternative_id": "ALT-017", "original_medicine_id": "MED-001", "medicine_name": "Unapproved Experimental Generic Penicillin-X", "active_ingredient": "penicillin-x", "strength": "500mg", "dosage_form": "Capsule", "approved": False, "high_impact": False, "tier": 3, "notes": "Not approved on formulary"},
        {"alternative_id": "ALT-018", "original_medicine_id": "MED-002", "medicine_name": "Moxifloxacin (Out of Stock Alternative)", "active_ingredient": "moxifloxacin", "strength": "400mg", "dosage_form": "Tablet", "approved": True, "high_impact": False, "tier": 1, "notes": "Inventory count is zero"},
        {"alternative_id": "ALT-019", "original_medicine_id": "MED-019", "medicine_name": "Cefepime 1g IV", "active_ingredient": "cefepime", "strength": "1g", "dosage_form": "Injection", "approved": True, "high_impact": False, "tier": 1, "notes": "4th gen cephalosporin alternative"},
        {"alternative_id": "ALT-020", "original_medicine_id": "MED-020", "medicine_name": "Doxycycline 100mg Oral", "active_ingredient": "doxycycline", "strength": "100mg", "dosage_form": "Capsule", "approved": True, "high_impact": False, "tier": 1, "notes": "Non-sulfa oral antibiotic option"},
    ]

    # -------------------------------------------------------------
    # 3. 20 Synthetic Patients
    # -------------------------------------------------------------
    first_names = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]
    wards = ["Cardiology Ward", "ICU", "General Ward A", "Surgery Suite / OR", "Pediatric Ward", "Oncology Ward", "Orthopedic Ward", "Emergency Dept", "Outpatient Clinic", "Telemetry Ward"]

    patients_data = []
    for i in range(20):
        pid = f"PAT-{1001 + i}"
        name = f"{first_names[i]} {last_names[i]}"
        age = random.choice([24, 38, 45, 52, 63, 68, 74, 82, 16, 31]) if i != 6 else None  # patient 6 has missing age
        gender = "Female" if i % 2 == 1 else "Male"
        ward = wards[i % len(wards)]
        # Patient 1 has low egfr (severe renal), Patient 6 has None
        if i == 1:
            egfr = 22.0
        elif i == 6:
            egfr = None
        elif i == 11:
            egfr = 42.0
        else:
            egfr = float(random.choice([65.0, 78.0, 92.0, 105.0, 88.0]))
        weight = float(random.randint(52, 95))
        preg = (gender == "Female" and age and 20 <= age <= 40 and i % 3 == 0)

        conditions = []
        if egfr and egfr < 30:
            conditions.append("Severe Chronic Kidney Disease")
        if age and age >= 65:
            conditions.append("Hypertension")
        if preg:
            conditions.append("Pregnancy 2nd Trimester")

        patients_data.append({
            "patient_id": pid,
            "full_name": name,
            "age": age,
            "gender": gender,
            "ward": ward,
            "egfr": egfr,
            "weight_kg": weight,
            "pregnancy_status": preg,
            "conditions": conditions
        })

    # -------------------------------------------------------------
    # 4. 20 Allergy Records
    # -------------------------------------------------------------
    allergies_data = [
        {"allergy_id": "ALL-001", "patient_id": "PAT-1002", "allergen": "penicillin", "allergen_type": "DRUG_CLASS", "severity": "CRITICAL", "reaction": "Anaphylaxis and bronchospasm"},
        {"allergy_id": "ALL-002", "patient_id": "PAT-1003", "allergen": "sulfa", "allergen_type": "DRUG_CLASS", "severity": "HIGH", "reaction": "Severe cutaneous drug eruption"},
        {"allergy_id": "ALL-003", "patient_id": "PAT-1004", "allergen": "ibuprofen", "allergen_type": "ACTIVE_INGREDIENT", "severity": "HIGH", "reaction": "Angioedema"},
        {"allergy_id": "ALL-004", "patient_id": "PAT-1005", "allergen": "morphine", "allergen_type": "ACTIVE_INGREDIENT", "severity": "HIGH", "reaction": "Severe hypotension and urticaria"},
        {"allergy_id": "ALL-005", "patient_id": "PAT-1008", "allergen": "ampicillin", "allergen_type": "ACTIVE_INGREDIENT", "severity": "CRITICAL", "reaction": "Respiratory distress"},
        {"allergy_id": "ALL-006", "patient_id": "PAT-1009", "allergen": "ciprofloxacin", "allergen_type": "ACTIVE_INGREDIENT", "severity": "MODERATE", "reaction": "Hives and nausea"},
        {"allergy_id": "ALL-007", "patient_id": "PAT-1010", "allergen": "naproxen", "allergen_type": "ACTIVE_INGREDIENT", "severity": "HIGH", "reaction": "Bronchospasm"},
        {"allergy_id": "ALL-008", "patient_id": "PAT-1011", "allergen": "cephalexin", "allergen_type": "ACTIVE_INGREDIENT", "severity": "CRITICAL", "reaction": "Anaphylactic shock"},
        {"allergy_id": "ALL-009", "patient_id": "PAT-1012", "allergen": "levofloxacin", "allergen_type": "ACTIVE_INGREDIENT", "severity": "MODERATE", "reaction": "Rash and pruritus"},
        {"allergy_id": "ALL-010", "patient_id": "PAT-1013", "allergen": "trimethoprim-sulfamethoxazole", "allergen_type": "ACTIVE_INGREDIENT", "severity": "CRITICAL", "reaction": "Stevens-Johnson Syndrome history"},
        {"allergy_id": "ALL-011", "patient_id": "PAT-1014", "allergen": "codeine", "allergen_type": "ACTIVE_INGREDIENT", "severity": "HIGH", "reaction": "Laryngeal edema"},
        {"allergy_id": "ALL-012", "patient_id": "PAT-1015", "allergen": "aspirin", "allergen_type": "ACTIVE_INGREDIENT", "severity": "HIGH", "reaction": "Asthmatic exacerbation"},
        {"allergy_id": "ALL-013", "patient_id": "PAT-1016", "allergen": "amoxicillin", "allergen_type": "ACTIVE_INGREDIENT", "severity": "CRITICAL", "reaction": "Severe anaphylaxis"},
        {"allergy_id": "ALL-014", "patient_id": "PAT-1017", "allergen": "cefepime", "allergen_type": "ACTIVE_INGREDIENT", "severity": "HIGH", "reaction": "Generalized urticaria"},
        {"allergy_id": "ALL-015", "patient_id": "PAT-1018", "allergen": "heparin", "allergen_type": "ACTIVE_INGREDIENT", "severity": "CRITICAL", "reaction": "Heparin-induced thrombocytopenia (HIT)"},
        {"allergy_id": "ALL-016", "patient_id": "PAT-1019", "allergen": "vancomycin", "allergen_type": "ACTIVE_INGREDIENT", "severity": "MODERATE", "reaction": "Severe flushing and hypotension"},
        {"allergy_id": "ALL-017", "patient_id": "PAT-1020", "allergen": "doxycycline", "allergen_type": "ACTIVE_INGREDIENT", "severity": "MILD", "reaction": "Photosensitivity and rash"},
        {"allergy_id": "ALL-018", "patient_id": "PAT-1001", "allergen": "penicillin", "allergen_type": "DRUG_CLASS", "severity": "CRITICAL", "reaction": "Anaphylaxis"},
        {"allergy_id": "ALL-019", "patient_id": "PAT-1006", "allergen": "iodinated contrast", "allergen_type": "AGENT", "severity": "MODERATE", "reaction": "Flushing"},
        {"allergy_id": "ALL-020", "patient_id": "PAT-1007", "allergen": "sulfa", "allergen_type": "DRUG_CLASS", "severity": "HIGH", "reaction": "Erythema multiforme"},
    ]

    # -------------------------------------------------------------
    # 5. 20 Stock Records
    # -------------------------------------------------------------
    stock_data = [
        {"stock_id": "STK-001", "medicine_id": "ALT-001", "medicine_name": "Ampicillin 500mg Oral", "ward": "General Ward A", "quantity": 120, "in_stock": True},
        {"stock_id": "STK-002", "medicine_id": "ALT-002", "medicine_name": "Cephalexin 500mg Oral", "ward": "General Ward A", "quantity": 85, "in_stock": True},
        {"stock_id": "STK-003", "medicine_id": "ALT-003", "medicine_name": "Levofloxacin 500mg Oral", "ward": "Cardiology Ward", "quantity": 40, "in_stock": True},
        {"stock_id": "STK-004", "medicine_id": "ALT-004", "medicine_name": "Warfarin Sodium (Generic) 5mg", "ward": "Cardiology Ward", "quantity": 60, "in_stock": True},
        {"stock_id": "STK-005", "medicine_id": "ALT-005", "medicine_name": "Metformin ER 500mg Oral", "ward": "Outpatient Clinic", "quantity": 200, "in_stock": True},
        {"stock_id": "STK-006", "medicine_id": "ALT-006", "medicine_name": "Digoxin (Generic Tier-1) 0.25mg", "ward": "Cardiology Ward", "quantity": 30, "in_stock": True},
        {"stock_id": "STK-007", "medicine_id": "ALT-007", "medicine_name": "Tacrolimus Generic 1mg", "ward": "Oncology Ward", "quantity": 15, "in_stock": True},
        {"stock_id": "STK-008", "medicine_id": "ALT-008", "medicine_name": "Enalapril 10mg Oral", "ward": "General Ward A", "quantity": 90, "in_stock": True},
        {"stock_id": "STK-009", "medicine_id": "ALT-009", "medicine_name": "Rosuvastatin 10mg Oral", "ward": "Cardiology Ward", "quantity": 75, "in_stock": True},
        {"stock_id": "STK-010", "medicine_id": "ALT-010", "medicine_name": "Torsemide 20mg IV", "ward": "ICU", "quantity": 50, "in_stock": True},
        {"stock_id": "STK-011", "medicine_id": "ALT-011", "medicine_name": "Hydromorphone 2mg IV", "ward": "Surgery Suite / OR", "quantity": 25, "in_stock": True},
        {"stock_id": "STK-012", "medicine_id": "ALT-012", "medicine_name": "Granisetron 1mg IV", "ward": "Oncology Ward", "quantity": 45, "in_stock": True},
        {"stock_id": "STK-013", "medicine_id": "ALT-013", "medicine_name": "Esomeprazole 40mg IV", "ward": "ICU", "quantity": 110, "in_stock": True},
        {"stock_id": "STK-014", "medicine_id": "ALT-014", "medicine_name": "Daptomycin 500mg IV", "ward": "ICU", "quantity": 18, "in_stock": True},
        {"stock_id": "STK-015", "medicine_id": "ALT-015", "medicine_name": "Heparin Sodium 5000 units SC", "ward": "Surgery Suite / OR", "quantity": 70, "in_stock": True},
        {"stock_id": "STK-016", "medicine_id": "ALT-016", "medicine_name": "Naproxen 500mg Oral", "ward": "Orthopedic Ward", "quantity": 140, "in_stock": True},
        {"stock_id": "STK-017", "medicine_id": "ALT-017", "medicine_name": "Unapproved Experimental Generic Penicillin-X", "ward": "Central Depot", "quantity": 0, "in_stock": False},
        {"stock_id": "STK-018", "medicine_id": "ALT-018", "medicine_name": "Moxifloxacin (Out of Stock Alternative)", "ward": "General Ward A", "quantity": 0, "in_stock": False},
        {"stock_id": "STK-019", "medicine_id": "ALT-019", "medicine_name": "Cefepime 1g IV", "ward": "Emergency Dept", "quantity": 35, "in_stock": True},
        {"stock_id": "STK-020", "medicine_id": "ALT-020", "medicine_name": "Doxycycline 100mg Oral", "ward": "Outpatient Clinic", "quantity": 80, "in_stock": True},
    ]

    # -------------------------------------------------------------
    # 6. 15 Prescriber Restriction Rules
    # -------------------------------------------------------------
    prescriber_rules_data = [
        {"rule_id": "PR-001", "prescriber_id": "DOC-201", "medicine_id": "MED-003", "restriction_type": "NO_SUBSTITUTION", "justification": "Patient stabilized on specific brand Warfarin; tight INR window"},
        {"rule_id": "PR-002", "prescriber_id": "DOC-202", "medicine_id": "MED-006", "restriction_type": "NO_SUBSTITUTION", "justification": "Post-renal transplant graft protocol requires exact brand"},
        {"rule_id": "PR-003", "prescriber_id": "DOC-203", "medicine_id": "MED-010", "restriction_type": "SENIOR_APPROVAL_REQUIRED", "justification": "Restricted narcotic protocol"},
        {"rule_id": "PR-004", "prescriber_id": "DOC-204", "medicine_id": "MED-013", "restriction_type": "SENIOR_APPROVAL_REQUIRED", "justification": "Antimicrobial stewardship restricted agent"},
        {"rule_id": "PR-005", "prescriber_id": "DOC-205", "medicine_id": "MED-016", "restriction_type": "NO_SUBSTITUTION", "justification": "Bipolar mood stabilizer narrow range"},
        {"rule_id": "PR-006", "prescriber_id": "DOC-206", "medicine_id": "MED-017", "restriction_type": "NO_SUBSTITUTION", "justification": "Non-linear seizure control kinetics"},
        {"rule_id": "PR-007", "prescriber_id": "DOC-207", "medicine_id": "MED-005", "restriction_type": "RESTRICTED_TO_TIER_1", "justification": "Strict cardiac glycoside bioequivalence requirement"},
        {"rule_id": "PR-008", "prescriber_id": "DOC-208", "medicine_id": "MED-002", "restriction_type": "RESTRICTED_TO_TIER_1", "justification": "Restricted fluoroquinolone stewardship"},
        {"rule_id": "PR-009", "prescriber_id": "DOC-209", "medicine_id": "MED-007", "restriction_type": "RESTRICTED_TO_TIER_1", "justification": "Cardiology formulary guideline"},
        {"rule_id": "PR-010", "prescriber_id": "DOC-210", "medicine_id": "MED-015", "restriction_type": "SENIOR_APPROVAL_REQUIRED", "justification": "High GI bleeding risk in elderly cohort"},
        {"rule_id": "PR-011", "prescriber_id": "DOC-211", "medicine_id": "MED-014", "restriction_type": "NO_SUBSTITUTION", "justification": "Fixed post-PCI anticoagulation protocol"},
        {"rule_id": "PR-012", "prescriber_id": "DOC-212", "medicine_id": "MED-019", "restriction_type": "SENIOR_APPROVAL_REQUIRED", "justification": "Sepsis committee stewardship rule"},
        {"rule_id": "PR-013", "prescriber_id": "DOC-213", "medicine_id": "MED-008", "restriction_type": "RESTRICTED_TO_TIER_1", "justification": "Lipid clinic secondary prevention target"},
        {"rule_id": "PR-014", "prescriber_id": "DOC-214", "medicine_id": "MED-009", "restriction_type": "RESTRICTED_TO_TIER_1", "justification": "Acute decompensated heart failure guideline"},
        {"rule_id": "PR-015", "prescriber_id": "DOC-215", "medicine_id": "MED-011", "restriction_type": "RESTRICTED_TO_TIER_1", "justification": "Post-chemotherapy emetic prophylaxis"},
    ]

    # -------------------------------------------------------------
    # 7. 30 Synthetic Prescriptions
    # -------------------------------------------------------------
    prescriptions_data = [
        # Routine Ward Safe cases
        {"prescription_id": "RX-1001", "patient_id": "PAT-1003", "medicine_id": "MED-001", "requested_medicine": "Amoxicillin 500mg Oral", "dosage": "500mg", "route": "Oral", "frequency": "TID", "ward": "General Ward A", "urgency": "ROUTINE", "prescriber_id": "DOC-301", "prescriber_name": "Dr. Angela Foster", "dispense_as_written": False, "clinical_notes": "Mild respiratory infection"},
        {"prescription_id": "RX-1002", "patient_id": "PAT-1005", "medicine_id": "MED-007", "requested_medicine": "Lisinopril 10mg Oral", "dosage": "10mg", "route": "Oral", "frequency": "Daily", "ward": "Cardiology Ward", "urgency": "ROUTINE", "prescriber_id": "DOC-302", "prescriber_name": "Dr. Mark Davis", "dispense_as_written": False, "clinical_notes": "Essential hypertension"},
        {"prescription_id": "RX-1003", "patient_id": "PAT-1004", "medicine_id": "MED-008", "requested_medicine": "Atorvastatin 20mg Oral", "dosage": "20mg", "route": "Oral", "frequency": "At Bedtime", "ward": "General Ward A", "urgency": "ROUTINE", "prescriber_id": "DOC-303", "prescriber_name": "Dr. Rachel Scott", "dispense_as_written": False, "clinical_notes": "Hyperlipidemia maintenance"},
        {"prescription_id": "RX-1004", "patient_id": "PAT-1010", "medicine_id": "MED-012", "requested_medicine": "Pantoprazole 40mg IV", "dosage": "40mg", "route": "IV", "frequency": "Daily", "ward": "Surgery Suite / OR", "urgency": "ROUTINE", "prescriber_id": "DOC-304", "prescriber_name": "Dr. Brian Lee", "dispense_as_written": False, "clinical_notes": "Stress ulcer prophylaxis"},
        {"prescription_id": "RX-1005", "patient_id": "PAT-1015", "medicine_id": "MED-011", "requested_medicine": "Ondansetron 4mg IV", "dosage": "4mg", "route": "IV", "frequency": "Q8H PRN", "ward": "Oncology Ward", "urgency": "ROUTINE", "prescriber_id": "DOC-305", "prescriber_name": "Dr. Catherine Howard", "dispense_as_written": False, "clinical_notes": "Nausea prevention post-chemo"},
        # Allergy Conflict cases
        {"prescription_id": "RX-1006", "patient_id": "PAT-1002", "medicine_id": "MED-001", "requested_medicine": "Amoxicillin 500mg Oral", "dosage": "500mg", "route": "Oral", "frequency": "TID", "ward": "General Ward A", "urgency": "ROUTINE", "prescriber_id": "DOC-306", "prescriber_name": "Dr. Nathan Cole", "dispense_as_written": False, "clinical_notes": "Patient with penicillin allergy record"},
        {"prescription_id": "RX-1007", "patient_id": "PAT-1008", "medicine_id": "MED-001", "requested_medicine": "Amoxicillin 500mg Oral", "dosage": "500mg", "route": "Oral", "frequency": "TID", "ward": "General Ward A", "urgency": "ROUTINE", "prescriber_id": "DOC-307", "prescriber_name": "Dr. Gregory White", "dispense_as_written": False, "clinical_notes": "Allergy check test fixture"},
        {"prescription_id": "RX-1008", "patient_id": "PAT-1004", "medicine_id": "MED-015", "requested_medicine": "Ibuprofen 400mg Oral", "dosage": "400mg", "route": "Oral", "frequency": "TID PRN", "ward": "Orthopedic Ward", "urgency": "ROUTINE", "prescriber_id": "DOC-308", "prescriber_name": "Dr. Laura Adams", "dispense_as_written": False, "clinical_notes": "NSAID allergy conflict case"},
        # Unapproved Alternative cases
        {"prescription_id": "RX-1009", "patient_id": "PAT-1003", "medicine_id": "MED-001", "requested_medicine": "Amoxicillin 500mg Oral", "dosage": "500mg", "route": "Oral", "frequency": "TID", "ward": "General Ward A", "urgency": "ROUTINE", "prescriber_id": "DOC-309", "prescriber_name": "Dr. Victor Vance", "dispense_as_written": False, "clinical_notes": "Unapproved generic requested"},
        # Out of Stock case
        {"prescription_id": "RX-1010", "patient_id": "PAT-1005", "medicine_id": "MED-002", "requested_medicine": "Ciprofloxacin 500mg Oral", "dosage": "500mg", "route": "Oral", "frequency": "BID", "ward": "General Ward A", "urgency": "ROUTINE", "prescriber_id": "DOC-310", "prescriber_name": "Dr. Emily Watson", "dispense_as_written": False, "clinical_notes": "Stock depletion scenario"},
        # Prescriber Restriction case
        {"prescription_id": "RX-1011", "patient_id": "PAT-1007", "medicine_id": "MED-003", "requested_medicine": "Warfarin 5mg Oral", "dosage": "5mg", "route": "Oral", "frequency": "Daily", "ward": "Cardiology Ward", "urgency": "ROUTINE", "prescriber_id": "DOC-201", "prescriber_name": "Dr. Robert Vance (Specialist)", "dispense_as_written": True, "clinical_notes": "Dispense As Written order"},
        {"prescription_id": "RX-1012", "patient_id": "PAT-1009", "medicine_id": "MED-006", "requested_medicine": "Tacrolimus 1mg Oral", "dosage": "1mg", "route": "Oral", "frequency": "BID", "ward": "Oncology Ward", "urgency": "ROUTINE", "prescriber_id": "DOC-202", "prescriber_name": "Dr. Sandra Bullock (Transplant)", "dispense_as_written": True, "clinical_notes": "Post-transplant protocol"},
        # High-Impact Narrow Therapeutic Index
        {"prescription_id": "RX-1013", "patient_id": "PAT-1011", "medicine_id": "MED-005", "requested_medicine": "Digoxin 0.25mg Oral", "dosage": "0.25mg", "route": "Oral", "frequency": "Daily", "ward": "Cardiology Ward", "urgency": "ROUTINE", "prescriber_id": "DOC-311", "prescriber_name": "Dr. Ethan Hunt", "dispense_as_written": False, "clinical_notes": "Atrial fibrillation rate control"},
        {"prescription_id": "RX-1014", "patient_id": "PAT-1012", "medicine_id": "MED-016", "requested_medicine": "Lithium Carbonate 300mg Oral", "dosage": "300mg", "route": "Oral", "frequency": "BID", "ward": "General Ward A", "urgency": "ROUTINE", "prescriber_id": "DOC-312", "prescriber_name": "Dr. Simon Pegg", "dispense_as_written": False, "clinical_notes": "Mood stabilization maintenance"},
        {"prescription_id": "RX-1015", "patient_id": "PAT-1014", "medicine_id": "MED-017", "requested_medicine": "Phenytoin 100mg Oral", "dosage": "100mg", "route": "Oral", "frequency": "TID", "ward": "Telemetry Ward", "urgency": "ROUTINE", "prescriber_id": "DOC-313", "prescriber_name": "Dr. Rebecca Ferguson", "dispense_as_written": False, "clinical_notes": "Seizure prevention"},
        # Missing Critical Information
        {"prescription_id": "RX-1016", "patient_id": "PAT-1007", "medicine_id": "MED-004", "requested_medicine": "Metformin 850mg Oral", "dosage": "850mg", "route": "Oral", "frequency": "BID", "ward": "Outpatient Clinic", "urgency": "ROUTINE", "prescriber_id": "DOC-314", "prescriber_name": "Dr. Henry Cavill", "dispense_as_written": False, "clinical_notes": "Patient profile missing eGFR"},
        # Urgent ICU & OR cases
        {"prescription_id": "RX-1017", "patient_id": "PAT-1013", "medicine_id": "MED-009", "requested_medicine": "Furosemide 40mg IV", "dosage": "40mg", "route": "IV", "frequency": "STAT", "ward": "ICU", "urgency": "STAT", "prescriber_id": "DOC-315", "prescriber_name": "Dr. Jeremy Renner", "dispense_as_written": False, "clinical_notes": "Pulmonary edema in ICU"},
        {"prescription_id": "RX-1018", "patient_id": "PAT-1016", "medicine_id": "MED-010", "requested_medicine": "Morphine 10mg/mL IV", "dosage": "5mg", "route": "IV", "frequency": "STAT", "ward": "Surgery Suite / OR", "urgency": "STAT", "prescriber_id": "DOC-316", "prescriber_name": "Dr. Vanessa Kirby", "dispense_as_written": False, "clinical_notes": "Intraoperative analgesia"},
        {"prescription_id": "RX-1019", "patient_id": "PAT-1017", "medicine_id": "MED-013", "requested_medicine": "Vancomycin 1g IV", "dosage": "1g", "route": "IV", "frequency": "Q12H", "ward": "ICU", "urgency": "URGENT", "prescriber_id": "DOC-317", "prescriber_name": "Dr. Sean Harris", "dispense_as_written": False, "clinical_notes": "Empiric sepsis coverage"},
        {"prescription_id": "RX-1020", "patient_id": "PAT-1018", "medicine_id": "MED-014", "requested_medicine": "Enoxaparin 40mg SC", "dosage": "40mg", "route": "SC", "frequency": "Daily", "ward": "Orthopedic Ward", "urgency": "ROUTINE", "prescriber_id": "DOC-318", "prescriber_name": "Dr. Alec Baldwin", "dispense_as_written": False, "clinical_notes": "DVT prophylaxis post-op"},
        # Additional Diverse Wards & Combinations
        {"prescription_id": "RX-1021", "patient_id": "PAT-1019", "medicine_id": "MED-019", "requested_medicine": "Ceftriaxone 1g IV", "dosage": "1g", "route": "IV", "frequency": "Daily", "ward": "Emergency Dept", "urgency": "URGENT", "prescriber_id": "DOC-319", "prescriber_name": "Dr. Michelle Monaghan", "dispense_as_written": False, "clinical_notes": "Community acquired pneumonia"},
        {"prescription_id": "RX-1022", "patient_id": "PAT-1020", "medicine_id": "MED-020", "requested_medicine": "Trimethoprim-Sulfamethoxazole Oral", "dosage": "800/160mg", "route": "Oral", "frequency": "BID", "ward": "Outpatient Clinic", "urgency": "ROUTINE", "prescriber_id": "DOC-320", "prescriber_name": "Dr. Ving Rhames", "dispense_as_written": False, "clinical_notes": "Uncomplicated cystitis"},
        {"prescription_id": "RX-1023", "patient_id": "PAT-1001", "medicine_id": "MED-002", "requested_medicine": "Ciprofloxacin 500mg Oral", "dosage": "500mg", "route": "Oral", "frequency": "BID", "ward": "General Ward A", "urgency": "ROUTINE", "prescriber_id": "DOC-321", "prescriber_name": "Dr. Simon Callow", "dispense_as_written": False, "clinical_notes": "Complicated UTI"},
        {"prescription_id": "RX-1024", "patient_id": "PAT-1002", "medicine_id": "MED-007", "requested_medicine": "Lisinopril 10mg Oral", "dosage": "10mg", "route": "Oral", "frequency": "Daily", "ward": "Cardiology Ward", "urgency": "ROUTINE", "prescriber_id": "DOC-322", "prescriber_name": "Dr. Patrick Stewart", "dispense_as_written": False, "clinical_notes": "Congestive heart failure"},
        {"prescription_id": "RX-1025", "patient_id": "PAT-1003", "medicine_id": "MED-008", "requested_medicine": "Atorvastatin 20mg Oral", "dosage": "20mg", "route": "Oral", "frequency": "At Bedtime", "ward": "General Ward A", "urgency": "ROUTINE", "prescriber_id": "DOC-323", "prescriber_name": "Dr. Ian McKellen", "dispense_as_written": False, "clinical_notes": "Primary prevention"},
        {"prescription_id": "RX-1026", "patient_id": "PAT-1005", "medicine_id": "MED-009", "requested_medicine": "Furosemide 40mg IV", "dosage": "40mg", "route": "IV", "frequency": "Daily", "ward": "Cardiology Ward", "urgency": "ROUTINE", "prescriber_id": "DOC-324", "prescriber_name": "Dr. Maggie Smith", "dispense_as_written": False, "clinical_notes": "Volume overload"},
        {"prescription_id": "RX-1027", "patient_id": "PAT-1006", "medicine_id": "MED-011", "requested_medicine": "Ondansetron 4mg IV", "dosage": "4mg", "route": "IV", "frequency": "PRN", "ward": "Oncology Ward", "urgency": "ROUTINE", "prescriber_id": "DOC-325", "prescriber_name": "Dr. Judi Dench", "dispense_as_written": False, "clinical_notes": "Anti-emetic therapy"},
        {"prescription_id": "RX-1028", "patient_id": "PAT-1008", "medicine_id": "MED-012", "requested_medicine": "Pantoprazole 40mg IV", "dosage": "40mg", "route": "IV", "frequency": "Daily", "ward": "General Ward A", "urgency": "ROUTINE", "prescriber_id": "DOC-326", "prescriber_name": "Dr. Kenneth Branagh", "dispense_as_written": False, "clinical_notes": "GERD exacerbation"},
        {"prescription_id": "RX-1029", "patient_id": "PAT-1011", "medicine_id": "MED-015", "requested_medicine": "Ibuprofen 400mg Oral", "dosage": "400mg", "route": "Oral", "frequency": "TID", "ward": "Orthopedic Ward", "urgency": "ROUTINE", "prescriber_id": "DOC-327", "prescriber_name": "Dr. Emma Thompson", "dispense_as_written": False, "clinical_notes": "Post-sprain analgesia"},
        {"prescription_id": "RX-1030", "patient_id": "PAT-1015", "medicine_id": "MED-018", "requested_medicine": "Levothyroxine 50mcg Oral", "dosage": "50mcg", "route": "Oral", "frequency": "Daily in AM", "ward": "Outpatient Clinic", "urgency": "ROUTINE", "prescriber_id": "DOC-328", "prescriber_name": "Dr. Anthony Hopkins", "dispense_as_written": False, "clinical_notes": "Hypothyroidism replacement"},
    ]

    # Save to data/synthetic/*.json
    datasets = {
        "medicines.json": medicines_data,
        "alternatives.json": alternatives_data,
        "patients.json": patients_data,
        "allergies.json": allergies_data,
        "stock.json": stock_data,
        "prescriber_rules.json": prescriber_rules_data,
        "prescriptions.json": prescriptions_data,
    }

    for filename, data in datasets.items():
        filepath = DATA_SYNTHETIC_DIR / filename
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    print(f"Synthetic datasets written successfully to {DATA_SYNTHETIC_DIR}")
    return datasets


def seed_database():
    Base.metadata.create_all(bind=engine)
    datasets = generate_synthetic_dataset()

    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Medicine).count() == 0:
            for item in datasets["medicines.json"]:
                db.add(Medicine(**item))

            for item in datasets["alternatives.json"]:
                db.add(AlternativeMedicineRecord(**item))

            for item in datasets["patients.json"]:
                # Convert conditions to json string
                p_item = dict(item)
                p_item["conditions"] = json.dumps(p_item.get("conditions", []))
                db.add(Patient(**p_item))

            for item in datasets["allergies.json"]:
                db.add(AllergyRecord(**item))

            for item in datasets["stock.json"]:
                db.add(StockRecord(**item))

            for item in datasets["prescriber_rules.json"]:
                db.add(PrescriberRule(**item))

            for item in datasets["prescriptions.json"]:
                db.add(Prescription(**item))

            db.commit()
            print("Database successfully seeded with synthetic records.")
        else:
            print("Database already contains data; skipped duplicate seeding.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
