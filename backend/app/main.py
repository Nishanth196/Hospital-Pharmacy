from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from .database import engine, Base
from .routes import patients, prescriptions, medicines, alternatives, stock, prescriber_rules, decisions, audit, metrics, validation

app = FastAPI(title="Hospital Pharmacy Substitution Decision Support", version="0.1.0")

# CORS settings for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(patients.router, prefix="/api/patients", tags=["Patients"])
app.include_router(prescriptions.router, prefix="/api/prescriptions", tags=["Prescriptions"])
app.include_router(medicines.router, prefix="/api/medicines", tags=["Medicines"])
app.include_router(alternatives.router, prefix="/api/alternatives", tags=["Alternatives"])
app.include_router(stock.router, prefix="/api/stock", tags=["Stock"])
app.include_router(prescriber_rules.router, prefix="/api/prescriber_rules", tags=["PrescriberRules"])
app.include_router(decisions.router, prefix="/api", tags=["Decisions"])
app.include_router(audit.router, prefix="/api/audit", tags=["Audit"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["Metrics"])
app.include_router(validation.router, prefix="/api/validation", tags=["Validation"])

@app.get("/api/health", summary="Health check")
async def health_check():
    return {"status": "ok"}

# Serve frontend static single-page app directly at root /
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
async def read_index():
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Hospital Pharmacy Substitution API is running. Access /docs for OpenAPI documentation."}
