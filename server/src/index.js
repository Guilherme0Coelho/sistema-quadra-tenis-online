// src/index.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const bookingRoutes = require('./routes/bookings');
const authRoutes = require('./routes/auth');
const app = express();
const PORT = 3001;
// --- ROTA DE TESTE PARA LOGS ---
app.get('/test-render', (req, res) => {
  console.log('--- ✅✅✅ O LOG NO RENDER ESTÁ FUNCIONANDO! ✅✅✅ ---');
  res.send('Teste de log do servidor online recebido com sucesso!');
});
// 
app.use(cors());
app.use(express.json());
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);
app.listen(PORT, () => {
  console.log(`🚀 Servidor finalizado e rodando na porta ${PORT}!`);
});