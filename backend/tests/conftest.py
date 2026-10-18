import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import create_app
from app.core.security import create_facilitator_token, hash_password
from app.models.facilitator import FacilitatorAccount

# In-memory SQLite for testing isolation
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()


def _make_client(db_session: Session) -> Generator[TestClient, None, None]:
    app = create_app()

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def facilitator_token(db_session: Session) -> str:
    """Token for a test facilitator account (facilitators may open any student)."""
    account = FacilitatorAccount(
        email="test.facilitator@example.org",
        full_name="Test Facilitator",
        password_hash=hash_password("test-facilitator-password"),
    )
    db_session.add(account)
    db_session.commit()
    token, _ = create_facilitator_token(account.id)
    return token


@pytest.fixture(scope="function")
def client(db_session: Session, facilitator_token: str) -> Generator[TestClient, None, None]:
    """Signed in as a facilitator, so feature tests can reach any student."""
    for test_client in _make_client(db_session):
        test_client.headers["Authorization"] = f"Bearer {facilitator_token}"
        yield test_client


@pytest.fixture(scope="function")
def anon_client(db_session: Session) -> Generator[TestClient, None, None]:
    """No credentials: for access-control tests and student-key flows."""
    yield from _make_client(db_session)
