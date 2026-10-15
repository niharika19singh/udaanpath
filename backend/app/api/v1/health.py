from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.core.database import get_db

router = APIRouter(tags=["Health & System Probes"])


@router.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    """Liveness probe to confirm the server process is alive and responding."""
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.get("/ready", status_code=status.HTTP_200_OK)
def readiness_check(db: Session = Depends(get_db)):
    """Readiness probe to verify database connectivity and operational readiness."""
    try:
        # Simple DB ping
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {str(exc)}"
        )

    return {
        "status": "ready",
        "database": db_status,
        "llm_enabled": settings.ENABLE_LLM,
        "llm_model": settings.LLM_MODEL if settings.ENABLE_LLM else None,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
