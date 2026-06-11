from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings


# Create the async database engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # Logs all SQL queries in dev
    pool_pre_ping=True,   # Checks connection is alive before using it
    pool_size=10,
    max_overflow=20,
)

# Session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# Base class for all database models
class Base(DeclarativeBase):
    pass


# Dependency — use this in FastAPI route handlers
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()