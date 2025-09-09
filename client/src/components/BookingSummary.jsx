// src/components/BookingSummary.jsx
import React from 'react';
import './BookingSummary.css';

const BookingSummary = ({ cart, selectedDate, onConfirm, onClear }) => {
  if (cart.length === 0) {
    return (
      <div className="summary-container">
        <h3>Resumo da Reserva</h3>
        <p className="placeholder-text">Selecione um ou mais horários disponíveis na agenda para iniciar sua reserva.</p>
      </div>
    );
  }

  const sortedCart = [...cart].sort((a,b) => a.localeCompare(b));
  const startTime = sortedCart[0];
  const lastSlot = sortedCart[sortedCart.length - 1];
  
  const [lastHour, lastMinute] = lastSlot.split(':').map(Number);
  let endHour = lastHour, endMinute = lastMinute + 30;
  if (endMinute >= 60) { endHour += 1; endMinute -= 60; }
  const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

  const duration = cart.length * 30;
  // CORREÇÃO AQUI: O preço agora é 50.00 por 30 minutos
  const pricePer30Min = 50.00;
  const totalPrice = (cart.length * pricePer30Min).toFixed(2);

  return (
    <div className="summary-container active">
      <h3>Resumo da Reserva</h3>
      <div className="summary-details">
        <p><strong>Data:</strong> {selectedDate.toLocaleDateString('pt-BR')}</p>
        <p><strong>Início:</strong> {startTime}</p>
        <p><strong>Fim:</strong> {endTime}</p>
        <p><strong>Duração:</strong> {duration} minutos</p>
        <p className="summary-price"><strong>Total: R$ {totalPrice}</strong></p>
      </div>
      <div className="summary-actions">
        <button className="btn-confirm" onClick={onConfirm}>Confirmar e Pagar</button>
        <button className="btn-clear" onClick={onClear}>Limpar Seleção</button>
      </div>
    </div>
  );
};

export default BookingSummary;