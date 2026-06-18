from typing import List, Dict
from sqlmodel import Session, select
from sqlalchemy.exc import SQLAlchemyError
from app.models import Product, Customer, Order

class DashboardRepository:
    def get_total_products(self, session: Session) -> int:
        try:
            return session.query(Product).count()
        except SQLAlchemyError as e:
            raise ValueError(f"Database error while fetching total products: {e}")

    def get_total_customers(self, session: Session) -> int:
        try:
            return session.query(Customer).count()
        except SQLAlchemyError as e:
            raise ValueError(f"Database error while fetching total customers: {e}")

    def get_total_orders(self, session: Session) -> int:
        try:
            return session.query(Order).count()
        except SQLAlchemyError as e:
            raise ValueError(f"Database error while fetching total orders: {e}")

    def get_low_stock_products(self, session: Session, threshold: int = 10) -> List[Product]:
        try:
            statement = select(Product).where(Product.quantity_in_stock < threshold).order_by(Product.quantity_in_stock)
            return list(session.exec(statement).all())
        except SQLAlchemyError as e:
            raise ValueError(f"Database error while fetching low stock products: {e}")
