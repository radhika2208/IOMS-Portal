from typing import List
from fastapi import HTTPException, status
from sqlmodel import Session
from app.models import Order, OrderCreate, OrderItem, OrderRead, OrderItemRead
from app.repositories.order_repository import OrderRepository
from app.repositories.customer_repository import CustomerRepository
from app.repositories.product_repository import ProductRepository

class OrderService:
    def __init__(self):
        self.order_repository = OrderRepository()
        self.customer_repository = CustomerRepository()
        self.product_repository = ProductRepository()

    def map_order_to_read(self, db_order: Order) -> OrderRead:
        items_read = []
        for item in db_order.items:
            items_read.append(OrderItemRead(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                product_name=item.product.name if item.product else "Deleted Product",
                product_price=item.product.price if item.product else 0.0
            ))
        return OrderRead(
            id=db_order.id,
            customer_id=db_order.customer_id,
            total_amount=db_order.total_amount,
            created_at=db_order.created_at,
            customer_name=db_order.customer.full_name if db_order.customer else "Deleted Customer",
            items=items_read
        )

    def get_orders(self, session: Session) -> List[OrderRead]:
        try:
            orders = self.order_repository.get_all(session)
            return [self.map_order_to_read(o) for o in orders]
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
        finally:
            pass

    def get_order(self, session: Session, order_id: int) -> OrderRead:
        try:
            order = self.order_repository.get(session, order_id)
            if not order:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Order with ID {order_id} not found."
                )
            return self.map_order_to_read(order)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
        finally:
            pass

    def create_order(self, session: Session, order_in: OrderCreate) -> OrderRead:
        try:
            customer = self.customer_repository.get(session, order_in.customer_id)
            if not customer:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Customer with ID {order_in.customer_id} does not exist."
                )
                
            if not order_in.items:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="An order must contain at least one item."
                )

            db_order_items = []
            calculated_total = 0.0

            for item in order_in.items:
                product = self.product_repository.get(session, item.product_id)
                if not product:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Product with ID {item.product_id} does not exist."
                    )
                    
                if product.quantity_in_stock < item.quantity:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            f"Insufficient stock for product '{product.name}'. "
                            f"Available: {product.quantity_in_stock}, requested: {item.quantity}."
                        )
                    )

                # Deduct stock
                product.quantity_in_stock -= item.quantity
                self.product_repository.update(session, product)

                calculated_total += product.price * item.quantity

                db_order_item = OrderItem(
                    product_id=item.product_id,
                    quantity=item.quantity
                )
                db_order_items.append(db_order_item)

            db_order = Order(
                customer_id=order_in.customer_id,
                total_amount=calculated_total,
                items=db_order_items
            )
            
            db_order = self.order_repository.create(session, db_order)
            return self.map_order_to_read(db_order)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
        finally:
            pass

    def delete_order(self, session: Session, order_id: int) -> None:
        try:
            db_order = self.order_repository.get(session, order_id)
            if not db_order:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Order with ID {order_id} not found."
                )
                
            # Restore stock
            for item in db_order.items:
                if item.product:
                    item.product.quantity_in_stock += item.quantity
                    self.product_repository.update(session, item.product)
                    
            self.order_repository.delete(session, db_order)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
        finally:
            pass
