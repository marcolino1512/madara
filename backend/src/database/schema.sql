-- =============================================
-- Schema do banco de dados de autenticação
-- Execute este arquivo no PostgreSQL antes de
-- iniciar o servidor pela primeira vez.
-- =============================================

-- Extensão necessária para gerar UUIDs automáticos
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nome       VARCHAR(100) NOT NULL,
    email      VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    criado_em  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Índice para acelerar buscas por email (login)
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (email);
