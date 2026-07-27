import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Resolve absolute path to lms.db located in the same directory as this file to ensure single database instance across working dirs
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
from dotenv import load_dotenv
load_dotenv(os.path.join(_BASE_DIR, '.env'))
_DEFAULT_DB_PATH = os.path.join(_BASE_DIR, "lms.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{_DEFAULT_DB_PATH}")

# SQLite multithreading safety configuration for FastAPI
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Create engine and SessionLocal constructor
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Enforce foreign key constraints inside SQLite
if DATABASE_URL.startswith("sqlite"):
    from sqlalchemy import event
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

# Dependency to provide the DB session per request, ensuring clean closure
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
