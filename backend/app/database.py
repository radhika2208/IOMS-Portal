from sqlmodel import SQLModel, create_engine, Session
from app.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.ENVIRONMENT == "development",
    connect_args=connect_args
)

def init_db():
    # This creates all tables defined in models.py if they do not exist.
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency for getting a database session."""
    with Session(engine) as session:
        yield session
