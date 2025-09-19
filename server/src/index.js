// src/index.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const bookingRoutes = require('./routes/bookings');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = 3001;

// --- ROTA DE TESTE DE VARIÁVEIS DE AMBIENTE ---
app.get('/debug-env', (req, res) => {
  console.log('\n--- INICIANDO VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE ---');
  
  // Verifica a chave do Stripe de forma segura, mostrando apenas o início
  console.log(
    'Valor da STRIPE_SECRET_KEY:', 
    process.env.STRIPE_SECRET_KEY 
      ? `Encontrada, começa com: ${String(process.env.STRIPE_SECRET_KEY).substring(0, 8)}...` 
      : '!!! NÃO ENCONTRADA / UNDEFINED !!!'
  );

  console.log(
    'Valor da DATABASE_URL:', 
    process.env.DATABASE_URL ? 'Encontrada e definida.' : '!!! NÃO ENCONTRADA / UNDEFINED !!!'
  );
  
  console.log(
    'Valor da JWT_SECRET:', 
    process.env.JWT_SECRET ? 'Encontrada e definida.' : '!!! NÃO ENCONTRADA / UNDEFINED !!!'
  );

  console.log('--- VERIFICAÇÃO CONCLUÍDA ---\n');
  res.send('Variáveis de ambiente verificadas. Cheque os logs no Render.com.');
});
// ---------------------------------------------

app.use(cors());
app.use(express.json());

app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor finalizado e rodando na porta ${PORT}!`);
});