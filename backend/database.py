import os

# Carrega o arquivo .env (se existir) antes de ler as configurações
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))
except ImportError:
    pass
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# Banco SQLite local por padrão (fácil troca para PostgreSQL via variável de ambiente DATABASE_URL)
SQLALCHEMY_DATABASE_URL = (os.getenv("DATABASE_URL") or "").strip()
# Aceita colar o comando inteiro do Neon (psql 'postgresql://...') sem quebrar
if SQLALCHEMY_DATABASE_URL.startswith("psql "):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL[5:].strip()
SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.strip("'\"")
if not SQLALCHEMY_DATABASE_URL:
    if os.getenv("RENDER"):
        print("[AVISO] DATABASE_URL vazio no Render: usando SQLite temporário (os dados SOMEM a cada deploy). Cole a URL do Neon!")
    SQLALCHEMY_DATABASE_URL = "sqlite:///./wedding.db"

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # Neon/Render: aceita "postgres://" antigo e testa a conexão antes de usar
    # (o Neon "dorme" e fecha conexões paradas; sem isso, a 1ª requisição dá erro)
    if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True, pool_recycle=300)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency para obter a sessão do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
