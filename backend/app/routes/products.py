from typing import List
from fastapi import APIRouter, Depends, status
from sqlmodel import Session
from app.database import get_session
from app.models import ProductCreate, ProductUpdate, ProductRead
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])
service = ProductService()

@router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(product: ProductCreate, session: Session = Depends(get_session)):
    return service.create_product(session, product)

@router.get("/", response_model=List[ProductRead])
def read_products(session: Session = Depends(get_session)):
    return service.get_products(session)

@router.get("/{id}", response_model=ProductRead)
def read_product(id: int, session: Session = Depends(get_session)):
    return service.get_product(session, id)

@router.put("/{id}", response_model=ProductRead)
def update_product(id: int, product: ProductUpdate, session: Session = Depends(get_session)):
    return service.update_product(session, id, product)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(id: int, session: Session = Depends(get_session)):
    service.delete_product(session, id)
    return None
