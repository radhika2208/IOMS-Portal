from datetime import datetime
from typing import List, Optional
from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel

# =====================================================================
# Product Model
# =====================================================================
class ProductBase(SQLModel):
    name: str = Field(index=True)
    sku: str = Field(unique=True, index=True)
    price: float = Field(default=0.0, ge=0.0)
    quantity_in_stock: int = Field(default=0, ge=0)

class Product(ProductBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class ProductCreate(ProductBase):
    name: str
    sku: str
    price: float = Field(gt=0.0)
    quantity_in_stock: int = Field(ge=0)

class ProductUpdate(SQLModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0.0)
    quantity_in_stock: Optional[int] = Field(default=None, ge=0)

class ProductRead(ProductBase):
    id: int


# =====================================================================
# Customer Model
# =====================================================================
class CustomerBase(SQLModel):
    full_name: str = Field(index=True)
    email: str = Field(unique=True, index=True)
    phone_number: str

class Customer(CustomerBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class CustomerCreate(SQLModel):
    full_name: str
    email: EmailStr
    phone_number: str

class CustomerRead(CustomerBase):
    id: int


# =====================================================================
# Order Item Model
# =====================================================================
class OrderItemBase(SQLModel):
    product_id: int = Field(foreign_key="product.id")
    quantity: int = Field(default=1, gt=0)

class OrderItem(OrderItemBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: Optional[int] = Field(default=None, foreign_key="order.id")

    # Relationships
    order: Optional["Order"] = Relationship(back_populates="items")
    product: Optional[Product] = Relationship()

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemRead(SQLModel):
    id: int
    product_id: int
    quantity: int
    product_name: Optional[str] = None
    product_price: Optional[float] = None


# =====================================================================
# Order Model
# =====================================================================
class OrderBase(SQLModel):
    customer_id: int = Field(foreign_key="customer.id")

class Order(OrderBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    total_amount: float = Field(default=0.0)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    items: List[OrderItem] = Relationship(
        back_populates="order", 
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    customer: Optional[Customer] = Relationship()

class OrderCreate(SQLModel):
    customer_id: int
    items: List[OrderItemCreate]

class OrderRead(SQLModel):
    id: int
    customer_id: int
    total_amount: float
    created_at: datetime
    customer_name: Optional[str] = None
    items: List[OrderItemRead] = []
