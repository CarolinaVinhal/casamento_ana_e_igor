-- =============================================================================
-- BANCO DE DADOS - CASAMENTO ANA & IGOR (v2)
-- Referência. O backend cria as tabelas sozinho (models.py) e carrega os dados
-- iniciais com seed.py + gifts_seed.json. Use este arquivo só se quiser criar
-- o banco manualmente (sintaxe SQLite; no PostgreSQL troque
-- "INTEGER PRIMARY KEY AUTOINCREMENT" por "SERIAL PRIMARY KEY").
-- =============================================================================

CREATE TABLE IF NOT EXISTS guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30),
    email VARCHAR(150),
    group_name VARCHAR(150),                         -- convite (casal/família): confirmam juntos
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rsvps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guest_id INTEGER NOT NULL UNIQUE REFERENCES guests(id) ON DELETE CASCADE,
    guest_name VARCHAR(150) NOT NULL,
    status VARCHAR(20) DEFAULT 'CONFIRMED',          -- CONFIRMED | CANCELLED
    confirmed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gifts (
    id INTEGER PRIMARY KEY,                           -- mesmos IDs do app.js
    title VARCHAR(150) NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category VARCHAR(20) DEFAULT 'mid',               -- low | mid | high
    type VARCHAR(20) DEFAULT 'casa',                  -- casa | cozinha | viagem | zoeira | matilha
    multi BOOLEAN DEFAULT 0,                          -- 1 = aceita várias contribuições
    image_url VARCHAR(300),
    is_claimed BOOLEAN DEFAULT 0,
    claimed_at DATETIME
);

CREATE TABLE IF NOT EXISTS contributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gift_id INTEGER NOT NULL REFERENCES gifts(id),
    giver_name VARCHAR(150) NOT NULL,
    amount REAL NOT NULL,
    message TEXT,
    payment_method VARCHAR(30) DEFAULT 'PIX',          -- PIX | CARTAO
    status VARCHAR(20) DEFAULT 'PENDING',             -- PENDING | PAID | REJECTED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    confirmed_at DATETIME
);

CREATE TABLE IF NOT EXISTS guestbook_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_name VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    dog_name VARCHAR(40),
    couple_reply TEXT,
    is_hidden BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
