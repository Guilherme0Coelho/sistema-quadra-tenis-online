// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from '../components/Calendar';
import AdminBookingModal from '../components/AdminBookingModal';
import '../App.css';

const formatDateForAPI = (date) => new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

const getStartOfWeek = (date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  const day = newDate.getDay();
  const diff = newDate.getDate() - day;
  return new Date(newDate.setDate(diff));
};

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [weekStartDate, setWeekStartDate] = useState(getStartOfWeek(new Date()));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalInfo, setModalInfo] = useState({ isOpen: false, data: null });
  const token = localStorage.getItem('token');
const API_BASE_URL = 'https://arena-floriano.onrender.com';

  const fetchAdminBookingsForWeek = async () => {
    setIsLoading(true); setError('');
    try {
      const dateString = formatDateForAPI(weekStartDate);
      const url = `${API_BASE_URL}/api/bookings/admin?startDate=${dateString}`;
      const response = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
      setBookings(response.data);
    } catch (err) { setError('Falha ao carregar agendamentos.'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchAdminBookingsForWeek(); }, [weekStartDate]);

  const goToPreviousWeek = () => setWeekStartDate(prev => { const d = new Date(prev); d.setDate(prev.getDate() - 7); return d; });
  const goToNextWeek = () => setWeekStartDate(prev => { const d = new Date(prev); d.setDate(prev.getDate() + 7); return d; });
  
  const handleSlotClick = (dayDate, time, booking) => {
    if (booking) {
      setModalInfo({ isOpen: true, data: { ...booking, date: new Date(booking.start_time), time: `${new Date(booking.start_time).getHours().toString().padStart(2, '0')}:${new Date(booking.start_time).getMinutes().toString().padStart(2, '0')}` } });
    } else {
      setModalInfo({ isOpen: true, data: { date: dayDate, time: time } });
    }
  };

  const handleCloseModal = () => setModalInfo({ isOpen: false, data: null });

  const handleSaveBooking = async (formData) => {
    try {
      const isEditing = !!formData.id;
      if (isEditing) {
        const updateData = { paymentStatus: formData.paymentStatus, price: formData.price, note: formData.note, guestName: formData.userName };
        await axios.put(`${API_BASE_URL}/api/bookings/admin/${formData.id}`, updateData, { headers: { 'Authorization': `Bearer ${token}` } });
      } else {
        const [hour, minute] = formData.time.split(':').map(Number);
        const startTime = new Date(formData.date);
        startTime.setHours(hour, minute, 0, 0); 
        const durationInMs = (formData.duration || 60) * 60000;
        const endTime = new Date(startTime.getTime() + durationInMs); 
        const newBookingData = {
          userId: null, courtId: 1, 
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(), 
          bookingType: formData.bookingType,
          paymentStatus: formData.paymentStatus, 
          isRecurring: formData.bookingType === 'mensalista',
          guestName: formData.userName, price: formData.price || 0, note: formData.note
        };
        await axios.post(`${API_BASE_URL}/api/bookings/admin`, newBookingData, { headers: { 'Authorization': `Bearer ${token}` } });
      }
      handleCloseModal();
      fetchAdminBookingsForWeek();
    } catch (err) { alert("Erro ao salvar o agendamento."); console.error(err); }
  };
  
  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Isso excluirá o agendamento deste dia. Deseja continuar?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/bookings/admin/${bookingId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        handleCloseModal();
        fetchAdminBookingsForWeek();
      } catch (err) { alert("Erro ao excluir o agendamento."); }
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (window.confirm('Atenção! Isso excluirá a REGRA do mensalista e todos os seus futuros agendamentos. Deseja continuar?')) {
        try {
            await axios.delete(`${API_BASE_URL}/api/bookings/admin/${ruleId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            handleCloseModal();
            fetchAdminBookingsForWeek();
        } catch(err) {
            alert("Erro ao excluir a regra do mensalista.");
        }
    }
  };
  
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);

  return (
    <div className="admin-dashboard-container">
      <div className="week-navigation">
        <button onClick={goToPreviousWeek}>&larr; Semana Anterior</button>
        <h2>Agenda de {weekStartDate.toLocaleDateString('pt-BR')} até {weekEndDate.toLocaleDateString('pt-BR')}</h2>
        <button onClick={goToNextWeek}>Próxima Semana &rarr;</button>
      </div>
      {isLoading ? <p style={{textAlign: 'center'}}>Carregando...</p> : error ? <p className="error-message">{error}</p> : (
        <Calendar 
          bookings={bookings}
          isAdmin={true}
          weekStartDate={weekStartDate}
          onSlotClick={handleSlotClick}
        />
      )}
      <AdminBookingModal 
        modalInfo={modalInfo}
        onClose={handleCloseModal}
        onSave={handleSaveBooking}
        onDelete={handleDeleteBooking}
        onDeleteRule={handleDeleteRule}
      />
    </div>
  );
};
export default AdminDashboard;