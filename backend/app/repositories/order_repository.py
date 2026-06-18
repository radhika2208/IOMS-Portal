from typing import List, Optional
from sqlmodel import Session, select
from sqlalchemy.exc import SQLAlchemyError
from app.models import Order

class OrderRepository:
    def get(self, session: Session, order_id: int) -> Optional[Order]:
        try:
            return session.get(Order, order_id)
        except SQLAlchemyError as e:
            raise ValueError(f"Database error while fetching order by ID: {e}")

    def get_all(self, session: Session) -> List[Order]:
        try:
            statement = select(Order).order_by(Order.created_at.desc())
            return list(session.exec(statement).all())
        except SQLAlchemyError as e:
            raise ValueError(f"Database error while fetching orders: {e}")

    def create(self, session: Session, order: Order) -> Order:
        try:
            session.add(order)
            session.commit()
            session.refresh(order)
            return order
        except SQLAlchemyError as e:
            session.rollback()
            raise ValueError(f"Database error while creating order: {e}")

    def delete(self, session: Session, order: Order) -> None:
        try:
            session.delete(order)
            session.commit()
        except SQLAlchemyError as e:
            session.rollback()
            raise ValueError(f"Database error while deleting order: {e}")
