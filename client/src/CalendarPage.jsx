// src/CalendarPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import DaySchedule from './components/DaySchedule';
import BookingSummary from './components/BookingSummary';
import './App.css';
import logo from './assets/arenalogo.png';

// Função auxiliar para formatar a data para o input (YYYY-MM-DD)
const formatDateForInput = (date) => {
    if (!date) return '';
    // Usa o fuso horário local para garantir que a data exibida seja a correta
    const adjustedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return adjustedDate.toISOString().split('T')[0];
};

function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Função de busca de dados, otimizada com useCallback
  const fetchBookings = useCallback(async (date) => {
    setIsLoading(true);
    setError(null);
    try {
      const dateString = formatDateForInput(date);
      const url = `http://localhost:3001/api/bookings/public?date=${dateString}`;
      const response = await axios.get(url);
      setBookings(response.data);
    } catch (err) {
      setError('Falha ao carregar os agendamentos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Efeito para definir a data COM BASE NA URL. Roda sempre que a URL muda.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dateFromUrl = params.get('date');
    let newDate;
    if (dateFromUrl) {
      // Interpreta a data da URL como se fosse local
      const [year, month, day] = dateFromUrl.split('-').map(Number);
      newDate = new Date(year, month - 1, day);
    } else {
      // Se não houver data na URL, usa a data de hoje
      newDate = new Date();
    }
    // Evita re-renderizações desnecessárias se a data já for a mesma
    if (!selectedDate || newDate.toDateString() !== selectedDate.toDateString()) {
      setSelectedDate(newDate);
    }
  }, [location.search]);

  // Efeito para buscar dados QUANDO 'selectedDate' muda.
  useEffect(() => {
    if (selectedDate) {
      setCart([]); // Limpa o carrinho ao buscar nova data
      fetchBookings(selectedDate);
    }
  }, [selectedDate, fetchBookings]);

  // Função para lidar com a mudança no seletor de data
  const handleDateChange = (event) => {
    const dateString = event.target.value;
    // Atualiza a URL, o que por sua vez vai disparar o useEffect para buscar os dados
    navigate(`/?date=${dateString}`);
  };
  
  const handleSlotClick = (time) => {
    setCart(prevCart => {
      if (prevCart.includes(time)) return prevCart.filter(t => t !== time).sort((a, b) => a.localeCompare(b));
      const newCart = [...prevCart, time].sort((a, b) => a.localeCompare(b));
      if (newCart.length > 1) {
        const [startHour, startMinute] = newCart[0].split(':').map(Number);
        let currentHour = startHour, currentMinute = startMinute;
        for (let i = 1; i < newCart.length; i++) {
          currentMinute += 30;
          if (currentMinute >= 60) { currentHour++; currentMinute -= 60; }
          const expectedSlot = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
          if (newCart[i] !== expectedSlot) return [time];
        }
      }
      return newCart;
    });
  };

  const handleClearCart = () => setCart([]);

  const handleGoToCheckout = async () => {
    const duration = cart.length * 30;
    const details = { slot: { date: selectedDate, time: cart.sort()[0] }, duration };
    sessionStorage.setItem('pendingBookingDetails', JSON.stringify(details));
    try {
      const response = await axios.post('http://localhost:3001/api/bookings/create-checkout-session', { duration, bookingDetails: details });
      window.location.href = response.data.url;
    } catch (err) { alert('Erro ao iniciar pagamento. Tente novamente.'); }
  };

  if (!selectedDate) {
    return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando...</p>;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <img src={logo} alt="Logo da Empresa" className="logo" />
        <h1>Agende seu Horário</h1>
      </header>
      <main className="main-layout">
        <section className="calendar-section">
          <div className="date-picker-container">
            <label htmlFor="date-picker">Selecione a Data:</label>
            <input type="date" id="date-picker" value={formatDateForInput(selectedDate)} onChange={handleDateChange} />
          </div>
          {isLoading ? <p>Carregando agendamentos...</p> : error ? <p className="error-message">{error}</p> : (
            <DaySchedule bookings={bookings} onSlotClick={handleSlotClick} cart={cart} />
          )}
        </section>
        <aside className="summary-section">
          <BookingSummary cart={cart} selectedDate={selectedDate} onConfirm={handleGoToCheckout} onClear={handleClearCart} />
        </aside>
      </main>
      <footer className="contact-footer">
        <p>Em caso de chuva ou necessidade de remarcação, entre em contato:</p>
        <p><strong>Telefone:</strong> (XX) 9XXXX-XXXX | <strong>Email:</strong> seuemail@exemplo.com</p>
      </footer>
    </div>
  );
}

export default CalendarPage;