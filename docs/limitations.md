# System Limitations Report

## 1. Prototype Scope Limitations
- **Synthetic Data Only**: The system operates exclusively on synthetic patient and drug datasets generated for demonstration purposes. It does NOT process real patient Protected Health Information (PHI).
- **Rule Engine Coverage**: Decision rules are deterministic algorithms based on 7 core safety checks. Complex drug-drug interactions requiring multi-pathway pharmacokinetic modeling are currently simplified.
- **EHR Integration**: Interfaces with synthetic REST stubs rather than live HL7 FHIR hospital database connections.

## 2. Regulatory & Clinical Disclaimer
"Prototype for clinical decision support. Not intended for autonomous prescribing or dispensing."
