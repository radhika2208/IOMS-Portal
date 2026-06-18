from typing import List
from fastapi import APIRouter, Depends, status
from sqlmodel import Session
from app.database import get_session
from app.models import OrderCreate, OrderRead
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])
service = OrderService()

@router.post("/", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(order: OrderCreate, session: Session = Depends(get_session)):
    return service.create_order(session, order)

@router.get("/", response_model=List[OrderRead])
def read_orders(session: Session = Depends(get_session)):
    return service.get_orders(session)

@router.get("/{id}", response_model=OrderRead)
def read_order(id: int, session: Session = Depends(get_session)):
    return service.get_order(session, id)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(id: int, session: Session = Depends(get_session)):
    service.delete_order(session, id)
    return None
