# System Architecture

## 1. Overview & Data Flow
The Hospital Pharmacy Substitution Decision Support System utilizes a decoupled 3-tier architecture:

```
[ React + Vite Frontend ] <--- REST API (JSON) ---> [ FastAPI Backend Service ]
                                                           |
                                                [ Rule Decision Engine ]
                                                           |
                                                [ SQLAlchemy ORM / SQLite ]
```

## 2. Component Specifications
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts.
- **Backend Service**: Python FastAPI, Pydantic data schemas, SQLAlchemy ORM.
- **Rule Engine**: Deterministic rules service executing sequential safety checks (R001–R007).
- **Database**: Relational SQLite database with clean schema structure ready for PostgreSQL migration.

## 3. Database Entities
1. `PATIENTS`: Demographics, allergies, organ constraints (renal, hepatic, pregnancy).
2. `MEDICINES`: Active ingredients, strengths, dosage forms, therapeutic groups.
3. `PRESCRIPTIONS`: Code, patient ID, requested medicine ID, dose, route, urgency.
4. `APPROVED_ALTERNATIVES`: Approved substitute relationships with notes.
5. `ALLERGIES`: Patient allergen records and severity.
6. `STOCK`: Stock levels and inventory location.
7. `PRESCRIBER_RULES`: Restricted drug approval protocols.
8. `SUBSTITUTION_DECISIONS`: Evaluation results, human decision, override reason.
9. `AUDIT_LOGS`: Immutable action logs with timestamp and user ID.
