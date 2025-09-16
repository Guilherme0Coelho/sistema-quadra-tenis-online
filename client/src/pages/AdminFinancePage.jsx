// src/pages/AdminFinancePage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import './AdminFinancePage.css';

const statusTranslations = { paid: 'Pago', pending: 'Pendente', not_required: 'Não Requerido', avulso: 'Avulso', mensalista: 'Mensalista', reposicao: 'Reposição' };

const AdminFinancePage = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expandedRows, setExpandedRows] = useState({});
  const token = localStorage.getItem('token');
  const API_BASE_URL = 'https://arena-floriano.onrender.com';

  const fetchFinanceData = useCallback(async () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    setIsLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}/api/bookings/finance?year=${year}&month=${month}`;
      const response = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
      setPayments(response.data);
    } catch (error) {
      setError("Não foi possível carregar os dados financeiros.");
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, token]);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  const handleMonthChange = (offset) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(1);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const handleMarkSingleAsPaid = async (booking) => {
    const priceString = prompt(`Registrar pagamento para ${booking.guest_name || booking.user_name} (apenas este dia). Valor:`, booking.price || '50.00');
    const price = parseFloat(priceString);
    if (priceString === null) return;
    if (isNaN(price)) {
      alert("Valor inválido.");
      return;
    }
    try {
      await axios.put(`${API_BASE_URL}/api/bookings/admin/${booking.id}`, { paymentStatus: 'paid', price: price }, { headers: { 'Authorization': `Bearer ${token}` } });
      fetchFinanceData();
    } catch (error) {
      alert("Erro ao atualizar pagamento.");
    }
  };
  
  const handleMarkMonthAsPaid = async (group) => {
      const ruleId = group.children[0].parent_booking_id;
      const pricePerClass = group.totalPrice > 0 && group.count > 0 ? group.totalPrice / group.count : 50;
      const priceString = prompt(`Registrar pagamento para o mês de ${group.name}.\n\nIsso marcará TODAS as aulas deste mês como pagas.\n\nValor POR AULA:`, pricePerClass.toFixed(2));
      const price = parseFloat(priceString);
      if (priceString === null) return;
      if (isNaN(price)) {
        alert("Valor inválido.");
        return;
      }
      try {
          await axios.post(`${API_BASE_URL}/api/bookings/admin/bulk-status-update`, {
              parent_booking_id: ruleId,
              year: currentDate.getFullYear(),
              month: currentDate.getMonth(),
              payment_status: 'paid',
              price: price
          }, { headers: { 'Authorization': `Bearer ${token}` } });
          fetchFinanceData();
      } catch (error) {
          alert("Erro ao atualizar pagamentos do mês.");
      }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Tem certeza de que deseja excluir este agendamento permanentemente? A ação removerá o registro da agenda e do financeiro.')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/bookings/admin/${bookingId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        fetchFinanceData();
      } catch (err) {
        alert('Erro ao excluir o agendamento.');
      }
    }
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const groupedPayments = useMemo(() => {
    const groups = {};
    const individuals = [];
    payments.forEach(p => {
      if (p.booking_type === 'mensalista' && p.parent_booking_id) {
        if (!groups[p.parent_booking_id]) {
          groups[p.parent_booking_id] = {
            name: p.guest_name || p.user_name || "Mensalista",
            type: 'Mensalista',
            count: 0,
            totalPrice: 0,
            children: []
          };
        }
        groups[p.parent_booking_id].count++;
        groups[p.parent_booking_id].totalPrice += parseFloat(p.price || 0);
        groups[p.parent_booking_id].children.push(p);
      } else {
        individuals.push(p);
      }
    });
    return [...Object.values(groups), ...individuals];
  }, [payments]);

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
            <thead><tr><th>Cliente/Data</th><th>Tipo</th><th>Preço Total</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {groupedPayments.map((item) => {
                const isGroup = !!item.children;
                if (isGroup) {
                  const groupId = item.children[0].parent_booking_id;
                  const isExpanded = expandedRows[groupId];
                  return (
                    <React.Fragment key={`group-${groupId}`}>
                      <tr className="group-row" onClick={() => toggleRow(groupId)}>
                        <td><strong>{item.name} ({item.count} aulas)</strong></td>
                        <td>{item.type}</td>
                        <td>R$ {item.totalPrice.toFixed(2)}</td>
                        <td><button className="btn-paid-finance" onClick={(e) => { e.stopPropagation(); handleMarkMonthAsPaid(item); }}>Pagar Mês</button></td>
                        <td className="action-text">{isExpanded ? 'Ocultar ▼' : 'Ver dias ►'}</td>
                      </tr>
                      {isExpanded && item.children.map(payment => (
                        <tr key={payment.id} className="child-row">
                          <td className="child-data">{new Date(payment.start_time).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                          <td>{statusTranslations[payment.booking_type]}</td>
                          <td>R$ {parseFloat(payment.price || 0).toFixed(2)}</td>
                          <td><span className={`status-pill ${payment.payment_status}`}>{statusTranslations[payment.payment_status]}</span></td>
                          <td>
                            <div className="actions-cell">
                                {payment.payment_status === 'pending' && <button className="btn-paid-finance" onClick={() => handleMarkSingleAsPaid(payment)}>Pagar</button>}
                                <button className="btn-delete-finance" onClick={() => handleDeleteBooking(payment.id)}>Excluir</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                } else {
                  return (
                    <tr key={item.id}>
                      <td><strong>{item.guest_name || item.user_name || 'Avulso'}</strong> <br/> <span className="date-text">{new Date(item.start_time).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span></td>
                      <td>{statusTranslations[item.booking_type]}</td>
                      <td>R$ {parseFloat(item.price || 0).toFixed(2)}</td>
                      <td><span className={`status-pill ${item.payment_status}`}>{statusTranslations[item.payment_status]}</span></td>
                      <td>
                        <div className="actions-cell">
                          {item.payment_status === 'pending' && (<button className="btn-paid-finance" onClick={() => handleMarkAsPaid(item)}>Pagar</button>)}
                          <button className="btn-delete-finance" onClick={() => handleDeleteBooking(item.id)}>Excluir</button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default AdminFinancePage;