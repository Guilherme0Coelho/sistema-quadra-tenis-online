// src/components/CancelPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const CancelPage = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h1>❌ Pagamento Cancelado</h1>
      <p>Seu agendamento não foi concluído e você não foi cobrado.</p>
      <p>Pode tentar novamente a qualquer momento.</p>
      <Link to="/">Voltar para o Calendário</Link>
    </div>
  );
};

export default CancelPage;