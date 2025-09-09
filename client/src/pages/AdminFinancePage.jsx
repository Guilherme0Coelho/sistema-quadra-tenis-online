// src/pages/AdminFinancePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminFinancePage.css';

const statusTranslations = { paid: 'Pago', pending: 'Pendente', not_required: 'Não Requerido', avulso: 'Avulso', mensalista: 'Mensalista', reposicao: 'Reposição' };

const AdminFinancePage = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const token = localStorage.getItem('token');

  const fetchFinanceData = async (year, month) => {
    setIsLoading(true); setError(null);
    try {
      const url = `http://localhost:3001/api/bookings/finance?year=${year}&month=${month}`;
      const response = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
      setPayments(response.data);
    } catch (error) { setError("Não foi possível carregar os dados financeiros."); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchFinanceData(currentDate.getFullYear(), currentDate.getMonth()); }, [currentDate]);

  const handleMonthChange = (offset) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate); newDate.setDate(1);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const handleMarkAsPaid = async (booking) => {
    const priceString = prompt(`Registrar pagamento para ${booking.guest_name || booking.user_name || 'Avulso'}. Valor pago:`, booking.price || '35.00');
    const price = parseFloat(priceString);
    if (priceString === null) return;
    if (isNaN(price) || price < 0) { alert("Valor inválido."); return; }
    try {
      await axios.put(`http://localhost:3001/api/bookings/admin/${booking.id}`, { paymentStatus: 'paid', price: price }, { headers: { 'Authorization': `Bearer ${token}` } });
      fetchFinanceData(currentDate.getFullYear(), currentDate.getMonth());
    } catch (error) { alert("Erro ao atualizar pagamento."); }
  };

  const totalReceived = payments.reduce((sum, p) => p.payment_status === 'paid' ? sum + parseFloat(p.price || 0) : sum, 0);
  const totalPending = payments.filter(p => p.payment_status === 'pending').length;

  return (
    <div className="finance-page">
      <h2>Gerenciamento Financeiro</h2>
      <div className="finance-controls">
        <button onClick={() => handleMonthChange(-1)}>‹ Mês Anterior</button>
        <h3>{currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h3>
        <button onClick={() => handleMonthChange(1)}>Próximo Mês ›</button>
      </div>
      <div className="finance-summary">
        <div className="summary-card received"><h4>Total Arrecadado</h4><p>R$ {totalReceived.toFixed(2)}</p></div>
        <div className="summary-card pending"><h4>Pagamentos Pendentes</h4><p>{totalPending} agendamento(s)</p></div>
      </div>
      <div className="table-wrapper">
        {isLoading ? <p>Carregando...</p> : error ? <p className='error-message'>{error}</p> : (
          <table className="finance-table">
            <thead><tr><th>Data</th><th>Cliente</th><th>Tipo</th><th>Valor</th><th>Status</th><th>Ação</th></tr></thead>
            <tbody>
              {payments.length > 0 ? payments.map(payment => (
                <tr key={payment.id}>
                  <td>{new Date(payment.start_time).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                  <td>{payment.guest_name || payment.user_name || 'Avulso'}</td>
                  <td>{statusTranslations[payment.booking_type]}</td>
                  <td>R$ {parseFloat(payment.price || 0).toFixed(2)}</td>
                  <td><span className={`status-pill ${payment.payment_status}`}>{statusTranslations[payment.payment_status]}</span></td>
                  <td>{payment.payment_status === 'pending' && (<button className="btn-paid" onClick={() => handleMarkAsPaid(payment)}>Marcar como Pago</button>)}</td>
                </tr>
              )) : ( <tr><td colSpan="6" style={{textAlign: 'center', padding: '1rem'}}>Nenhum registro encontrado.</td></tr> )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default AdminFinancePage;