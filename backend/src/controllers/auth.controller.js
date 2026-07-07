const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../database/db');

// POST /api/auth/registro
async function registro(req, res) {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
    }

    if (senha.length < 6) {
        return res.status(400).json({ mensagem: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    try {
        const existente = await pool.query(
            'SELECT id FROM usuarios WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existente.rows.length > 0) {
            return res.status(409).json({ mensagem: 'Este email já está em uso.' });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const { rows } = await pool.query(
            `INSERT INTO usuarios (nome, email, senha_hash)
             VALUES ($1, $2, $3)
             RETURNING id, nome, email, criado_em`,
            [nome.trim(), email.toLowerCase().trim(), senhaHash]
        );

        const usuario = rows[0];
        const token   = gerarToken(usuario);

        return res.status(201).json({
            mensagem: 'Conta criada com sucesso!',
            token,
            usuario: formatarUsuario(usuario)
        });
    } catch (err) {
        console.error('Erro no registro:', err.message);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
}

// POST /api/auth/login
async function login(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ mensagem: 'Email e senha são obrigatórios.' });
    }

    try {
        const { rows } = await pool.query(
            `SELECT id, nome, email, senha_hash, criado_em
             FROM usuarios WHERE email = $1`,
            [email.toLowerCase().trim()]
        );

        if (rows.length === 0) {
            return res.status(401).json({ mensagem: 'Email ou senha incorretos.' });
        }

        const usuario     = rows[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaValida) {
            return res.status(401).json({ mensagem: 'Email ou senha incorretos.' });
        }

        const token = gerarToken(usuario);

        return res.json({
            mensagem: 'Login realizado com sucesso!',
            token,
            usuario: formatarUsuario(usuario)
        });
    } catch (err) {
        console.error('Erro no login:', err.message);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
}

function gerarToken(usuario) {
    return jwt.sign(
        { id: usuario.id, email: usuario.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
}

function formatarUsuario(usuario) {
    return {
        id:       usuario.id,
        nome:     usuario.nome,
        email:    usuario.email,
        criadoEm: usuario.criado_em
    };
}

module.exports = { registro, login };
