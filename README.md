# Hospital Pharmacy Substitution Decision Support System

> [!WARNING]
> **Academic & Software Demonstration Only:**  
> **"This prototype is for academic and software demonstration purposes only and is not a clinical decision-making system."**  
> It operates exclusively on synthetic patient and formulary data and does not claim clinical validation or real-world medical safety.

---

## 1. Project Overview
The **Hospital Pharmacy Substitution Decision Support System** is an auditable, deterministic, and explainable software platform designed to assist hospital pharmacy personnel when evaluating proposed therapeutic drug substitutions. In institutional healthcare environments, medication unavailability, national shortages, formulary standardizations, or brand-to-generic switches require rapid yet rigorous clinical safety checks.

This system guarantees complete reproducibility and transparency: every substitution request executes across a strict 15-step deterministic evaluation pipeline enforcing 9 institutional rules, producing a verified verdict (`APPROVED`, `BLOCKED`, `ESCALATED`, or `REVIEW_REQUIRED`) alongside granular clinical evidence and mandatory audit trail logging.

---

## 2. Problem Statement
Hospital medication substitutions carry substantial clinical risks:
1. **Adverse Drug Reactions:** Administering an alternative with an active ingredient or class cross-reactivity matching a documented patient allergy (e.g., penicillins and early cephalosporins).
2. **Organ-Specific Contraindications:** Prescribing renally eliminated agents without adjusting for severe kidney dysfunction (e.g., eGFR < 30 mL/min).
3. **Narrow Therapeutic Index (NTI) Risks:** Substituting critical agents (e.g., Warfarin, Tacrolimus, Digoxin, Lithium) where subtle bioavailability fluctuations can precipitate toxicity or graft failure.
4. **Supply Chain Blindspots:** Dispensing substitutions that are out of stock in ward or central pharmacies.
5. **Physician Directives:** Disregarding explicit "Dispense As Written" (DAW) orders.
6. **Black-box AI Hallucinations:** Using non-deterministic LLMs for safety-critical healthcare logic introduces unvetted risk and unexplainable approvals.

---

## 3. Objectives
- **100% Deterministic Decision Pipeline:** Replace opaque heuristic/AI methods with a deterministic 15-step safety verification engine.
- **Explainable Decisions:** Accompany every decision with exact passed/failed rules, clinical rationale, and verifiable evidence.
- **Persistent Immutable Auditing:** Record every evaluation, clinical confirmation, escalation, and override into an append-only SQLite audit ledger.
- **Human-in-the-Loop Safeguards:** Strictly enforce mandatory human pharmacist verification for high-impact medications, escalations, and overrides (forbidding silent overrides).
- **Real-Time Operational Instrumentation:** Measure actual latency, rule trigger distributions, and true false-positive/negative rates from live data.

---

## 4. Architecture
The system employs a decoupled, asynchronous, service-oriented architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React + TypeScript Frontend                     │
│  (Tailwind CSS, Vite, React Router, Recharts, Lucide React Icons)      │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ REST JSON APIs
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Backend Engine                          │
│  ┌───────────────────────┐                  ┌────────────────────────┐ │
│  │   FastAPI Routers     │                  │ Deterministic Engine   │ │
│  │ (/substitution, /audit│ ───────────────► │ 15-Step Pipeline       │ │
│  │  /metrics, /decisions)│                  │ Rules: RULE-001 - 009  │ │
│  └───────────────────────┘                  └───────────┬────────────┘ │
│              │                                          │              │
│              ▼                                          ▼              │
│  ┌───────────────────────┐                  ┌────────────────────────┐ │
│  │   Audit Logger        │                  │ System Metrics         │ │
│  │   Append-Only Ledger  │                  │ Performance Collector  │ │
│  └───────────────────────┘                  └────────────────────────┘ │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ SQLAlchemy ORM
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     SQLite Database (data/pharmacy.db)                 │
│  • audit_events       • decisions            • patients                │
│  • prescriptions      • medicines            • alternatives            │
│  • stock              • allergies            • prescriber_rules        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Technology Stack
- **Frontend:**
  - React 18
  - Vite 5
  - TypeScript 5
  - Tailwind CSS 3
  - React Router DOM 6
  - Recharts 2 (Data visualization)
  - Lucide React (Clinical iconography)
- **Backend:**
  - Python 3.11
  - FastAPI 0.110+
  - Pydantic v2 (Strict schema validation)
  - SQLAlchemy 2.0 (ORM)
  - SQLite (Persistent relational database)
  - Pytest 8 (Automated test suite)
  - Uvicorn (ASGI web server)

---

## 6. Folder Structure
```
hospital-pharmacy/
├── backend/
│   ├── app/
│   │   ├── api/                 # REST API route handlers
│   │   │   ├── audit.py         # /api/audit endpoints
│   │   │   ├── decisions.py     # Confirm and override endpoints
│   │   │   ├── evaluation.py    # Test case and evaluate endpoints
│   │   │   ├── inventory.py     # Rx, patient, stock, med endpoints
│   │   │   ├── metrics.py       # Live system metrics endpoint
│   │   │   └── substitution.py  # Core substitution check endpoint
│   │   ├── audit/
│   │   │   └── logger.py        # Append-only audit logging service
│   │   ├── database/
│   │   │   └── connection.py    # SQLAlchemy engine, session, Base
│   │   ├── metrics/
│   │   │   └── collector.py     # Live SQL aggregate metric calculator
│   │   ├── models/
│   │   │   └── entities.py      # SQLAlchemy relational tables
│   │   ├── rules/
│   │   │   ├── definitions.py   # Rule IDs, names, and drug lists
│   │   │   └── engine.py        # 15-step deterministic rule pipeline
│   │   ├── schemas/
│   │   │   ├── audit.py         # Pydantic audit & override models
│   │   │   ├── decision.py      # PrescriptionPayload, DecisionOutput
│   │   │   ├── inventory.py     # Inventory response models
│   │   │   └── metrics.py       # Metrics & evaluation response models
│   │   ├── utils/
│   │   └── main.py              # FastAPI app, CORS, table creation
│   ├── tests/
│   │   ├── test_api.py          # FastAPI TestClient API integration
│   │   ├── test_audit_and_decisions.py # Audit and override tests
│   │   ├── test_metrics.py      # Metric aggregation unit tests
│   │   ├── test_rules.py        # Clinical rule engine unit tests
│   │   └── test_schemas.py      # Pydantic schema validation tests
│   ├── evaluate.py              # CLI evaluation benchmark runner
│   ├── seed_data.py             # Deterministic synthetic data generator (Seed=42)
│   └── requirements.txt         # Python dependencies
├── data/
│   ├── synthetic/               # Seeded JSON datasets (Seed=42)
│   │   ├── allergies.json       # 20 allergy records
│   │   ├── alternatives.json    # 20 approved alternative formulations
│   │   ├── medicines.json       # 20 formulary drugs
│   │   ├── patients.json        # 20 synthetic patients
│   │   ├── prescriber_rules.json# 15 prescriber restriction policies
│   │   ├── prescriptions.json   # 30 synthetic prescriptions
│   │   └── stock.json           # 20 stock/depot records
│   ├── evaluation_results.json  # Genuine measured benchmark metrics
│   └── pharmacy.db              # SQLite persistent database
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx       # Shell layout with banner & footer
│   │   │   ├── MetricCard.tsx   # KPI metric card component
│   │   │   ├── Navbar.tsx       # Top navigation & user profile
│   │   │   ├── RuleTimeline.tsx # Expandable rule checklist
│   │   │   └── StatusBadge.tsx  # Color-coded clinical status badges
│   │   ├── pages/
│   │   │   ├── AboutPage.tsx    # Limitations & architecture
│   │   │   ├── AuditLogsPage.tsx# Immutable audit trail ledger
│   │   │   ├── CheckSubstitutionPage.tsx # Core evaluation form & presets
│   │   │   ├── DashboardPage.tsx# Executive KPI dashboard
│   │   │   ├── DecisionResultPage.tsx    # Diagnostic explanation
│   │   │   ├── HumanReviewPage.tsx       # Pharmacist sign-off queue
│   │   │   ├── LoginPage.tsx    # Clinician persona selector
│   │   │   ├── MetricsPage.tsx  # System performance charts
│   │   │   ├── OverridePage.tsx # Clinical override console
│   │   │   └── TestCasesPage.tsx# Synthetic test runner
│   │   ├── services/
│   │   │   └── api.ts           # Fetch API client
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript interfaces
│   │   ├── App.tsx              # Router tree
│   │   ├── index.css            # Tailwind directives
│   │   └── main.tsx             # Root bootstrap
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.ts
├── .gitignore
├── render.yaml
└── README.md
```

---

## 7. Rule Engine
The engine evaluates requests through an ordered 15-step deterministic pipeline:
1. **Validate Prescription:** Checks mandatory fields (prescription ID, patient ID, drug, dosage, route, frequency, ward).
2. **Validate Patient Information:** Verifies patient profile; flags missing critical attributes (RULE-006).
3. **Check Requested Medicine:** Validates baseline drug status on hospital catalog.
4. **Check Approved Alternative (RULE-001):** Ensures alternative is approved on hospital formulary (`BLOCKED` if unapproved).
5. **Check Allergy Conflict (RULE-002):** Evaluates patient allergies and class cross-reactivity (`BLOCKED` on conflict).
6. **Check Patient Constraints (RULE-007):** Evaluates organ function (eGFR < 30 contraindicates renally eliminated drugs), age-specific Beers criteria, and teratogenic pregnancy risks.
7. **Check Stock Availability (RULE-003):** Confirms positive depot/ward inventory (`ESCALATED` if out of stock).
8. **Check Prescriber Restrictions (RULE-004):** Enforces "Dispense As Written" orders or specialist restrictions (`ESCALATED`).
9. **Check Urgency:** Prioritizes STAT / ICU / OR surgical acuity protocols.
10. **Check High-Impact Medicine (RULE-005):** Flags narrow therapeutic index agents (Warfarin, Tacrolimus, Digoxin, Lithium) (`REVIEW_REQUIRED` + mandatory human confirmation).
11. **Generate Deterministic Decision:**
    - Any safety conflict (RULE-001, RULE-002) $\rightarrow$ `BLOCKED` (Risk: CRITICAL/HIGH)
    - Stockout, restriction, missing info, no alternatives (RULE-003, RULE-004, RULE-006, RULE-008) $\rightarrow$ `ESCALATED` (Risk: HIGH)
    - High-impact or organ constraints (RULE-005, RULE-007) $\rightarrow$ `REVIEW_REQUIRED` (Risk: MEDIUM/HIGH)
    - Approved alternative + zero conflicts + stock available (RULE-009) $\rightarrow$ `APPROVED` (Risk: LOW)
12. **Determine Human Confirmation Requirement:** Mandatory for `REVIEW_REQUIRED`, `ESCALATED`, high-impact medications, and overrides.
13. **Generate Explanation & Evidence:** Synthesizes human-readable clinical rationale and evidence snippets.
14. **Write Audit Event:** Persists `DECISION_CREATED` to SQLite `audit_events` and saves `decisions` row.
15. **Return Final Decision:** Returns strongly-typed `DecisionOutput`.

---

## 8. Pydantic Schemas
Strict Pydantic v2 schemas govern all inputs and responses:
- `PrescriptionPayload`: Validates prescription ID, patient ID, medicine ID, requested medicine, dosage, route, frequency, ward, urgency, prescriber ID, dispense as written, and patient clinical information.
- `AlternativeMedicine`: Validates alternative ID, name, active ingredient, strength, dosage form, approved status, high impact status, and tier.
- `RuleEvaluation`: Enforces rule ID, rule name, status (`PASS`, `FAIL`, `WARNING`, `NOT_APPLICABLE`), severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), explanation, and evidence.
- `DecisionOutput`: Standardizes decision (`APPROVED`, `BLOCKED`, `ESCALATED`, `REVIEW_REQUIRED`), risk level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), reasons, evaluated rules list, failed rules list, valid alternatives, confirmation flags, latency, and status.
- `HumanConfirmationRequest`: User ID, user role, and confirmation rationale.
- `OverrideRequest`: User ID, user role, mandatory justification (minimum length 5 characters), and target overridden decision.
- `MetricsResponse` & `EvaluationMetricSummary`: Operational performance metrics and benchmark rates.

---

## 9. Synthetic Dataset
The dataset is generated with fixed seed `SEED = 42`:
- **20 Synthetic Patients:** Diverse ages (16–82), renal function (eGFR 22–105 mL/min), pregnancy cases, and clinical conditions.
- **30 Synthetic Prescriptions:** Inpatient general wards, Cardiology, ICU, Surgery/OR, Pediatrics, Oncology, and Outpatient Clinic.
- **20 Medicines:** Core hospital formulary covering antibiotics, cardiovascular drugs, anticoagulants, analgesics, and immunosuppressants.
- **20 Approved Alternatives:** Tier-1 and Tier-2 therapeutic generic equivalents, plus explicit unapproved experimental and out-of-stock test alternatives.
- **20 Allergy Records:** Direct active ingredient allergies and cross-reactivity drug classes (Penicillins, Sulfas, NSAIDs, Opioids).
- **20 Stock Records:** Ward-level inventory tracking positive stock and zero-quantity depots.
- **15 Prescriber Restriction Rules:** DAW requirements, Tier-1 limitations, and Antimicrobial Stewardship senior approval rules.

---

## 10. Test Scenarios
15 canonical test fixtures are explicitly defined:
1. **Safe substitution:** Routine oral amoxicillin to ampicillin generic with stock > 0 $\rightarrow$ `APPROVED`
2. **Allergy conflict:** Penicillin anaphylactic patient requesting ampicillin $\rightarrow$ `BLOCKED` (RULE-002)
3. **Alternative not approved:** Experimental generic Penicillin-X $\rightarrow$ `BLOCKED` (RULE-001)
4. **Alternative out of stock:** Ciprofloxacin to Moxifloxacin with 0 units stock $\rightarrow$ `ESCALATED` (RULE-003)
5. **Prescriber restriction:** Warfarin with Dispense As Written flag $\rightarrow$ `ESCALATED` (RULE-004)
6. **High-impact medication:** Tacrolimus immunosuppressant with narrow therapeutic index $\rightarrow$ `REVIEW_REQUIRED` (RULE-005)
7. **Missing critical information:** Metformin prescribed with absent renal function $\rightarrow$ `ESCALATED` (RULE-006)
8. **Urgent case:** STAT ICU Vancomycin request with missing baseline labs $\rightarrow$ `ESCALATED` (RULE-006)
9. **Multiple simultaneous failures:** Alternative unapproved AND patient allergic $\rightarrow$ `BLOCKED` (RULE-001, RULE-002)
10. **No valid alternative remains:** Unlisted compound with all alternatives depleted $\rightarrow$ `BLOCKED` / `ESCALATED` (RULE-008)
11. **Multiple valid alternatives:** Two approved alternatives available; engine selects primary Tier-1 $\rightarrow$ `APPROVED`
12. **Conflicting constraints:** Severe renal impairment (eGFR 22 mL/min) with Metformin $\rightarrow$ `REVIEW_REQUIRED` (RULE-007)
13. **Outpatient case:** Ambulatory lipid clinic switch (Atorvastatin to Rosuvastatin) $\rightarrow$ `APPROVED`
14. **Ward case:** Routine General Ward PPI interchange (Pantoprazole to Esomeprazole) $\rightarrow$ `APPROVED`
15. **Operating room case:** High-acuity surgical Morphine to Hydromorphone opioid switch $\rightarrow$ `REVIEW_REQUIRED` (RULE-005)

---

## 11. Baseline Evaluation
The evaluation benchmark is executed via `backend/evaluate.py`, running all 15 test cases against the live deterministic rule engine and measuring genuine outcomes.

### Actual Measured Results (`data/evaluation_results.json`):
```json
{
  "total_cases": 15,
  "correct_decisions": 15,
  "incorrect_decisions": 0,
  "accuracy": 100.0,
  "approved": 4,
  "blocked": 4,
  "escalated": 4,
  "review_required": 3,
  "human_review_count": 7,
  "false_positive_escalation_rate": 0.0,
  "false_negative_approval_rate": 0.0
}
```

---

## 12. Audit Logging
Audit logs are persistently saved in the SQLite table `audit_events`:
- **Table Schema:**
  - `event_id`: Unique identifier (e.g. `EVT-A1B2C3D4`)
  - `timestamp`: ISO UTC timestamp
  - `user_id`: Pharmacist or clinician ID
  - `user_role`: Institutional role
  - `prescription_id`: Prescription identifier
  - `patient_id`: Patient identifier
  - `alternative_id`: Evaluated alternative identifier
  - `decision_id`: Decision record identifier
  - `action`: `DECISION_CREATED`, `HUMAN_CONFIRMED`, `DECISION_ESCALATED`, `OVERRIDE_REQUESTED`, `OVERRIDE_APPROVED`
  - `decision`: Verdict
  - `rule_ids`: JSON list of executed rules
  - `rationale`: Clinical explanation
  - `override_requested`: Boolean
  - `override_reason`: Mandatory justification
  - `previous_decision`: Prior decision before override
  - `final_decision`: Final decision after override
  - `metadata`: JSON object with execution metrics

---

## 13. Human-in-the-Loop
Human confirmation is mandatory for:
- Narrow therapeutic index medications (`RULE-005`)
- Escalated decisions (`RULE-003`, `RULE-004`, `RULE-006`, `RULE-008`)
- Conflicting clinical constraints (`RULE-007`)
- Formal clinical overrides

### Clinical Override Protocol
Overrides require mandatory justification (minimum length 5 characters). Silent overrides are physically rejected by schema validation and route handlers. Overriding a decision persists an immutable `OVERRIDE_APPROVED` audit event recording the authorizing clinician's identity and rationale.

---

## 14. Metrics
The `/api/metrics` endpoint queries the live database and computes:
- Total decisions count
- Approved, Blocked, Escalated, Review Required distribution
- Real-time average decision latency (in milliseconds)
- Average rules evaluated per decision
- Escalation rate percentage
- Override rate percentage
- Benchmark false-positive escalation rate

---

## 15. API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check and database connection status |
| `POST` | `/api/substitution/check` | Evaluates proposed drug substitution through the 15-step rule engine |
| `GET` | `/api/prescriptions` | Retrieves hospital prescriptions |
| `GET` | `/api/patients` | Retrieves synthetic patient profiles |
| `GET` | `/api/medicines` | Retrieves hospital formulary medicines |
| `GET` | `/api/alternatives` | Retrieves approved and evaluated generic alternatives |
| `GET` | `/api/stock` | Retrieves ward and depot stock levels |
| `GET` | `/api/decisions/pending` | Lists decisions requiring human confirmation |
| `GET` | `/api/decisions/{id}` | Retrieves full diagnostic details for a specific decision |
| `POST` | `/api/decisions/{id}/confirm` | Clinically confirms a decision flagged for human review |
| `POST` | `/api/decisions/{id}/override` | Authorizes a clinical override with mandatory justification |
| `GET` | `/api/audit` | Retrieves chronological audit events with filtering support |
| `GET` | `/api/audit/{decision_id}` | Retrieves chronological audit trail for a specific decision |
| `GET` | `/api/metrics` | Calculates operational KPIs and rule outcomes from live data |
| `GET` | `/api/test-cases` | Returns the 15 canonical test fixtures |
| `POST` | `/api/evaluate` | Runs live evaluation suite and returns measured accuracy rates |

---

## 16. Frontend Screens
1. **Login Page (`/login`):** Select clinician persona (Clinical Pharmacist, Senior Specialist, Attending Physician, Chief of Pharmacy).
2. **Dashboard (`/`):** KPI cards, Recharts decision distribution pie chart, rule outcome bar chart, and pending review queue preview.
3. **Check Substitution (`/check`):** Interactive clinical form with quick-load presets (Safe, Allergy, High-Impact, Stockout, DAW, Missing Data) and real-time rule breakdown.
4. **Decision Result (`/result/:id`):** Diagnostic breakdown with status badges, clinical explanation, rule checklist, and historical audit ledger.
5. **Human Review Queue (`/human-review`):** Active review inbox allowing clinicians to inspect evidence and sign off decisions.
6. **Clinical Override Console (`/override`):** Form requiring mandatory clinical rationale to override safety holds.
7. **Audit Trail Ledger (`/audit`):** Immutable chronological transaction log with filters and JSON metadata inspector.
8. **System Metrics (`/metrics`):** Recharts latency, rule trigger frequencies, escalation rates, and performance benchmarks.
9. **Synthetic Test Benchmarks (`/test-cases`):** One-click runner executing all 15 fixtures with expected vs. actual comparison.
10. **About & Limitations (`/about`):** Architecture documentation, rule engine hierarchy, and clinical prototype disclaimers.

---

## 17. How to Run Backend

1. **Install Python dependencies:**
   ```bash
   pip install -r backend/requirements.txt
   ```

2. **Seed synthetic database (Seed = 42):**
   ```bash
   python backend/seed_data.py
   ```

3. **Start FastAPI ASGI server:**
   ```bash
   uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   API will be accessible at: `http://127.0.0.1:8000`  
   Interactive Swagger docs at: `http://127.0.0.1:8000/docs`

---

## 18. How to Run Frontend

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start Vite development server:**
   ```bash
   npm run dev
   ```
   Frontend will be accessible at: `http://localhost:5173`

---

## 19. How to Run Tests
Execute the comprehensive Pytest suite:
```bash
python -m pytest backend/tests -v
```
All 21 test suites cover schema validation, rule logic, audit persistence, human confirmation, overrides, metrics, and API endpoints.

---

## 20. How to Run Evaluation
Run the baseline evaluation suite to compute genuine measured metrics:
```bash
python backend/evaluate.py
```
Outputs measured accuracy, error rates, and case breakdowns to console and updates `data/evaluation_results.json`.

---

## 21. Limitations
- **Academic Scope:** Designed as an educational and software demonstration system; not cleared by health regulatory authorities (FDA, EMA).
- **Simplified Ontology:** Allergy cross-reactivities use representative classes (Penicillins, Sulfas, NSAIDs, Opioids) rather than multi-million term SNOMED-CT / RxNorm graphs.
- **Continuous Pharmacokinetics:** Renal checks evaluate guideline cutoffs rather than continuous differential pharmacokinetic models.
- **Stand-alone Operation:** Built with a local SQLite database; real-world production requires integration with certified EHR systems via HL7 FHIR protocols.

---

## 22. Synthetic-Data Disclaimer
All patient records, medical record numbers, clinician identifiers, prescriptions, and inventory levels in this repository are entirely synthetic and generated programmatically with fixed random seed `SEED = 42`. Any resemblance to actual patients, living or deceased, or actual medical orders is purely coincidental.
