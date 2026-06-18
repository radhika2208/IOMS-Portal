from typing import List, Optional
from sqlmodel import Session, select
from sqlalchemy.exc import SQLAlchemyError
from app.models import Customer

class CustomerRepository:
    def get_by_email(self, session: Session, email: str) -> Optional[Customer]:
        try:
            statement = select(Customer).where(Customer.email == email)
            return session.exec(statement).first()
        except SQLAlchemyError as e:
            raise ValueError(f"Database error while fetching customer by email: {e}")

    def get(self, session: Session, customer_id: int) -> Optional[Customer]:
        try:
            return session.get(Customer, customer_id)
        except SQLAlchemyError as e:
            raise ValueError(f"Database error while fetching customer by ID: {e}")

    def get_all(self, session: Session) -> List[Customer]:
        try:
            statement = select(Customer).order_by(Customer.full_name)
            return list(session.exec(statement).all())
        except SQLAlchemyError as e:
            raise ValueError(f"Database error while fetching customers: {e}")

    def create(self, session: Session, customer: Customer) -> Customer:
        try:
            session.add(customer)
            session.commit()
            session.refresh(customer)
            return customer
        except SQLAlchemyError as e:
            session.rollback()
            raise ValueError(f"Database error while creating customer: {e}")

    def update(self, session: Session, customer: Customer) -> Customer:
        try:
            session.add(customer)
            session.commit()
            session.refresh(customer)
            return customer
        except SQLAlchemyError as e:
            session.rollback()
            raise ValueError(f"Database error while updating customer: {e}")

    def delete(self, session: Session, customer: Customer) -> None:
        try:
            session.delete(customer)
            session.commit()
        except SQLAlchemyError as e:
            session.rollback()
            raise ValueError(f"Database error while deleting customer: {e}")
