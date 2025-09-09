// src/index.js
const path = require('path');
// Garante que as variáveis de ambiente sejam carregadas ANTES de qualquer outro código
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const bookingRoutes = require('./routes/bookings');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor finalizado e rodando na porta ${PORT}!`);
});