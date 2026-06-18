from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routes import products, customers, orders, dashboard

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the database and create tables on startup
    init_db()
    yield

app = FastAPI(
    title="Inventory & Order Management System API",
    description="Backend API for managing products, customers, orders, and inventory tracking.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(dashboard.router)

# Root Endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the IOMS API. Go to /docs for Swagger documentation."}
