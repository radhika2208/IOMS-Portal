from typing import Dict
from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.database import get_session
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])
service = DashboardService()

@router.get("/summary", response_model=Dict)
def read_dashboard_summary(session: Session = Depends(get_session)):
    return service.get_dashboard_summary(session)
