from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
