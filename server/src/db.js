// src/db.js
const { Pool } = require('pg');

// O Pool do 'pg' é inteligente e usa a DATABASE_URL do process.env automaticamente
// se a encontrar. Esta linha garante que ele use essa conexão única.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;