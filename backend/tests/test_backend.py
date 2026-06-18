import os
import sys

# Inject in-memory SQLite URL before importing database module
os.environ["DATABASE_URL"] = "sqlite://"

# Add the parent directory (backend) to sys.path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import HTTPException
from sqlmodel import SQLModel, create_engine, Session, select

from app.database import engine
from app import crud
from app.models import (
    Product, ProductCreate, ProductUpdate,
    Customer, CustomerCreate,
    Order, OrderCreate, OrderItemCreate
)

def setup_db():
    # Force creation of tables on the in-memory database
    SQLModel.metadata.create_all(engine)

def teardown_db():
    SQLModel.metadata.drop_all(engine)

def test_full_business_workflow():
    setup_db()
    with Session(engine) as session:
        # =============================================================
        # 1. Test Product Operations & Constraints
        # =============================================================
        
        # Test: Create valid product
        p1_in = ProductCreate(name="Laptop", sku="LAP-001", price=999.99, quantity_in_stock=10)
        p1 = crud.create_product(session, p1_in)
        assert p1.id is not None
        assert p1.name == "Laptop"
        assert p1.sku == "LAP-001"
        assert p1.price == 999.99
        assert p1.quantity_in_stock == 10

        # Test: Unique SKU constraint
        try:
            p2_in = ProductCreate(name="Laptop Pro", sku="LAP-001", price=1299.99, quantity_in_stock=5)
            crud.create_product(session, p2_in)
            assert False, "Should have raised HTTPException for duplicate SKU"
        except HTTPException as e:
            assert e.status_code == 400
            assert "already exists" in e.detail

        # Test: Product quantity cannot be negative (Pydantic ValidationError)
        try:
            ProductCreate(name="Mouse", sku="MOU-001", price=25.00, quantity_in_stock=-5)
            assert False, "Should have raised ValidationError for negative stock quantity"
        except Exception as e:
            assert "ValidationError" in e.__class__.__name__ or "greater_than_equal" in str(e)

        # Create secondary product
        p2_in = ProductCreate(name="Mouse", sku="MOU-001", price=25.00, quantity_in_stock=50)
        p2 = crud.create_product(session, p2_in)

        # =============================================================
        # 2. Test Customer Operations & Constraints
        # =============================================================

        # Test: Create valid customer
        c1_in = CustomerCreate(full_name="Alice Smith", email="alice@example.com", phone_number="1234567890")
        c1 = crud.create_customer(session, c1_in)
        assert c1.id is not None
        assert c1.email == "alice@example.com"

        # Test: Unique email constraint
        try:
            c2_in = CustomerCreate(full_name="Alice Jones", email="alice@example.com", phone_number="0987654321")
            crud.create_customer(session, c2_in)
            assert False, "Should have raised HTTPException for duplicate email"
        except HTTPException as e:
            assert e.status_code == 400
            assert "already exists" in e.detail

        # =============================================================
        # 3. Test Order Operations & Constraints
        # =============================================================

        # Test: Order cannot be placed if inventory is insufficient
        try:
            o1_in = OrderCreate(
                customer_id=c1.id,
                items=[OrderItemCreate(product_id=p1.id, quantity=15)]  # Laptop only has 10 in stock
            )
            crud.create_order(session, o1_in)
            assert False, "Should have raised HTTPException for insufficient stock"
        except HTTPException as e:
            assert e.status_code == 400
            assert "Insufficient stock" in e.detail

        # Test: Successful Order placing (reducing stock & automatic total amount calculation)
        o1_in = OrderCreate(
            customer_id=c1.id,
            items=[
                OrderItemCreate(product_id=p1.id, quantity=2),  # 2 * 999.99 = 1999.98
                OrderItemCreate(product_id=p2.id, quantity=5)   # 5 * 25.00  = 125.00
            ]                                                   # Total = 2124.98
        )
        o1 = crud.create_order(session, o1_in)
        assert o1.id is not None
        assert o1.total_amount == 2124.98
        
        # Verify inventory has reduced
        session.refresh(p1)
        session.refresh(p2)
        assert p1.quantity_in_stock == 8   # 10 - 2
        assert p2.quantity_in_stock == 45  # 50 - 5

        # Test: Order deletion / cancel restores stock levels
        crud.delete_order(session, o1)
        session.refresh(p1)
        session.refresh(p2)
        assert p1.quantity_in_stock == 10  # Restored
        assert p2.quantity_in_stock == 50  # Restored

        # Ensure order record is deleted
        assert crud.get_order(session, o1.id) is None

        print("SUCCESS: All backend unit tests passed.")

    teardown_db()

if __name__ == "__main__":
    test_full_business_workflow()
