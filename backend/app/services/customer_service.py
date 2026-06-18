from typing import List
from fastapi import HTTPException, status
from sqlmodel import Session
from app.models import Customer, CustomerCreate
from app.repositories.customer_repository import CustomerRepository

class CustomerService:
    def __init__(self):
        self.repository = CustomerRepository()

    def get_customers(self, session: Session) -> List[Customer]:
        try:
            return self.repository.get_all(session)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
        finally:
            pass

    def get_customer(self, session: Session, customer_id: int) -> Customer:
        try:
            customer = self.repository.get(session, customer_id)
            if not customer:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Customer with ID {customer_id} not found."
                )
            return customer
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
        finally:
            pass

    def create_customer(self, session: Session, customer_in: CustomerCreate) -> Customer:
        try:
            existing_customer = self.repository.get_by_email(session, customer_in.email)
            if existing_customer:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Customer with email '{customer_in.email}' already exists."
                )
                
            db_customer = Customer.model_validate(customer_in)
            return self.repository.create(session, db_customer)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
        finally:
            pass

    def delete_customer(self, session: Session, customer_id: int) -> None:
        try:
            db_customer = self.get_customer(session, customer_id)
            self.repository.delete(session, db_customer)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
        finally:
            pass
