from typing import Dict
from fastapi import HTTPException, status
from sqlmodel import Session
from app.models import ProductRead
from app.repositories.dashboard_repository import DashboardRepository

class DashboardService:
    def __init__(self):
        self.repository = DashboardRepository()

    def get_dashboard_summary(self, session: Session) -> Dict:
        try:
            total_products = self.repository.get_total_products(session)
            total_customers = self.repository.get_total_customers(session)
            total_orders = self.repository.get_total_orders(session)
            low_stock_products = self.repository.get_low_stock_products(session)

            return {
                "total_products": total_products,
                "total_customers": total_customers,
                "total_orders": total_orders,
                "low_stock_products": [ProductRead.model_validate(p) for p in low_stock_products]
            }
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
        finally:
            pass
