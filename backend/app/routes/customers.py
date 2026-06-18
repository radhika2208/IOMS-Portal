from typing import List
from fastapi import APIRouter, Depends, status
from sqlmodel import Session
from app.database import get_session
from app.models import CustomerCreate, CustomerRead
from app.services.customer_service import CustomerService

router = APIRouter(prefix="/customers", tags=["Customers"])
service = CustomerService()

@router.post("/", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
def create_customer(customer: CustomerCreate, session: Session = Depends(get_session)):
    return service.create_customer(session, customer)

@router.get("/", response_model=List[CustomerRead])
def read_customers(session: Session = Depends(get_session)):
    return service.get_customers(session)

@router.get("/{id}", response_model=CustomerRead)
def read_customer(id: int, session: Session = Depends(get_session)):
    return service.get_customer(session, id)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(id: int, session: Session = Depends(get_session)):
    service.delete_customer(session, id)
    return None
