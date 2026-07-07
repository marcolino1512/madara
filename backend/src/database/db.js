const { Pool } = require('pg');

const pool = new Pool({
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

pool.on('connect', () => {
    console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', err => {
    console.error('❌ Erro na conexão com o PostgreSQL:', err.message);
});

module.exports = pool;
