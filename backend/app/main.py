from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
<<<<<<< HEAD
from backend.app.database.connection import engine, Base
from backend.app.api.substitution import router as substitution_router
from backend.app.api.inventory import router as inventory_router
from backend.app.api.audit import router as audit_router
from backend.app.api.decisions import router as decisions_router
from backend.app.api.metrics import router as metrics_router
from backend.app.api.evaluation import router as evaluation_router

# Ensure tables are created
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Hospital Pharmacy Substitution Decision Support System",
    description="Deterministic, explainable, and auditable software prototype for evaluating hospital medication substitutions.",
    version="1.0.0"
)

# CORS Middleware
=======
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from .database import engine, Base
from .routes import patients, prescriptions, medicines, alternatives, stock, prescriber_rules, decisions, audit, metrics, validation

app = FastAPI(title="Hospital Pharmacy Substitution Decision Support", version="0.1.0")

# CORS settings for frontend
>>>>>>> 06d7a50b1e9874e1f3c047ce23b8ed89374ee878
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

<<<<<<< HEAD
# Include Routers
app.include_router(substitution_router)
app.include_router(inventory_router)
app.include_router(audit_router)
app.include_router(decisions_router)
app.include_router(metrics_router)
app.include_router(evaluation_router)


@app.get("/", tags=["Root"])
@app.head("/", tags=["Root"])
def root():
    return {
        "service": "Hospital Pharmacy Substitution Decision Support System",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }


@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "hospital-pharmacy-decision-support",
        "version": "1.0.0",
        "database": "sqlite_connected"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
=======
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
>>>>>>> 06d7a50b1e9874e1f3c047ce23b8ed89374ee878
