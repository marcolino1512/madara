const express    = require('express');
const router     = express.Router();
const { registro, login } = require('../controllers/auth.controller');

// POST /api/auth/registro  → cria novo usuário
router.post('/registro', registro);

// POST /api/auth/login     → autentica usuário existente
router.post('/login', login);

module.exports = router;
