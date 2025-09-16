// src/components/AdminBookingModal.jsx
import React, { useState, useEffect } from 'react';
import './AdminBookingModal.css';

const AdminBookingModal = ({ modalInfo, onClose, onSave, onDelete, onDeleteRule }) => {
  const [bookingData, setBookingData] = useState({});

  useEffect(() => {
    if (modalInfo.data) {
      const initialData = {
        ...modalInfo.data,
        userName: modalInfo.data.guest_name || modalInfo.data.user_name || '',
        bookingType: modalInfo.data.booking_type || 'avulso',
        paymentStatus: modalInfo.data.payment_status || 'pending',
        price: modalInfo.data.price || 0,
        note: modalInfo.data.note || ''
      };
      if (modalInfo.data.id && modalInfo.data.start_time && modalInfo.data.end_time) {
        const durationMs = new Date(modalInfo.data.end_time) - new Date(modalInfo.data.start_time);
        initialData.duration = durationMs / 60000;
      } else {
        initialData.duration = 60;
      }
      setBookingData(initialData);
    }
  }, [modalInfo]);

  if (!modalInfo.isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name === 'duration' || name === 'price' ? parseFloat(value) : value;
    setBookingData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(bookingData);
  };

  const handleDelete = () => {
    if (bookingData.id) {
      onDelete(bookingData.id);
    }
  };
  
  const handleDeleteRule = () => {
    const ruleId = bookingData.parent_booking_id || bookingData.id;
    if (ruleId) {
      onDeleteRule(ruleId);
    }
  };
  
  const isEditing = !!bookingData.id;
  const isMensalistaInstance = !!bookingData.parent_booking_id;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
        {bookingData.date && bookingData.time && <>
          <p><strong>Data:</strong> {new Date(bookingData.date).toLocaleDateString('pt-BR')}</p>
          <p><strong>Horário:</strong> {bookingData.time}</p>
        </>}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Nome do Cliente</label>
            <input type="text" name="userName" value={bookingData.userName || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Duração</label>
            {/* CORREÇÃO CRÍTICA AQUI: Os valores (value) agora são os minutos corretos */}
            <select name="duration" value={bookingData.duration || 60} onChange={handleChange} disabled={isEditing}>
              <option value={30}>30 Min</option>
              <option value={60}>1 Hora</option>
              <option value={90}>1h 30</option>
              <option value={120}>2 Horas</option>
            </select>
          </div>
          <div className="form-group">
            <label>Preço (R$)</label>
            <input type="number" name="price" step="0.01" value={bookingData.price || '0'} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Tipo</label>
            <select name="bookingType" value={bookingData.bookingType} onChange={handleChange} required disabled={isEditing && isMensalistaInstance}>
              <option value="avulso">Avulso</option>
              <option value="mensalista">Mensalista (Criar Regra)</option>
              <option value="reposicao">Reposição</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status Pagamento</label>
            <select name="paymentStatus" value={bookingData.paymentStatus} onChange={handleChange} required>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="not_required">Não Requerido</option>
            </select>
          </div>
          <div className="form-group">
            <label>Observações</label>
            <textarea name="note" value={bookingData.note || ''} onChange={handleChange} rows="2"></textarea>
          </div>
          <div className="modal-actions">
            {isEditing && !isMensalistaInstance && (
              <button type="button" onClick={handleDelete} className="btn-delete">Excluir Agendamento</button>
            )}
            {isEditing && isMensalistaInstance && (
              <button type="button" onClick={handleDelete} className="btn-delete">Excluir Somente Este Dia</button>
            )}
            {isEditing && isMensalistaInstance && (
              <button type="button" onClick={handleDeleteRule} className="btn-delete-rule">Excluir Plano Mensal</button>
            )}
            <div style={{flexGrow: 1}}></div>
            <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
            <button type="submit" className="btn-save">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminBookingModal;