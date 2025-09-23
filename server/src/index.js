// src/index.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const bookingRoutes = require('./routes/bookings');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = 3001;

// --- CONFIGURAÇÃO DE CORS ESPECÍFICA E SEGURA ---
const corsOptions = {
  // A origem permitida é o endereço do seu site na Vercel
  origin: 'https://sistema-quadra-tenis-online.vercel.app',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
// ----------------------------------------

app.use(express.json());

// Rota de teste para verificar se o servidor está no ar
app.get('/', (req, res) => {
  res.send('API do sistema de quadras está no ar!');
});

app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor finalizado e rodando na porta ${PORT}!`);
});