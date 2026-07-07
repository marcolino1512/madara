# 🔐 Sistema de Autenticação de Usuários

Sistema completo de login e cadastro com frontend em HTML/CSS/JS e backend em Node.js + Express conectado ao PostgreSQL.

---

## 📁 Estrutura de Pastas

```
Html-teste-8/
│
├── 🌐 frontend/                  → Tudo que o usuário vê no navegador
│   ├── index.html                → Página com todos os formulários e estados
│   ├── style.css                 → Estilos visuais (animação, campos, telas)
│   ├── app.js                    → Lógica do frontend (comentada linha a linha)
│   └── vercel.json               → Redireciona /api/* para o ngrok (produção)
│
├── ⚙️ backend/                   → Servidor Node.js + API
│   ├── server.js                 → Ponto de entrada do servidor Express
│   ├── package.json              → Lista de dependências Node.js
│   ├── .env.example              → Modelo de variáveis de ambiente (sem dados reais)
│   └── src/
│       ├── routes/
│       │   └── auth.routes.js    → Define as rotas: POST /registro e POST /login
│       ├── controllers/
│       │   └── auth.controller.js → Lógica de negócio: valida, salva e autentica
│       └── database/
│           ├── db.js             → Conexão com o PostgreSQL
│           └── schema.sql        → Script SQL para criar a tabela de usuários
│
├── 🖼️ img/                       → Imagens usadas no projeto
├── 🎬 video/                     → Vídeos do projeto
├── 🔒 .gitignore                 → Protege o .env de ir para o Git
└── 📖 README.md                  → Esta documentação
```

---

## 🚀 Como Rodar o Projeto

São dois passos: **banco de dados** e **servidor**. Depois é só abrir o navegador.

---

### 🗄️ Passo 1 — Banco de Dados (só na primeira vez)

Abra o **pgAdmin** e execute no Query Tool:

**1a) Criar o banco:**
```sql
CREATE DATABASE auth_db;
```

**1b) Criar a tabela** — selecione o banco `auth_db` e execute:
```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS usuarios (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nome       VARCHAR(100) NOT NULL,
    email      VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    criado_em  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);
```

> 💡 O arquivo já está pronto em `backend/src/database/schema.sql` — pode abrir direto pelo pgAdmin.

---

### ⚙️ Passo 2 — Servidor (só `npm install` na primeira vez)

**2a) Criar o `.env`** — dentro da pasta `backend/`, crie um arquivo chamado `.env` com:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=auth_db
DB_USER=postgres
DB_PASSWORD=SUA_SENHA_DO_POSTGRES_AQUI

JWT_SECRET=qualquer_texto_longo_e_secreto_aqui
JWT_EXPIRES_IN=7d

PORT=3000
```

> 🔐 O `.env` nunca vai para o Git — está protegido pelo `.gitignore`.

**2b) Instalar dependências** (apenas uma vez):
```bash
cd backend
npm install
```

**2c) Rodar o servidor:**
```bash
npm run dev
```

Terminal deve mostrar:
```
🚀 Servidor rodando em http://localhost:3000
✅ Conectado ao PostgreSQL
```

---

### 🌐 Passo 3 — Abrir no navegador

```
http://localhost:3000
```

> ⚠️ Não abra o `index.html` pelo explorador de arquivos — a API não vai funcionar assim.

---

### 🔁 Da segunda vez em diante

Só rodar o servidor:
```bash
cd backend
npm run dev
```

---

## 🌍 Deploy Online (Vercel + ngrok)

A arquitetura de produção funciona assim:

```
Usuário no navegador
        ↓
  Vercel (frontend)          ← hospedado no GitHub/Vercel, sempre online
        ↓  /api/*
  ngrok (túnel)              ← roda no seu PC, expõe a porta 3000
        ↓
  Backend local (Node.js)    ← roda no seu PC com "npm run dev"
        ↓
  PostgreSQL local           ← banco de dados no seu PC
```

> ⚠️ O sistema funciona online **apenas quando seu PC estiver ligado e o servidor rodando**. Quando você desligar, o frontend carrega mas as chamadas à API falham.

---

### 🔧 Configuração única (fazer só uma vez)

#### 1. Instalar o ngrok

Acesse [ngrok.com](https://ngrok.com), crie uma conta gratuita e siga as instruções de instalação para Windows.

Depois conecte sua conta:
```bash
ngrok config add-authtoken SEU_TOKEN_AQUI
```

#### 2. Pegar seu domínio estático gratuito

No painel do ngrok ([dashboard.ngrok.com](https://dashboard.ngrok.com)), vá em **Domains** e copie seu domínio gratuito. Ele tem o formato:

```
alguma-coisa-aleatoria.ngrok-free.app
```

> 💡 Esse domínio é fixo — nunca muda, mesmo reiniciando o ngrok.

#### 3. Atualizar o `frontend/vercel.json` com seu domínio

Abra [frontend/vercel.json](frontend/vercel.json) e substitua `SEU-DOMINIO-AQUI` pelo seu domínio real:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://alguma-coisa-aleatoria.ngrok-free.app/api/:path*"
    }
  ]
}
```

#### 4. Atualizar o `backend/.env` com as URLs de produção

Abra `backend/.env` e preencha as duas últimas linhas:

```env
FRONTEND_URL=https://seu-projeto.vercel.app
NGROK_URL=https://alguma-coisa-aleatoria.ngrok-free.app
```

> O `FRONTEND_URL` você só saberá depois de criar o projeto no Vercel (Passo 5). Pode preencher depois.

#### 5. Subir o código para o GitHub

Crie um repositório no GitHub, suba o projeto e certifique-se de que o `.env` **não** foi junto (o `.gitignore` já protege).

#### 6. Criar projeto no Vercel

1. Acesse [vercel.com](https://vercel.com) e conecte com o GitHub
2. Clique em **Add New Project** → selecione o repositório
3. Em **Root Directory**, clique em **Edit** e selecione a pasta `frontend`
4. Clique em **Deploy**

Pronto — o Vercel vai gerar uma URL como `https://seu-projeto.vercel.app`.

Volte ao `backend/.env`, preencha o `FRONTEND_URL` com essa URL e reinicie o servidor.

---

### ▶️ Como ligar o sistema online (toda vez que quiser usar)

Abra **dois terminais** no seu PC:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — ngrok:**
```bash
ngrok http --domain=alguma-coisa-aleatoria.ngrok-free.app 3000
```

Quando os dois estiverem rodando, qualquer pessoa pode acessar o sistema em:
```
https://seu-projeto.vercel.app
```

---

### ⚡ Como desligar

Feche os dois terminais (ou pressione `Ctrl+C` em cada um). O frontend no Vercel continua acessível, mas as chamadas à API vão falhar até você ligar novamente.

---

## 🖥️ Telas do Sistema

O sistema tem **4 estados** que se alternam na mesma página sem recarregar:

| Estado          | Quando aparece                                        |
|-----------------|-------------------------------------------------------|
| 🔑 **Login**    | Ao entrar no site sem sessão ativa                    |
| 📝 **Cadastro** | Ao clicar em "Registrar-se" no login                  |
| ⏳ **Logando…** | Enquanto aguarda a resposta da API                    |
| 👤 **Logado**   | Após login ou cadastro bem-sucedido                   |

### Fluxo completo:

```
[Abre o site]
      │
      ├── Tem sessão salva? ──→ Sim ──→ 👤 Logado (direto)
      │
      └── Não ──→ 🔑 Login
                     │
                     ├── Clicou "Registrar-se"
                     │       │
                     │       └── 📝 Cadastro (nome, email, senha, repetir senha)
                     │                 │
                     │                 ├── Senhas diferentes → ❌ Erro (sem ir à API)
                     │                 └── Tudo certo → ⏳ Logando… → 👤 Logado
                     │
                     └── Preencheu e clicou "Login"
                               │
                               └── ⏳ Logando… → 👤 Logado
```

---

## 📂 O que cada arquivo faz

### 🌐 `frontend/index.html`
Contém a estrutura HTML dos 4 estados da tela. Cada estado é uma `<div>` ou `<form>` com um `id` único. O JavaScript usa esses ids para mostrar ou esconder cada um.

### 🎨 `frontend/style.css`
Define todo o visual:
- Animação de cor de fundo (`animateBg`)
- Campos de input flutuantes
- Animação do ícone de carregamento (`girar`)
- Animação de entrada da tela logada (`aparecer`)
- Classe `.hidden` para esconder elementos
- Classe `.alto` que aumenta a caixa no formulário de cadastro

### ⚡ `frontend/app.js`
Toda a lógica do frontend — **completamente comentada**. Responsável por:

| Parte                   | O que faz                                                  |
|-------------------------|------------------------------------------------------------|
| `mostrar(elemento)`     | Esconde tudo e exibe apenas o estado escolhido             |
| `mostrarErro(el, msg)`  | Exibe mensagem de erro vermelha no formulário              |
| `limparErro(el)`        | Remove a mensagem de erro                                  |
| Clique em links         | Alterna entre formulário de login e de cadastro            |
| Submit do login         | Envia email+senha para a API e salva a sessão              |
| Submit do cadastro      | Valida senhas, envia para a API e salva a sessão           |
| Botão sair              | Limpa o storage e volta para o login                       |
| `exibirLogado(usuario)` | Preenche a tela de logado com nome, email e ID             |
| `verificarSessaoSalva`  | Ao carregar a página, restaura sessão se o token existir   |

### ⚙️ `backend/server.js`
Inicia o servidor Express. Valida as variáveis do `.env` na inicialização, serve os arquivos do frontend e registra as rotas da API.

### 🗺️ `backend/src/routes/auth.routes.js`
Define os dois endpoints da API e conecta cada um ao seu controller.

### 🧠 `backend/src/controllers/auth.controller.js`
Contém a lógica de negócio:
- **Registro:** verifica se o email já existe, criptografa a senha com bcrypt, salva no banco e retorna o token JWT.
- **Login:** busca o usuário pelo email, compara a senha com bcrypt, retorna o token JWT.

### 🔌 `backend/src/database/db.js`
Cria e exporta a conexão com o PostgreSQL usando as variáveis do `.env`.

### 🗄️ `backend/src/database/schema.sql`
Script SQL que cria a tabela `usuarios`. Execute uma única vez no pgAdmin.

---

## 🔌 Endpoints da API

### `POST /api/auth/registro` — Criar conta

**Body enviado:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "minhasenha123"
}
```

> ⚠️ O campo "repetir senha" é validado só no frontend e **nunca é enviado** para a API.

**Resposta de sucesso (201):**
```json
{
  "mensagem": "Conta criada com sucesso!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5...",
  "usuario": {
    "id": "a1b2c3d4-e5f6-...",
    "nome": "João Silva",
    "email": "joao@email.com",
    "criadoEm": "2026-06-15T20:00:00.000Z"
  }
}
```

---

### `POST /api/auth/login` — Fazer login

**Body enviado:**
```json
{
  "email": "joao@email.com",
  "senha": "minhasenha123"
}
```

**Resposta de sucesso (200):**
```json
{
  "mensagem": "Login realizado com sucesso!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5...",
  "usuario": {
    "id": "a1b2c3d4-e5f6-...",
    "nome": "João Silva",
    "email": "joao@email.com",
    "criadoEm": "2026-06-15T20:00:00.000Z"
  }
}
```

---

### `GET /api/health` — Verificar se o servidor está rodando

**Resposta (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-06-15T20:00:00.000Z"
}
```

---

## 🗄️ Banco de Dados

### Tabela `usuarios`

| Coluna       | Tipo          | Descrição                              |
|--------------|---------------|----------------------------------------|
| `id`         | UUID          | ID único gerado automaticamente        |
| `nome`       | VARCHAR(100)  | Nome do usuário                        |
| `email`      | VARCHAR(255)  | Email único (não pode repetir)         |
| `senha_hash` | VARCHAR(255)  | Senha criptografada com bcrypt         |
| `criado_em`  | TIMESTAMP     | Data e hora do cadastro                |

---

## 🛡️ Segurança

```
.env.example  ✅ → vai para o git (só tem os nomes das variáveis, sem valores)
.env          ❌ → NUNCA vai para o git (está no .gitignore)
```

- ✅ **Senhas criptografadas** com bcrypt — nunca salvas em texto puro no banco
- ✅ **JWT** com expiração de 7 dias — token inválido automaticamente após isso
- ✅ **"Lembre-me"** marcado → sessão em `localStorage` (persiste ao fechar o browser)
- ✅ **"Lembre-me"** desmarcado → sessão em `sessionStorage` (some ao fechar o browser)
- ✅ **IDs em UUID** — não sequenciais, impossíveis de adivinhar
- ✅ **Confirmação de senha** validada no frontend antes de qualquer requisição
- ✅ **Servidor recusa iniciar** se alguma variável do `.env` estiver faltando

---

## 📦 Dependências do Backend

| Pacote          | Função                                      |
|-----------------|---------------------------------------------|
| `express`       | Framework para criar o servidor e as rotas  |
| `pg`            | Driver para conectar ao PostgreSQL          |
| `bcryptjs`      | Criptografa e compara senhas                |
| `jsonwebtoken`  | Gera e valida tokens JWT                    |
| `dotenv`        | Lê as variáveis do arquivo `.env`           |
| `cors`          | Permite que o frontend acesse a API         |
| `nodemon`       | Reinicia o servidor ao salvar (só em dev)   |
