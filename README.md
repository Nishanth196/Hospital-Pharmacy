# Hospital Pharmacy Substitution Decision Support Prototype

## Overview
This repository contains a **full‑stack prototype** for a hospital pharmacy substitution decision support system. It demonstrates how clinical, patient, stock, and prescriber constraints are evaluated before a medication substitution is recommended, blocked, or escalated.

The system is built with:
- **Frontend**: React + Vite + TypeScript, Tailwind CSS, Lucide icons, Recharts.
- **Backend**: FastAPI, Pydantic, SQLAlchemy (SQLite for demo, PostgreSQL‑ready).
- **Database**: Structured tables for patients, prescriptions, medicines, alternatives, allergies, stock, prescriber rules, decisions, and audit logs.
- **Deployment**: Render (backend & frontend services) with environment‑variable configuration.

All data is **synthetic** and deterministic for safe demonstration.
