require('dotenv').config();

// Garante que variáveis críticas existam antes de qualquer coisa
const VARIAVEIS_OBRIGATORIAS = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];
const faltando = VARIAVEIS_OBRIGATORIAS.filter(v => !process.env[v]);
if (faltando.length > 0) {
    console.error(`❌ Variáveis de ambiente faltando no .env: ${faltando.join(', ')}`);
    console.error('   Copie .env.example para .env e preencha os valores.');
    process.exit(1);
}

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const authRoutes = require('./src/routes/auth.routes');

const app  = express();
const PORT = process.env.PORT || 3000;

// Origens permitidas: localhost (dev), Vercel (produção) e ngrok (tunnel)
// Adicione FRONTEND_URL e NGROK_URL no .env com as suas URLs reais.
const origensPermitidas = [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
    process.env.NGROK_URL,
].filter(Boolean); // remove entradas vazias caso as variáveis não estejam definidas

app.use(cors({
    origin: origensPermitidas,
    methods: ['GET', 'POST'],
}));
app.use(express.json());

// Serve os arquivos estáticos do frontend (inclui frontend/img/)
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas da API
app.use('/api/auth', authRoutes);

// Rota de health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📂 Frontend disponível em http://localhost:${PORT}`);
    console.log(`🔌 API disponível em http://localhost:${PORT}/api`);
});
