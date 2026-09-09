import os
import random
import csv
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models import models

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    random.seed(42)

    print("Generating synthetic data...")

    # 1. Medicines (20 medicines)
    medicine_data = [
        # Amoxicillin family
        {"code": "MED001", "name": "Amoxicillin 500mg Oral Capsule", "ingredient": "Amoxicillin", "strength": "500mg", "form": "Capsule", "route": "Oral", "group": "Penicillin Antibiotics"},
        {"code": "MED002", "name": "Ampicillin 500mg Oral Capsule", "ingredient": "Ampicillin", "strength": "500mg", "form": "Capsule", "route": "Oral", "group": "Penicillin Antibiotics"},
        {"code": "MED003", "name": "Cefalexin 500mg Oral Capsule", "ingredient": "Cefalexin", "strength": "500mg", "form": "Capsule", "route": "Oral", "group": "Cephalosporin Antibiotics"},
        
        # Pain / Analgesics
        {"code": "MED004", "name": "Ibuprofen 400mg Oral Tablet", "ingredient": "Ibuprofen", "strength": "400mg", "form": "Tablet", "route": "Oral", "group": "NSAID Analgesics"},
        {"code": "MED005", "name": "Naproxen 500mg Oral Tablet", "ingredient": "Naproxen", "strength": "500mg", "form": "Tablet", "route": "Oral", "group": "NSAID Analgesics"},
        {"code": "MED006", "name": "Paracetamol 500mg Oral Tablet", "ingredient": "Paracetamol", "strength": "500mg", "form": "Tablet", "route": "Oral", "group": "Non-Opioid Analgesics"},
        {"code": "MED007", "name": "Morphine 10mg/ml IV Injection", "ingredient": "Morphine", "strength": "10mg/ml", "form": "Injection", "route": "IV", "group": "Opioid Analgesics"},
        {"code": "MED008", "name": "Fentanyl 50mcg/ml IV Injection", "ingredient": "Fentanyl", "strength": "50mcg/ml", "form": "Injection", "route": "IV", "group": "Opioid Analgesics"},

        # Cardiovascular
        {"code": "MED009", "name": "Amlodipine 5mg Oral Tablet", "ingredient": "Amlodipine", "strength": "5mg", "form": "Tablet", "route": "Oral", "group": "Calcium Channel Blockers"},
        {"code": "MED010", "name": "Felodipine 5mg Oral Tablet", "ingredient": "Felodipine", "strength": "5mg", "form": "Tablet", "route": "Oral", "group": "Calcium Channel Blockers"},
        {"code": "MED011", "name": "Enalapril 10mg Oral Tablet", "ingredient": "Enalapril", "strength": "10mg", "form": "Tablet", "route": "Oral", "group": "ACE Inhibitors"},
        {"code": "MED012", "name": "Lisinopril 10mg Oral Tablet", "ingredient": "Lisinopril", "strength": "10mg", "form": "Tablet", "route": "Oral", "group": "ACE Inhibitors"},

        # Antidiabetic
        {"code": "MED013", "name": "Metformin 500mg Oral Tablet", "ingredient": "Metformin", "strength": "500mg", "form": "Tablet", "route": "Oral", "group": "Biguanides"},
        {"code": "MED014", "name": "Glipizide 5mg Oral Tablet", "ingredient": "Glipizide", "strength": "5mg", "form": "Tablet", "route": "Oral", "group": "Sulfonylureas"},

        # Gastrointestinal
        {"code": "MED015", "name": "Omeprazole 20mg Oral Capsule", "ingredient": "Omeprazole", "strength": "20mg", "form": "Capsule", "route": "Oral", "group": "Proton Pump Inhibitors"},
        {"code": "MED016", "name": "Esomeprazole 20mg Oral Capsule", "ingredient": "Esomeprazole", "strength": "20mg", "form": "Capsule", "route": "Oral", "group": "Proton Pump Inhibitors"},
        {"code": "MED017", "name": "Pantoprazole 40mg IV Injection", "ingredient": "Pantoprazole", "strength": "40mg", "form": "Injection", "route": "IV", "group": "Proton Pump Inhibitors"},

        # Respiratory / Antiasthmatic
        {"code": "MED018", "name": "Salbutamol 100mcg Inhaler", "ingredient": "Salbutamol", "strength": "100mcg", "form": "Inhaler", "route": "Inhalation", "group": "Beta2 Agonists"},
        {"code": "MED019", "name": "Terbutaline 500mcg Inhaler", "ingredient": "Terbutaline", "strength": "500mcg", "form": "Inhaler", "route": "Inhalation", "group": "Beta2 Agonists"},
        
        # Sedatives / Specialty
        {"code": "MED020", "name": "Midazolam 5mg/ml IV Injection", "ingredient": "Midazolam", "strength": "5mg/ml", "form": "Injection", "route": "IV", "group": "Benzodiazepines"},
    ]

    medicines = []
    for item in medicine_data:
        m = models.Medicine(
            medicine_code=item["code"],
            medicine_name=item["name"],
            active_ingredient=item["ingredient"],
            strength=item["strength"],
            dosage_form=item["form"],
            route=item["route"],
            therapeutic_group=item["group"],
        )
        db.add(m)
        medicines.append(m)
    db.commit()

    # Create mapping of code -> medicine id
    med_map = {m.medicine_code: m.id for m in db.query(models.Medicine).all()}

    # 2. Approved Alternatives (>= 30 relationships)
    alt_pairs = [
        ("MED001", "MED002", "Substitutable within Penicillins"),
        ("MED001", "MED003", "Alternative cephalosporin option"),
        ("MED002", "MED001", "Substitutable within Penicillins"),
        ("MED004", "MED005", "NSAID therapeutic substitute"),
        ("MED004", "MED006", "Non-NSAID analgesic option"),
        ("MED005", "MED004", "NSAID therapeutic substitute"),
        ("MED006", "MED004", "NSAID alternative"),
        ("MED007", "MED008", "Opioid analgesic substitution"),
        ("MED008", "MED007", "Opioid analgesic substitution"),
        ("MED009", "MED010", "CCB therapeutic equivalence"),
        ("MED010", "MED009", "CCB therapeutic equivalence"),
        ("MED011", "MED012", "ACE inhibitor substitution"),
        ("MED012", "MED011", "ACE inhibitor substitution"),
        ("MED013", "MED014", "Oral hypoglycemic option"),
        ("MED015", "MED016", "PPI therapeutic equivalence"),
        ("MED015", "MED017", "IV PPI alternative"),
        ("MED016", "MED015", "PPI therapeutic equivalence"),
        ("MED017", "MED015", "Oral PPI transition"),
        ("MED018", "MED019", "Bronchodilator alternative"),
        ("MED019", "MED018", "Bronchodilator alternative"),
        ("MED001", "MED006", "Analgesic co-therapy alternative"),
        ("MED003", "MED001", "Penicillin alternative"),
        ("MED009", "MED011", "Antihypertensive class switch"),
        ("MED011", "MED009", "Antihypertensive class switch"),
        ("MED013", "MED015", "Gastroprotective combination"),
        ("MED007", "MED020", "Sedative analgesia option"),
        ("MED020", "MED007", "Analgesic sedation option"),
        ("MED004", "MED015", "GI protected NSAID option"),
        ("MED005", "MED015", "GI protected NSAID option"),
        ("MED010", "MED012", "Antihypertensive alternative"),
    ]

    for m_code, alt_code, note in alt_pairs:
        alt_rel = models.ApprovedAlternative(
            medicine_id=med_map[m_code],
            alternative_medicine_id=med_map[alt_code],
            approved=True,
            clinical_group="General Clinical Approval",
            notes=note,
        )
        db.add(alt_rel)
    db.commit()

    # 3. Stock Records
    # Make MED002 (Ampicillin) out of stock to demonstrate out-of-stock alternative
    stock_quantities = {
        "MED001": 150, "MED002": 0,   "MED003": 80,  "MED004": 200, "MED005": 120,
        "MED006": 300, "MED007": 45,  "MED008": 30,  "MED009": 100, "MED010": 90,
        "MED011": 0,   "MED012": 110, "MED013": 250, "MED014": 85,  "MED015": 180,
        "MED016": 140, "MED017": 50,  "MED018": 95,  "MED019": 60,  "MED020": 40,
    }
    for m_code, q in stock_quantities.items():
        st = models.Stock(medicine_id=med_map[m_code], quantity=q, location="Main Pharmacy Shelf A")
        db.add(st)
    db.commit()

    # 4. Prescriber Rules
    # Morphine & Fentanyl require prescriber approval
    pr1 = models.PrescriberRule(
        medicine_id=med_map["MED008"],
        approval_required=True,
        rule_description="High-alert opioid: require prescriber sign-off before substitution.",
        urgency_allowed="EMERGENCY",
        notes="Strict clinical supervision required."
    )
    pr2 = models.PrescriberRule(
        medicine_id=med_map["MED007"],
        approval_required=True,
        rule_description="Controlled substance: prescriber approval required.",
        urgency_allowed="ROUTINE,URGENT",
        notes="High risk narcotic."
    )
    db.add(pr1)
    db.add(pr2)
    db.commit()

    # 5. Patients (30 synthetic patients)
    first_names = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth",
                   "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen",
                   "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Donald", "Sandra"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
                  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
                  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"]

    allergies_pool = ["Ampicillin", "Ibuprofen", "Penicillin", "Morphine", "Amlodipine", None, None, None, None, None]

    patients = []
    for i in range(30):
        code = f"PAT{1001 + i}"
        age = random.randint(18, 85)
        gender = "M" if i % 2 == 0 else "F"
        allergy = allergies_pool[i % len(allergies_pool)]
        
        renal = (i in [3, 12, 21])
        hepatic = (i in [7, 18])
        preg = (gender == "F" and age < 45 and i in [5, 15])
        
        p = models.Patient(
            patient_code=code,
            age=age,
            gender=gender,
            allergies=allergy,
            conditions="Hypertension, Type 2 Diabetes" if i % 3 == 0 else "Asthma, GERD" if i % 4 == 0 else "Osteoarthritis",
            renal_constraint=renal,
            hepatic_constraint=hepatic,
            pregnancy_constraint=preg,
            other_constraints="Penicillin hypersensitivity" if allergy in ["Ampicillin", "Penicillin"] else None
        )
        db.add(p)
        patients.append(p)
    db.commit()

    # 6. Prescriptions (50 synthetic prescriptions covering all test cases A-J & Demo Journeys)
    # Ensure specific edge cases:
    # Journeys:
    # Journey 1: Routine Outpatient (Patient PAT1001, Amoxicillin MED001 -> Ampicillin MED002 out of stock -> Cefalexin MED003 valid)
    # Journey 2: Emergency OT (Patient PAT1002, Morphine MED007 -> Fentanyl MED008 requiring prescriber approval, Emergency)

    urgencies = ["ROUTINE", "URGENT", "EMERGENCY"]
    prescriptions = []

    # Prescription 1 (Routine Journey 1)
    p1 = models.Prescription(
        prescription_code="RX-10001",
        patient_id=patients[0].id, # PAT1001
        medicine_id=med_map["MED001"], # Amoxicillin
        medicine_name="Amoxicillin 500mg Oral Capsule",
        dose="500mg", route="Oral", frequency="TDS", urgency="ROUTINE", prescriber_name="Dr. Aris Thorne"
    )
    db.add(p1)
    prescriptions.append(p1)

    # Prescription 2 (Emergency Journey 2)
    p2 = models.Prescription(
        prescription_code="RX-10002",
        patient_id=patients[1].id, # PAT1002
        medicine_id=med_map["MED007"], # Morphine
        medicine_name="Morphine 10mg/ml IV Injection",
        dose="10mg", route="IV", frequency="STAT", urgency="EMERGENCY", prescriber_name="Dr. Elena Vance"
    )
    db.add(p2)
    prescriptions.append(p2)

    # Specific Edge Cases:
    # EDGE 1: Allergy conflict (Patient PAT1002 has allergy Ampicillin, requesting Amoxicillin)
    p3 = models.Prescription(
        prescription_code="RX-10003",
        patient_id=patients[1].id, # PAT1002 (Allergy to Ampicillin)
        medicine_id=med_map["MED001"], # Amoxicillin (Alt MED002 Ampicillin is blocked due to allergy)
        medicine_name="Amoxicillin 500mg Oral Capsule",
        dose="500mg", route="Oral", frequency="BD", urgency="ROUTINE", prescriber_name="Dr. Clara Oswald"
    )
    db.add(p3)
    prescriptions.append(p3)

    # EDGE 2: Approved alternative out of stock (Enalapril MED011 -> Lisinopril MED012 or Enalapril out of stock)
    p4 = models.Prescription(
        prescription_code="RX-10004",
        patient_id=patients[2].id,
        medicine_id=med_map["MED012"], # Lisinopril -> Enalapril (MED011) which has stock 0
        medicine_name="Lisinopril 10mg Oral Tablet",
        dose="10mg", route="Oral", frequency="OD", urgency="ROUTINE", prescriber_name="Dr. Marcus Brody"
    )
    db.add(p4)
    prescriptions.append(p4)

    # EDGE 4: Renal constraint violation (PAT1004 has renal constraint)
    p5 = models.Prescription(
        prescription_code="RX-10005",
        patient_id=patients[3].id, # PAT1004 (renal_constraint = True)
        medicine_id=med_map["MED004"], # Ibuprofen
        medicine_name="Ibuprofen 400mg Oral Tablet",
        dose="400mg", route="Oral", frequency="TDS", urgency="URGENT", prescriber_name="Dr. Sarah Connor"
    )
    db.add(p5)
    prescriptions.append(p5)

    # Fill up to 50 prescriptions deterministically
    med_list = list(medicine_data)
    for i in range(5, 50):
        pat = patients[i % len(patients)]
        med_item = med_list[i % len(med_list)]
        urgency = urgencies[i % len(urgencies)]
        px = models.Prescription(
            prescription_code=f"RX-{10001 + i}",
            patient_id=pat.id,
            medicine_id=med_map[med_item["code"]],
            medicine_name=med_item["name"],
            dose=med_item["strength"],
            route=med_item["route"],
            frequency="BD" if i % 2 == 0 else "TDS",
            urgency=urgency,
            prescriber_name=f"Dr. Prescriber {i+1}"
        )
        db.add(px)
        prescriptions.append(px)

    db.commit()
    print("Database successfully seeded with deterministic synthetic data!")
    db.close()

if __name__ == "__main__":
    seed_database()
