from typing import List, Optional
from sqlmodel import Session, select
from sqlalchemy.exc import SQLAlchemyError
from app.models import Product

class ProductRepository:
    def get_by_sku(self, session: Session, sku: str) -> Optional[Product]:
        try:
            statement = select(Product).where(Product.sku == sku)
            return session.exec(statement).first()
        except SQLAlchemyError as e:
            raise ValueError(f"Database error while fetching product by SKU: {e}")

    def get(self, session: Session, product_id: int) -> Optional[Product]:
        try:
            return session.get(Product, product_id)
        except SQLAlchemyError as e:
            raise ValueError(f"Database error while fetching product by ID: {e}")

    def get_all(self, session: Session) -> List[Product]:
        try:
            statement = select(Product).order_by(Product.name)
            return list(session.exec(statement).all())
        except SQLAlchemyError as e:
            raise ValueError(f"Database error while fetching products: {e}")

    def create(self, session: Session, product: Product) -> Product:
        try:
            session.add(product)
            session.commit()
            session.refresh(product)
            return product
        except SQLAlchemyError as e:
            session.rollback()
            raise ValueError(f"Database error while creating product: {e}")

    def update(self, session: Session, product: Product) -> Product:
        try:
            session.add(product)
            session.commit()
            session.refresh(product)
            return product
        except SQLAlchemyError as e:
            session.rollback()
            raise ValueError(f"Database error while updating product: {e}")

    def delete(self, session: Session, product: Product) -> None:
        try:
            session.delete(product)
            session.commit()
        except SQLAlchemyError as e:
            session.rollback()
            raise ValueError(f"Database error while deleting product: {e}")
