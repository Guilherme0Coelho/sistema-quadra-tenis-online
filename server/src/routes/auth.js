// src/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');
const bcrypt = require('bcryptjs');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  try {
    const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userQuery.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado. Apenas para administradores.' });
    }

    // ATUALIZAÇÃO AQUI: Adicionamos 'admin_level' ao conteúdo do token
    const tokenPayload = {
      userId: user.id,
      role: user.role,
      admin_level: user.admin_level, // Inclui o nível de permissão
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token });

  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = router;