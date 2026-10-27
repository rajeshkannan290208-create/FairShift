import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from backend.config import CORS_ORIGINS
from backend.database import engine, Base, SessionLocal
from backend.seed_data import seed_database
from backend.routers import dashboard, workers, fairpay, silentshield, shiftguardian, system

# 1. Initialize Tables
Base.metadata.create_all(bind=engine)

# 2. Seed initial data
with SessionLocal() as db:
    seed_database(db, reset=False)

# 3. Create FastAPI App
app = FastAPI(
    title="FairShift API",
    description="Worker-first fairness and workplace safety platform (PromptWars 2026 × SRM ACM Student Chapter)",
    version="1.0.0"
)

# 4. CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5. Register Routers
app.include_router(system.router)
app.include_router(dashboard.router)
app.include_router(workers.router)
app.include_router(fairpay.router)
app.include_router(silentshield.router)
app.include_router(shiftguardian.router)

# 6. Static files and SPA fallback (when built for Cloud Run)
FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"

if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api/"):
            return JSONResponse(status_code=404, content={"detail": "API endpoint not found"})
        
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "platform": "FairShift - Human-Centered Workforce Intelligence",
            "tagline": "Every hour counts. Every voice matters.",
            "status": "online",
            "api_docs": "/docs",
            "health": "/api/system/health"
        }
