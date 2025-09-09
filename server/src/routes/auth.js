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
      console.log(`\n--- DIAGNÓSTICO: Tentativa de login com email não encontrado: ${email} ---\n`);
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }
    
    // --- DIAGNÓSTICO FINAL ---
    console.log("\n--- DADOS RECEBIDOS NA ROTA DE LOGIN ---");
    console.log("Senha digitada no formulário:", `"${password}"`);
    console.log("Hash salvo no banco de dados:", `"${user.password}"`);
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    console.log("As senhas batem? (bcrypt.compareSync):", isPasswordValid);
    console.log("-----------------------------------------");

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado. Apenas para administradores.' });
    }

    const tokenPayload = { userId: user.id, role: user.role, admin_level: user.admin_level };
    const token = jwt.sign( tokenPayload, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = router;