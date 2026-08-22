"""ProductionPulse Backend - FastAPI Application
Built for Agentic Cinema: The Blockbuster Hackathon (ClickHouse Track)
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import projects, query

settings = get_settings()

app = FastAPI(
    title="ProductionPulse",
    description="AI-powered film production analytics. Upload a script, get instant budget, schedule, and insights.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS
origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(projects.router)
app.include_router(query.router)

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "productionpulse-api",
        "version": "1.0.0",
        "track": "clickhouse"
    }

@app.get("/")
async def root():
    """Root redirect to docs."""
    return {"message": "ProductionPulse API. Visit /api/docs for documentation."}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=settings.app_env == "development")
