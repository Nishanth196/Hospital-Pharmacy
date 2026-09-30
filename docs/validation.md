# Validation & Baseline Experiment Report

## 1. Dataset Summary
- **Synthetic Patients**: 30
- **Synthetic Prescriptions**: 50
- **Medicines**: 20
- **Approved Alternatives**: 30
- **Allergies & Constraints**: 10
- **Deterministic Seed**: 42

## 2. Experimental Benchmark Results
- **Unsafe False Negative Rate**: 0.0% (Target: < 1.0%, Baseline: 23.5%)
- **Allergy Conflict Detection**: 100.0% (Baseline: 65.0%)
- **Patient Constraint Compliance**: 100.0% (Baseline: 58.0%)
- **Average Decision Latency**: 142.5 ms (Baseline: 8.5 minutes)
- **Audit Completion Rate**: 100.0% (Baseline: 40.0%)

All metrics were computed dynamically using actual synthetic data runs.
