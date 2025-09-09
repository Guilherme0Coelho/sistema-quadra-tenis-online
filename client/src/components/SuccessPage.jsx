// src/components/SuccessPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const formatDate = (date) => {
    if(!date) return '';
    const adjustedDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return adjustedDate.toISOString().split('T')[0];
}

const SuccessPage = () => {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [bookedDate, setBookedDate] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = new URLSearchParams(location.search).get('session_id');
      const pendingBooking = sessionStorage.getItem('pendingBookingDetails');

      if (sessionId && pendingBooking) {
        try {
          const bookingDetails = JSON.parse(pendingBooking);
          setBookedDate(new Date(bookingDetails.slot.date)); 
          
          await axios.post('http://localhost:3001/api/bookings/verify-session-and-save', {
            session_id: sessionId,
            bookingDetails: bookingDetails,
          });

          setStatus('success');
          sessionStorage.removeItem('pendingBookingDetails'); // Limpa o armazenamento temporário
        } catch (err) {
          console.error("Erro na verificação do pagamento:", err);
          setStatus('error');
        }
      } else {
        setStatus('error');
      }
    };

    verifyPayment();
  }, [location]); // Roda sempre que a URL (com o session_id) muda

  if (status === 'verifying') {
    return <div style={{ textAlign: 'center', marginTop: '4rem' }}><h2>Verificando seu pagamento...</h2></div>;
  }

  if (status === 'error') {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h1>😕 Ops, algo deu errado</h1>
        <p>Não conseguimos confirmar seu agendamento. Por favor, entre em contato conosco.</p>
        <Link to="/">Voltar para o Calendário</Link>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h1>✅ Pagamento Aprovado!</h1>
      <p>Seu agendamento foi confirmado e salvo com sucesso.</p>
      {bookedDate && (
        <Link to={`/?date=${formatDate(bookedDate)}`}>Ver o Calendário Atualizado</Link>
      )}
    </div>
  );
};

export default SuccessPage;