import csv
import os

os.makedirs("data", exist_ok=True)

# 1. patients.csv
with open("data/patients.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["id", "patient_code", "age", "gender", "allergies", "conditions", "renal_constraint", "hepatic_constraint", "pregnancy_constraint", "other_constraints"])
    for i in range(1, 31):
        writer.writerow([i, f"PAT{1000+i}", 20+i, "M" if i%2==0 else "F", "Ampicillin" if i in [2,10] else "None", "Hypertension" if i%3==0 else "Asthma", i in [4,13], i in [8], i in [6] and i%2!=0, "None"])

# 2. prescriptions.csv
with open("data/prescriptions.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["id", "prescription_code", "patient_id", "medicine_id", "medicine_name", "dose", "route", "frequency", "urgency", "prescriber_name", "created_at"])
    for i in range(1, 51):
        writer.writerow([i, f"RX-{10000+i}", (i%30)+1, (i%20)+1, f"Synthetic Medicine {(i%20)+1}", "500mg", "Oral", "BD", "ROUTINE" if i%3!=0 else "URGENT" if i%5==0 else "EMERGENCY", f"Dr. Prescriber {i}", "2026-09-09T10:00:00Z"])

# 3. alternatives.csv
with open("data/alternatives.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["id", "medicine_id", "alternative_medicine_id", "approved", "clinical_group", "notes"])
    writer.writerow([1, 1, 2, True, "Penicillin Antibiotics", "Standard generic substitution"])
    writer.writerow([2, 1, 3, True, "Cephalosporin Antibiotics", "Cephalosporin option"])

# 4. allergies.csv
with open("data/allergies.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["id", "patient_id", "allergen", "severity"])
    writer.writerow([1, 2, "Ampicillin", "HIGH"])
    writer.writerow([2, 10, "Ampicillin", "MEDIUM"])

# 5. stock.csv
with open("data/stock.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["id", "medicine_id", "quantity", "location", "last_updated"])
    for i in range(1, 21):
        writer.writerow([i, i, 0 if i in [2, 11] else 100+i*5, "Main Pharmacy Shelf A", "2026-09-09T10:00:00Z"])

# 6. prescriber_rules.csv
with open("data/prescriber_rules.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["id", "medicine_id", "approval_required", "rule_description", "urgency_allowed", "notes"])
    writer.writerow([1, 8, True, "High-alert opioid: require prescriber sign-off", "EMERGENCY", "High risk narcotic"])
    writer.writerow([2, 7, True, "Controlled substance: prescriber approval required", "ROUTINE,URGENT", "Controlled drug"])

print("Data CSV files generated successfully in data/")
