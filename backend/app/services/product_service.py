from typing import List
from fastapi import HTTPException, status
from sqlmodel import Session
from app.models import Product, ProductCreate, ProductUpdate
from app.repositories.product_repository import ProductRepository

class ProductService:
    def __init__(self):
        self.repository = ProductRepository()

    def get_products(self, session: Session) -> List[Product]:
        try:
            return self.repository.get_all(session)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
        finally:
            pass

    def get_product(self, session: Session, product_id: int) -> Product:
        try:
            product = self.repository.get(session, product_id)
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID {product_id} not found."
                )
            return product
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
        finally:
            pass

    def create_product(self, session: Session, product_in: ProductCreate) -> Product:
        try:
            existing_product = self.repository.get_by_sku(session, product_in.sku)
            if existing_product:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product with SKU '{product_in.sku}' already exists."
                )
            
            if product_in.quantity_in_stock < 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Product quantity in stock cannot be negative."
                )

            db_product = Product.model_validate(product_in)
            return self.repository.create(session, db_product)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
        finally:
            pass

    def update_product(self, session: Session, product_id: int, product_in: ProductUpdate) -> Product:
        try:
            db_product = self.get_product(session, product_id)

            if product_in.sku is not None and product_in.sku != db_product.sku:
                existing = self.repository.get_by_sku(session, product_in.sku)
                if existing:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Product with SKU '{product_in.sku}' already exists."
                    )
                    
            if product_in.quantity_in_stock is not None and product_in.quantity_in_stock < 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Product quantity in stock cannot be negative."
                )

            product_data = product_in.model_dump(exclude_unset=True)
            for key, value in product_data.items():
                setattr(db_product, key, value)
                
            return self.repository.update(session, db_product)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
        finally:
            pass

    def delete_product(self, session: Session, product_id: int) -> None:
        try:
            db_product = self.get_product(session, product_id)
            self.repository.delete(session, db_product)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
        finally:
            pass
